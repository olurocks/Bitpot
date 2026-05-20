import { createPublicClient, createWalletClient, http, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import crypto from "crypto";

import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";
import { mezoTestnet } from "@/config/chains";

const account = privateKeyToAccount(
  process.env.DRAWER_PRIVATE_KEY as `0x${string}`
);

export const publicClient = createPublicClient({
  chain: mezoTestnet,
  transport: http(process.env.RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: mezoTestnet,
  transport: http(process.env.RPC_URL),
});

export async function requestDraw() {
  const hash = await walletClient.writeContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "requestDraw",
  });

  return hash;
}

export async function fulfillDraw() {
  const seed = toHex(crypto.randomBytes(32));

  const hash = await walletClient.writeContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "fulfillDraw",
    args: [seed],
  });

  return hash;
}