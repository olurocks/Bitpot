import { createPublicClient, createWalletClient, http, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";
import crypto from "crypto";
import { mezoTestnet } from "@/config/chains";

const account = privateKeyToAccount(process.env.DRAWER_PRIVATE_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: mezoTestnet,
  transport: http(process.env.RPC_URL),
});

const client = createWalletClient({
  account,
  chain: mezoTestnet,
  transport: http(),
});

export async function requestDraw() {
  // Optional guard to avoid unnecessary txs
  const drawPending = await publicClient.readContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "drawPending",
  });

  if (drawPending) {
    console.log("Draw already pending");
    return null;
  }

  const hash = await client.writeContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "requestDraw",
  });

  await publicClient.waitForTransactionReceipt({
    hash,
  });

  return hash;
}

export async function fulfillDraw() {
  const seed = toHex(crypto.randomBytes(32));

  const hash = await client.writeContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "fulfillDraw",
    args: [seed],
  });

  return hash;
}

export async function runKeeper() {
  try {
    const [nextDrawTime, drawPending] = await Promise.all([
      publicClient.readContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName: "nextDrawTime",
      }),

      publicClient.readContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName: "drawPending",
      }),
    ]);

    const now = Math.floor(Date.now() / 1000);

    if (now >= Number(nextDrawTime) && !drawPending) {
      await requestDraw();
    }

    const pending = await publicClient.readContract({
      address: Addresses.prizePool,
      abi: prizePoolAbi,
      functionName: "drawPending",
    });

    if (pending) {
      await fulfillDraw();
    }
  } catch (err) {
    console.error("Keeper error:", err);
  }
}