"use client";

import { http, createConfig } from "wagmi";
import { injected, walletConnect } from "wagmi/connectors";
import { mezoTestnet } from "./chains";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const mezoconfig = createConfig({
  chains: [mezoTestnet],
  connectors: [
    injected(),
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