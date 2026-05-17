"use client";

import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
  useAccount,
} from "wagmi";
import { parseUnits, type Address } from "viem";
import { useEffect, useRef, useCallback, useState } from "react";
import { prizePoolAbi } from "@/abi/PrizePool";
import { erc20Abi } from "viem";
import { Addresses } from "@/config/contracts";

type DepositStatus =
  | "idle"
  | "approving"
  | "approved"
  | "depositing"
  | "success"
  | "error";

export function useDeposit(poolAddress: Address) {
  const pendingAmount = useRef<bigint | null>(null);
  const [status, setStatus] = useState<DepositStatus>("idle");

  const { address } = useAccount();

  const allowanceResult = useReadContract({
    abi: erc20Abi,
    address: Addresses.musd,
    functionName: "allowance",
    args: [
      address ?? "0x0000000000000000000000000000000000000000",
      poolAddress,
    ],
    query: { refetchInterval: 5000 },
  });

  // Approve
  const {
    writeContract: writeApprove,
    data: approveHash,
    error: approveError,
    isPending: isApprovePending,
  } = useWriteContract();

  const { isSuccess: approveSuccess, isError: approveReceiptError } =
    useWaitForTransactionReceipt({ hash: approveHash });

  // Deposit
  const {
    writeContract: writeDeposit,
    data: depositHash,
    error: depositError,
    isPending: isDepositPending,
  } = useWriteContract();

  const { isSuccess: depositSuccess } = useWaitForTransactionReceipt({
    hash: depositHash,
  });

  // Initiate deposit flow
  const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);

  const toBigInt = (value: unknown): bigint | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === "bigint") return value;
    if (typeof value === "number") return BigInt(value);
    try {
      return BigInt(String((value as any).toString()));
    } catch {
      return null;
    }
  };

  const deposit = useCallback(
    (amount: string) => {
      if (isApprovePending || isDepositPending) return;

      const parsed = parseUnits(amount, 18);
      pendingAmount.current = parsed;

      const currentAllowance = toBigInt(allowanceResult.data) ?? BigInt(0);

      if (currentAllowance >= parsed) {
        setStatus("depositing");
        writeDeposit({
          abi: prizePoolAbi,
          address: poolAddress,
          functionName: "deposit",
          args: [parsed],
        });
        return;
      }

      setStatus("approving");
      writeApprove({
        abi: erc20Abi,
        address: Addresses.musd,
        functionName: "approve",
        args: [poolAddress, MAX_UINT256],
      });
    },
    [
      allowanceResult.data,
      isApprovePending,
      isDepositPending,
      poolAddress,
      writeApprove,
      writeDeposit,
    ],
  );

  // Chain: approval confirmed → deposit
  useEffect(() => {
    if (approveSuccess && pendingAmount.current && status === "approving") {
      setStatus("depositing");
      writeDeposit({
        abi: prizePoolAbi,
        address: poolAddress,
        functionName: "deposit",
        args: [pendingAmount.current],
      });
    }
  }, [approveSuccess, status, writeDeposit, poolAddress]);

  // Status tracking
  useEffect(() => {
    if (depositSuccess) setStatus("success");
    else if (approveReceiptError || depositError || approveError)
      setStatus("error");
  }, [depositSuccess, approveReceiptError, depositError, approveError]);

  useEffect(() => {
    if (approveError) {
      console.error("Approve Error:", approveError);
    }

    if (depositError) {
      console.error("Deposit Error:", depositError);
    }

    if (approveReceiptError) {
      console.error("Approve Receipt Error:", approveReceiptError);
    }
  }, [approveError, depositError, approveReceiptError]);

  // Reset for next use
  const reset = useCallback(() => {
    pendingAmount.current = null;
    setStatus("idle");
  }, []);

  return {
    deposit,
    depositHash,
    approveHash,
    status,
    isLoading: isApprovePending || isDepositPending,
    isSuccess: depositSuccess,
    error: approveError || depositError,
    reset,
  };
}
