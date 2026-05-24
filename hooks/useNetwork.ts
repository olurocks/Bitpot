"use client";

import { useAccount, useSwitchChain } from "wagmi";
import { useCallback, useState } from "react";
import { mezoTestnet } from "@/config/chains";

export function useNetwork() {
  // IMPORTANT: useAccount().chainId reflects the wallet's ACTUAL chain.
  // useChainId() only reflects the wagmi config store chain (always Mezo
  // since it's the only chain in the config) — never use it for this check.
  const { isConnected, chainId: walletChainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const isCorrectNetwork = !isConnected || walletChainId === mezoTestnet.id;

  const switchToMezo = useCallback(async () => {
    setSwitchError(null);
    setIsSwitching(true);
    try {
      await switchChainAsync({ chainId: mezoTestnet.id });
    } catch (err: any) {
      const msg = err?.shortMessage ?? err?.message ?? "Failed to switch network";
      setSwitchError(msg);
    } finally {
      setIsSwitching(false);
    }
  }, [switchChainAsync]);

  return {
    chainId: walletChainId,
    isCorrectNetwork,
    isSwitching,
    switchError,
    switchToMezo,
    targetChain: mezoTestnet,
  };
}