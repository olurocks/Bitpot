"use client";

import { useReadContract } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export type DrawResult = {
  drawId: bigint;
  winner: `0x${string}`;
  prizeWad: bigint;
  prizeNative: bigint;
  timestamp: bigint;
};

export function useDrawHistory() {
  const { data, isLoading, error } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "getDrawHistory",
    query: {
      refetchInterval: 15000,
    },
  });

  return {
    draws: (data as DrawResult[] | undefined) ?? [],
    isLoading,
    error,
  };
}