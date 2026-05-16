"use client";

import { useReadContract } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function useDrawState() {
  const drawPending = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "drawPending",
    query: { refetchInterval: 3000 },
  });

  const nextDrawTime = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "nextDrawTime",
  });

  return {
    drawPending: drawPending.data,
    nextDrawTime: nextDrawTime.data,
  };
}
