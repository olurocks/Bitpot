"use client";

import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function useUserDeposit() {
  const { address } = useAccount();

  return useReadContract({
    address: CONTRACTS.prizePool,
    abi: prizePoolAbi,
    functionName: "deposits",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}
