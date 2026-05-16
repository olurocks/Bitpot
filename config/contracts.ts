import { prizePoolAbi } from "@/abi/PrizePool";

export const Addresses = {
  chainId: Number(process.env.NEXT_PUBLIC_CHAIN_ID || 31611),

  musd: process.env.NEXT_PUBLIC_MUSD_ADDRESS as `0x${string}`,
  vault: process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`,
  gauge: process.env.NEXT_PUBLIC_GAUGE_ADDRESS as `0x${string}`,

  prizePool: process.env.NEXT_PUBLIC_PRIZE_POOL_ADDRESS as `0x${string}`,
  mezo: process.env.NEXT_PUBLIC_MEZO_TOKEN_ADDRESS as `0x${string}`,
};

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

export const contractConfig = {
  address: Addresses.prizePool,
  abi: prizePoolAbi,
};
