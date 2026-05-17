import { readContract } from "wagmi/actions";
import { contractConfig } from "./contracts";
import { createConfig, http } from "wagmi";
import { mezoTestnet } from "wagmi/chains";
import { Interface } from "ethers";

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

const abi = ["constructor(address,address,address,uint256)"];

const iface = new Interface(abi);

const encoded = iface
  .encodeDeploy([
    "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
    "0x6f461c68B2c5492C0F5CCEc5a264d692aA7A8e16",
    "0xA6972f35550717280f2538EA77638B29073e3F07",
    300,
  ])
  .slice(2);

console.log(encoded);
// main().catch(console.error);