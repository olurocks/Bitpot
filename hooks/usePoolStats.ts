"use client";

import { useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function usePoolStats() {
  const totalPrincipal = useReadContract({
    address: CONTRACTS.prizePool,
    abi: prizePoolAbi,
    functionName: "totalPrincipal",
  });

  const depositorCount = useReadContract({
    address: CONTRACTS.prizePool,
    abi: prizePoolAbi,
    functionName: "getDepositorCount",
  });

  return {
    totalPrincipal: totalPrincipal.data,
    depositorCount: depositorCount.data,
  };
}