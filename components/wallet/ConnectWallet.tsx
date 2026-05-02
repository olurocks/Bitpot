"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function shorten(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, status } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  const connector = connectors[0];

  const isConnected = status === "connected";

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
      >
        {shorten(address)}
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector })}
      disabled={!connector || isPending}
      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
