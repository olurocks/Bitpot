"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { Addresses } from "@/config/contracts";
import { prizePoolAbi } from "@/abi/PrizePool";
import { useMemo } from "react";

export type Participant = {
  address: `0x${string}`;
  depositWad: bigint;
  oddsNumerator: bigint;
  oddsDenominator: bigint;
  oddsPercent: number;
};

export function useParticipants() {
  const { data: countData } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "getDepositorCount",
    query: { refetchInterval: 10000 },
  });

  const count = countData ? Number(countData) : 0;

  const addressContracts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        address: Addresses.prizePool,
        abi: prizePoolAbi as any,
        functionName: "depositors" as const,
        args: [BigInt(i)],
      })),
    [count],
  );

  const { data: addressResults } = useReadContracts({
    contracts: addressContracts,
    query: { enabled: count > 0, refetchInterval: 10000 },
  });

  const addresses = useMemo(
    () =>
      (addressResults ?? [])
        .map((r) => r.result as `0x${string}` | undefined)
        .filter((a): a is `0x${string}` => !!a),
    [addressResults],
  );

  // 3. Batch fetch deposits + odds for each address
  const detailContracts = useMemo(
    () =>
      addresses.flatMap((addr) => [
        {
          address: Addresses.prizePool,
          abi: prizePoolAbi as any,
          functionName: "depositsWad" as const,
          args: [addr],
        },
        {
          address: Addresses.prizePool,
          abi: prizePoolAbi as any,
          functionName: "getOdds" as const,
          args: [addr],
        },
      ]),
    [addresses],
  );

  const { data: detailResults, isLoading } = useReadContracts({
    contracts: detailContracts,
    query: { enabled: addresses.length > 0, refetchInterval: 10000 },
  });

  // 4. Zip everything together
  const participants = useMemo<Participant[]>(() => {
    if (!detailResults || addresses.length === 0) return [];

    return addresses.map((address, i) => {
      const depositWad =
        (detailResults[i * 2]?.result as bigint | undefined) ?? BigInt(0);

      const oddsRaw = detailResults[i * 2 + 1]?.result as
        | [bigint, bigint]
        | undefined;

      const oddsNumerator = oddsRaw?.[0] ?? BigInt(0);
      const oddsDenominator = oddsRaw?.[1] ?? BigInt(1);

      const oddsPercent =
        oddsDenominator > BigInt(0)
          ? (Number(oddsNumerator) / Number(oddsDenominator)) * 100
          : 0;

      return {
        address,
        depositWad,
        oddsNumerator,
        oddsDenominator,
        oddsPercent,
      };
    });
  }, [addresses, detailResults]);

  return {
    participants,
    count,
    isLoading,
  };
}
