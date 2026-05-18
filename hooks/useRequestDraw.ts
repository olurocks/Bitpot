"use client";

import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";

type RequestDrawStatus = "idle" | "requesting" | "success" | "error";

export function useRequestDraw() {
  const [status, setStatus] = useState<RequestDrawStatus>("idle");

  const { data: drawPending, refetch: refetchDrawPending } = useReadContract({
    abi: prizePoolAbi,
    address: Addresses.prizePool,
    functionName: "drawPending",
    query: { refetchInterval: 5000 },
  });

  const { data: nextDrawTime, refetch: refetchNextDraw } = useReadContract({
    abi: prizePoolAbi,
    address: Addresses.prizePool,
    functionName: "nextDrawTime",
    query: { refetchInterval: 10000 },
  });

  const { data: depositorCount } = useReadContract({
    abi: prizePoolAbi,
    address: Addresses.prizePool,
    functionName: "getDepositorCount",
    query: { refetchInterval: 10000 },
  });

  const {
    writeContract,
    data: hash,
    error: writeError,
    isPending,
  } = useWriteContract();

  const { isSuccess, isError: receiptError } = useWaitForTransactionReceipt({ hash });

  const now = Math.floor(Date.now() / 1000);
  const drawReady =
    nextDrawTime != null && Number(nextDrawTime) <= now;
  const hasDepositors = depositorCount != null && Number(depositorCount) > 0;
  const canRequest = drawReady && hasDepositors && !drawPending;

  // Why is the button disabled?
  const disabledReason = drawPending
    ? "Draw already pending"
    : !drawReady
    ? "Draw interval not reached"
    : !hasDepositors
    ? "No depositors in pool"
    : null;

  const requestDraw = useCallback(() => {
    if (!canRequest || isPending) return;
    setStatus("requesting");
    writeContract({
      abi: prizePoolAbi,
      address: Addresses.prizePool,
      functionName: "requestDraw",
    });
  }, [canRequest, isPending, writeContract]);

  useEffect(() => {
    if (isSuccess) {
      setStatus("success");
      refetchDrawPending();
      refetchNextDraw();
    } else if (receiptError || writeError) {
      setStatus("error");
      console.error("requestDraw error:", writeError ?? receiptError);
    }
  }, [isSuccess, receiptError, writeError]);

  const reset = useCallback(() => setStatus("idle"), []);

  return {
    requestDraw,
    status,
    isPending,
    isSuccess,
    canRequest,
    disabledReason,
    drawPending: !!drawPending,
    drawReady,
    hash,
    error: writeError,
    reset,
  };
}