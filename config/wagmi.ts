"use client";

import { http, createConfig } from "wagmi";
import { injected, metaMask, walletConnect } from "wagmi/connectors";
import { mezoTestnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const wagmiConfig = createConfig({
  chains: [mezoTestnet],
  connectors: [
    injected(),
    metaMask(),
    ...(projectId
      ? [
          walletConnect({
            projectId,
          }),
        ]
      : []),
  ],
  transports: {
    [mezoTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});
