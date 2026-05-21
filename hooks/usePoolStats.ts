"use client";

import { useReadContract } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function usePoolStats() {
  const totalPrincipal = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "totalPrincipalWad",
  });

  const depositorCount = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "getDepositorCount",
  });

  return {
    totalPrincipal: totalPrincipal.data,
    depositorCount: depositorCount.data,
  };
}