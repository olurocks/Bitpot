import { readContract } from "wagmi/actions";
import { contractConfig } from "./contracts";
import { createConfig, http } from "wagmi";
import { mezoTestnet } from "wagmi/chains";

const config = createConfig({
  chains: [mezoTestnet],
  transports: {
    [mezoTestnet.id]: http(),
  },
});

async function main() {
  const data = await readContract(config, {
    ...contractConfig,
    functionName: "mezo",
  });
  console.log("Result:", data);
}

main().catch(console.error);