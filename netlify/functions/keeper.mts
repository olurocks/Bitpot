import type { Config } from "@netlify/functions";
import { createPublicClient, createWalletClient, http, toHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mezoTestnet } from "../../config/chains";
import { prizePoolAbi } from "../../abi/PrizePool";
import { Addresses } from "../../config/contracts";
import crypto from "crypto";

const account = privateKeyToAccount(
  process.env.DRAWER_PRIVATE_KEY as `0x${string}`
);

const publicClient = createPublicClient({
  chain: mezoTestnet,
  transport: http(process.env.RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: mezoTestnet,
  transport: http(process.env.RPC_URL),
});

export default async function handler() {
  try {
    const [nextDrawTime, drawPending] = await Promise.all([
      publicClient.readContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName: "nextDrawTime",
      }),
      publicClient.readContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName: "drawPending",
      }),
    ]);

    const now = Math.floor(Date.now() / 1000);

    // Try request-draw
    if (!drawPending && now >= Number(nextDrawTime)) {
      const hash = await walletClient.writeContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName: "requestDraw",
      });
      console.log("requestDraw tx:", hash);
      return;
    }

    // Try fulfill-draw
    if (drawPending) {
      const seed = toHex(crypto.randomBytes(32));
      const hash = await walletClient.writeContract({
        address: Addresses.prizePool,
        abi: prizePoolAbi,
        functionName: "fulfillDraw",
        args: [seed],
      });
      console.log("fulfillDraw tx:", hash);
    }
  } catch (err) {
    console.error("Keeper error:", err);
  }
}

export const config: Config = {
  schedule: "* * * * *", // every 1 minute — adjust as needed
};