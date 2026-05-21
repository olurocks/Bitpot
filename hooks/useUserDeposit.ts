"use client";

import { useAccount, useReadContract } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";

export function useUserDeposit() {
  const { address } = useAccount();

  return useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "depositsWad",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });
}
