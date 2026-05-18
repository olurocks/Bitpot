"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { parseUnits } from "viem";
import { useEffect, useCallback, useState } from "react";
import { prizePoolAbi } from "@/abi/PrizePool";
import type { Address } from "viem";

type WithdrawStatus = "idle" | "withdrawing" | "success" | "error";

export function useWithdraw(poolAddress: Address) {
  const [status, setStatus] = useState<WithdrawStatus>("idle");
  const { address } = useAccount();

  // User's current deposit in WAD (18 decimals)
  const { data: userDepositWad, refetch: refetchDeposit } = useReadContract({
    abi: prizePoolAbi,
    address: poolAddress,
    functionName: "depositsWad",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const {
    writeContract,
    data: withdrawHash,
    error: withdrawError,
    isPending: isWithdrawPending,
  } = useWriteContract();

  const { isSuccess: withdrawSuccess, isError: withdrawReceiptError } =
    useWaitForTransactionReceipt({ hash: withdrawHash });

  // Max withdrawable amount in MUSD (native units, not WAD)
  // Ensure the read contract values are treated as bigints for arithmetic
  const userDepositWadBigint = userDepositWad as unknown as bigint | undefined;
  const maxWithdrawNative = userDepositWadBigint ?? BigInt(0);

  const withdraw = useCallback(
    (amount: string) => {
      if (isWithdrawPending) return;

      const parsed = parseUnits(amount, 18);

      if (parsed > maxWithdrawNative) {
        console.error("Withdraw amount exceeds deposit");
        setStatus("error");
        return;
      }

      console.log("Withdrawing amount (native units):", parsed.toString());

      setStatus("withdrawing");
      writeContract({
        abi: prizePoolAbi,
        address: poolAddress,
        functionName: "withdraw",
        args: [parsed],
      });
    },
    [isWithdrawPending, maxWithdrawNative, poolAddress, writeContract],
  );

  useEffect(() => {
    if (withdrawSuccess) {
      setStatus("success");
      refetchDeposit();
    } else if (withdrawReceiptError || withdrawError) {
      setStatus("error");
      console.error("Withdraw error:", withdrawError ?? withdrawReceiptError);
    }
  }, [withdrawSuccess, withdrawReceiptError, withdrawError]);

  useEffect(() => {
    if (withdrawError) console.error("Write error:", withdrawError);
    if (withdrawReceiptError)
      console.error("Receipt error:", withdrawReceiptError);
  }, [withdrawError, withdrawReceiptError]);

  const reset = useCallback(() => setStatus("idle"), []);

  console.log("maxWithdrawNative", maxWithdrawNative);
  console.log("userDepositWad", userDepositWad);

  return {
    withdraw,
    withdrawHash,
    status,
    isLoading: isWithdrawPending,
    isSuccess: withdrawSuccess,
    error: withdrawError,
    maxWithdrawNative,
    userDepositWad: userDepositWadBigint,
    reset,
  };
}
