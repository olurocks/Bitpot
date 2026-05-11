// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface ISavingsVault {
    function deposit(uint256 assets, address receiver) external returns (uint256 shares);
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares);
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets);
    function convertToShares(uint256 assets) external view returns (uint256 shares);
    function convertToAssets(uint256 shares) external view returns (uint256 assets);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IVaultGauge {
    function deposit(uint256 _amount) external;
    function withdraw(uint256 _amount) external;
    function getReward(address _account) external;
    function earned(address _account) external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function rewardToken() external view returns (address);
}

contract PrizePool is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;
    using SafeERC20 for IERC20Metadata;

    // --- Immutables ---
    IERC20Metadata public immutable musd;
    ISavingsVault public immutable vault;
    IVaultGauge public immutable gauge;
    IERC20Metadata public immutable mezo;

    // All principal and prize display values are normalized to 18 decimals internally.
    uint256 public immutable musdScalar;
    uint256 public immutable mezoScalar;

    // --- State ---
    uint256 public drawInterval;
    uint256 public lastDrawTime;
    uint256 public totalPrincipalWad;
    uint256 public drawCount;

    // Demo-scale safety limits.
    // Production path: remove MAX_DEPOSITORS after replacing O(n) draw logic
    // with a global accumulator + Fenwick tree.
    uint256 public constant MAX_DEPOSITORS = 100;
    uint256 public drawTimeout;

    mapping(address => uint256) public depositsWad;
    mapping(address => uint256) public userShares;

    // Hackathon time-weighted odds.
    // User draw weight = deposit amount in WAD * seconds held during the round.
    // This is finalized with an O(n) loop at draw time, which is fine for demo scale.
    // Production path: replace weightedDeposits/totalWeight finalization with a
    // global accumulator + Fenwick tree so deposits/withdrawals and winner lookup
    // are O(log n) instead of O(n).
    uint256 public roundStartTime;
    uint256 public totalWeight;
    // Weight uses WAD principal * seconds held.
    // Realistic ranges are far below uint256 max: even 1B MUSD held for years
    // remains orders of magnitude under 2^256.
    mapping(address => uint256) public weightedDeposits;
    mapping(address => uint256) public lastWeightUpdate;

    address[] public depositors;
    mapping(address => bool) public isDepositor;
    mapping(address => uint256) public depositorIndex; // 1-based index; 0 = not depositor

    // Two-step draw state.
    bool public drawPending;
    uint256 public pendingDrawId;
    uint256 public drawRequestedAt;

    struct DrawResult {
        uint256 drawId;
        address winner;
        uint256 prizeWad;
        uint256 prizeNative;
        uint256 timestamp;
    }

    DrawResult[] public drawHistory;

    // --- Events ---
    event Deposited(
        address indexed user,
        uint256 musdReceived,
        uint256 wadCredited,
        uint256 sharesMinted
    );

    event Withdrawn(
        address indexed user,
        uint256 musdRequested,
        uint256 musdReturned,
        uint256 wadDebited,
        uint256 sharesRedeemed
    );

    event DrawRequested(uint256 indexed drawId);
    event DrawCancelled(uint256 indexed drawId);

    event DrawTriggered(
        uint256 indexed drawId,
        address indexed winner,
        uint256 prizeWad,
        uint256 prizeNative
    );

    constructor(
        address _musd,
        address _vault,
        address _gauge,
        uint256 _drawInterval
    ) Ownable(msg.sender) {
        require(_musd != address(0), "musd=0");
        require(_vault != address(0), "vault=0");
        require(_gauge != address(0), "gauge=0");
        require(_drawInterval > 0, "interval=0");

        musd = IERC20Metadata(_musd);
        vault = ISavingsVault(_vault);
        gauge = IVaultGauge(_gauge);

        address rewardToken = IVaultGauge(_gauge).rewardToken();
        require(rewardToken != address(0), "reward=0");
        mezo = IERC20Metadata(rewardToken);

        uint8 musdDec = IERC20Metadata(_musd).decimals();
        uint8 mezoDec = IERC20Metadata(rewardToken).decimals();

        require(musdDec <= 18, "musd decimals > 18");
        require(mezoDec <= 18, "mezo decimals > 18");

        musdScalar = 10 ** (18 - musdDec);
        mezoScalar = 10 ** (18 - mezoDec);

        drawInterval = _drawInterval;
        drawTimeout = _drawInterval;
        lastDrawTime = block.timestamp;
        roundStartTime = block.timestamp;
    }

    // --- User Actions ---

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        require(!drawPending, "draw pending");

        _updateUserWeight(msg.sender);

        uint256 balBefore = musd.balanceOf(address(this));
        musd.safeTransferFrom(msg.sender, address(this), amount);
        uint256 received = musd.balanceOf(address(this)) - balBefore;
        require(received > 0, "no tokens received");

        musd.forceApprove(address(vault), received);

        uint256 sharesBefore = IERC20(address(vault)).balanceOf(address(this));
        vault.deposit(received, address(this));
        uint256 sharesReceived = IERC20(address(vault)).balanceOf(address(this)) - sharesBefore;
        require(sharesReceived > 0, "no shares minted");

        IERC20(address(vault)).forceApprove(address(gauge), sharesReceived);
        gauge.deposit(sharesReceived);

        uint256 wadAmount = received * musdScalar;

        depositsWad[msg.sender] += wadAmount;
        totalPrincipalWad += wadAmount;
        userShares[msg.sender] += sharesReceived;

        if (!isDepositor[msg.sender]) {
            require(depositors.length < MAX_DEPOSITORS, "too many depositors");
            _addDepositor(msg.sender);
        }

        emit Deposited(msg.sender, received, wadAmount, sharesReceived);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "amount=0");
        require(!drawPending, "draw pending");

        uint256 wadAmount = amount * musdScalar;
        require(depositsWad[msg.sender] >= wadAmount, "insufficient deposit");

        _updateUserWeight(msg.sender);

        bool fullWithdrawal = depositsWad[msg.sender] == wadAmount;

        uint256 sharesToUnstake;
        if (fullWithdrawal) {
            sharesToUnstake = userShares[msg.sender];
        } else {
            sharesToUnstake = (userShares[msg.sender] * wadAmount) / depositsWad[msg.sender];
        }

        require(sharesToUnstake > 0, "shares=0");

        depositsWad[msg.sender] -= wadAmount;
        totalPrincipalWad -= wadAmount;
        userShares[msg.sender] -= sharesToUnstake;

        gauge.withdraw(sharesToUnstake);

        uint256 userBalBefore = musd.balanceOf(msg.sender);

        // Redeem the exact shares attributed to this withdrawal.
        // This avoids asking the vault for an exact asset amount after unstaking
        // a proportional share amount, which could otherwise require more shares
        // than this user actually unstaked.
        vault.redeem(sharesToUnstake, msg.sender, address(this));

        uint256 musdReturned = musd.balanceOf(msg.sender) - userBalBefore;

        if (depositsWad[msg.sender] == 0) {
            _removeDepositor(msg.sender);
        }

        emit Withdrawn(msg.sender, amount, musdReturned, wadAmount, sharesToUnstake);
    }

    // --- Two-Step Draw ---

    function requestDraw() external nonReentrant {
        require(block.timestamp >= lastDrawTime + drawInterval, "too early");
        require(depositors.length > 0, "no depositors");
        require(!drawPending, "draw already pending");

        drawPending = true;
        drawRequestedAt = block.timestamp;
        drawCount++;
        // Cancelled draws intentionally consume an ID so each request has a unique audit trail.
        pendingDrawId = drawCount;

        emit DrawRequested(pendingDrawId);
    }

    // Demo mode: owner-supplied randomSeed.
    // Production: replace onlyOwner with the Pyth Entropy callback/authorized provider.
    function cancelDraw() external nonReentrant {
        require(drawPending, "no pending draw");
        require(block.timestamp >= drawRequestedAt + drawTimeout, "timeout not reached");

        uint256 cancelledDrawId = pendingDrawId;
        drawPending = false;
        pendingDrawId = 0;
        drawRequestedAt = 0;
        // Do not update lastDrawTime here.
        // If a draw is cancelled after timeout, the next requestDraw should be
        // immediately eligible instead of forcing users to wait another interval.

        emit DrawCancelled(cancelledDrawId);
    }

    function fulfillDraw(bytes32 randomSeed) external nonReentrant onlyOwner {
        require(drawPending, "no pending draw");
        require(randomSeed != bytes32(0), "seed=0");

        drawPending = false;
        lastDrawTime = block.timestamp;

        uint256 mezoBefore = mezo.balanceOf(address(this));
        gauge.getReward(address(this));
        uint256 prizeNative = mezo.balanceOf(address(this)) - mezoBefore;
        require(prizeNative > 0, "no prize");

        uint256 prizeWad = prizeNative * mezoScalar;

        _finalizeWeights();

        uint256 fulfilledDrawId = pendingDrawId;
        pendingDrawId = 0;
        drawRequestedAt = 0;

        address winner = _pickWinner(randomSeed, fulfilledDrawId);

        mezo.safeTransfer(winner, prizeNative);

        drawHistory.push(DrawResult({
            drawId: fulfilledDrawId,
            winner: winner,
            prizeWad: prizeWad,
            prizeNative: prizeNative,
            timestamp: block.timestamp
        }));

        emit DrawTriggered(fulfilledDrawId, winner, prizeWad, prizeNative);

        _resetRoundWeights();
    }

    // --- Views ---

    // Frontend-compatible single-value return: native MEZO amount.
    function pendingPrize() public view returns (uint256) {
        return gauge.earned(address(this));
    }

    function pendingPrizeWad() public view returns (uint256) {
        return gauge.earned(address(this)) * mezoScalar;
    }

    function nextDrawTime() public view returns (uint256) {
        return lastDrawTime + drawInterval;
    }

    function getOdds(address user) public view returns (uint256 numerator, uint256 denominator) {
        return (_previewUserWeight(user), _previewTotalWeight());
    }

    function getDepositNative(address user) public view returns (uint256) {
        return depositsWad[user] / musdScalar;
    }

    function getDepositorCount() public view returns (uint256) {
        return depositors.length;
    }

    function getDrawHistory() public view returns (DrawResult[] memory) {
        return drawHistory;
    }

    function getDrawHistoryLength() public view returns (uint256) {
        return drawHistory.length;
    }

    function getDrawHistoryPage(uint256 from, uint256 count) public view returns (DrawResult[] memory) {
        if (from >= drawHistory.length) {
            return new DrawResult[](0);
        }

        uint256 end = from + count;
        if (end > drawHistory.length) {
            end = drawHistory.length;
        }

        DrawResult[] memory result = new DrawResult[](end - from);
        for (uint256 i = from; i < end; i++) {
            result[i - from] = drawHistory[i];
        }

        return result;
    }

    // --- Owner Controls ---

    function setDrawInterval(uint256 _interval) external onlyOwner {
        require(_interval > 0, "interval=0");
        drawInterval = _interval;
    }

    function setDrawTimeout(uint256 _timeout) external onlyOwner {
        require(_timeout > 0, "timeout=0");
        drawTimeout = _timeout;
    }

    function emergencyRecoverToken(address token, uint256 amount) external onlyOwner {
        require(token != address(musd), "no musd recovery");
        require(token != address(vault), "no vault-share recovery");
        IERC20(token).safeTransfer(owner(), amount);
    }

    // --- Internal ---

    function _pickWinner(bytes32 randomSeed, uint256 drawId) internal view returns (address) {
        require(totalWeight > 0, "no weight");

        uint256 seed = uint256(keccak256(abi.encodePacked(
            randomSeed,
            totalWeight,
            depositors.length,
            drawId,
            address(this)
        )));

        uint256 target = seed % totalWeight;
        uint256 cumulative = 0;

        for (uint256 i = 0; i < depositors.length; i++) {
            cumulative += weightedDeposits[depositors[i]];
            if (target < cumulative) {
                return depositors[i];
            }
        }

        return depositors[depositors.length - 1];
    }

    function _updateUserWeight(address user) internal {
        if (!isDepositor[user]) {
            // For a brand-new depositor, this sets the starting timestamp before
            // their deposit is credited later in deposit(). That is intentional:
            // the new deposit starts earning time-weight from this block forward.
            lastWeightUpdate[user] = block.timestamp;
            return;
        }

        uint256 elapsed = block.timestamp - lastWeightUpdate[user];
        if (elapsed == 0 || depositsWad[user] == 0) {
            lastWeightUpdate[user] = block.timestamp;
            return;
        }

        uint256 addedWeight = depositsWad[user] * elapsed;
        weightedDeposits[user] += addedWeight;
        totalWeight += addedWeight;
        lastWeightUpdate[user] = block.timestamp;
    }

    function _finalizeWeights() internal {
        for (uint256 i = 0; i < depositors.length; i++) {
            _updateUserWeight(depositors[i]);
        }
    }

    function _resetRoundWeights() internal {
        totalWeight = 0;
        roundStartTime = block.timestamp;

        for (uint256 i = 0; i < depositors.length; i++) {
            address user = depositors[i];
            weightedDeposits[user] = 0;
            lastWeightUpdate[user] = block.timestamp;
        }
    }

    function _previewUserWeight(address user) internal view returns (uint256) {
        if (!isDepositor[user]) return 0;
        return weightedDeposits[user] + (depositsWad[user] * (block.timestamp - lastWeightUpdate[user]));
    }

    function _previewTotalWeight() internal view returns (uint256) {
        uint256 preview = totalWeight;
        for (uint256 i = 0; i < depositors.length; i++) {
            address user = depositors[i];
            preview += depositsWad[user] * (block.timestamp - lastWeightUpdate[user]);
        }
        return preview;
    }

    function _addDepositor(address user) internal {
        depositors.push(user);
        depositorIndex[user] = depositors.length;
        isDepositor[user] = true;
    }

    function _removeDepositor(address user) internal {
        uint256 idxPlusOne = depositorIndex[user];
        require(idxPlusOne != 0, "not depositor");

        uint256 idx = idxPlusOne - 1;
        uint256 lastIdx = depositors.length - 1;

        if (idx != lastIdx) {
            address last = depositors[lastIdx];
            depositors[idx] = last;
            depositorIndex[last] = idx + 1;
        }

        depositors.pop();
        depositorIndex[user] = 0;
        isDepositor[user] = false;
        weightedDeposits[user] = 0;
        lastWeightUpdate[user] = 0;
    }
}
