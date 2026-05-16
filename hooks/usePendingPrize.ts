"use client";

import { useReadContract } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function usePendingPrize() {
  return useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "pendingPrize",
    query: {
      refetchInterval: 5000,
    },
  });
}
