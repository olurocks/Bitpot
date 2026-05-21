"use client";

import { useReadContract } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";
import { useDrawHistory } from "./useDrawHistory";
import { useMemo } from "react";

export function useAllTimeStats() {
  const { data: allTimeDepositWad } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "allTimeDepositWad",
    query: { refetchInterval: 30000 },
  });

  const { data: drawCount } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "drawCount",
    query: { refetchInterval: 30000 },
  });

  const { data: depositorCount } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "getDepositorCount",
    query: { refetchInterval: 30000 },
  });

  const { draws } = useDrawHistory();

  // Sum all prizes distributed (in WAD)
  const totalPrizesWad = useMemo(
    () => draws.reduce((acc, d) => acc + d.prizeWad, BigInt(0)),
    [draws]
  );

  // Unique winners
  const uniqueWinners = useMemo(
    () => new Set(draws.map((d) => d.winner.toLowerCase())).size,
    [draws]
  );

  return {
    allTimeDepositWad: allTimeDepositWad as bigint | undefined,
    drawCount: drawCount as bigint | undefined,
    depositorCount: depositorCount as bigint | undefined,
    totalPrizesWad,
    uniqueWinners,
    totalDraws: draws.length,
  };
}