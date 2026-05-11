"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function usePendingPrize() {
  return useReadContract({
    address: CONTRACTS.prizePool,
    abi: prizePoolAbi,
    functionName: "pendingPrize",
    query: {
      refetchInterval: 5000,
    },
  });
}
