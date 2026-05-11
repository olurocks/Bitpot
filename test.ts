import { createPublicClient, http } from "viem";
import { mezoTestnet } from "./config/chains";
import { vaultGaugeAbi } from "./abi/VaultGauge";

const client = createPublicClient({
  chain: mezoTestnet,
  transport: http(process.env.NEXT_PUBLIC_RPC_URL),
});

const GAUGE = "0xA6972f35550717280f2538EA77638B29073e3F07";

async function main() {
  const token = await client.readContract({
    address: GAUGE,
    abi: [
      {
        name: "rewardToken",
        type: "function",
        stateMutability: "view",
        inputs: [],
        outputs: [{ type: "address" }],
      },
    ],
    functionName: "rewardToken",
  });

  console.log("MEZO token:", token);
}

main();