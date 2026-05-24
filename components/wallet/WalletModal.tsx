"use client";

import { useConnect } from "wagmi";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { WalletIcon } from "@web3icons/react/dynamic";

// Maps wagmi connector id → web3icons key
const WALLET_ICON_KEYS: Record<string, string> = {
  "app.phantom": "phantom",
  "app.keplr": "keplr",
  "app.hashpack": "hashpack",
  "com.okex.wallet": "okx-wallet",
  "com.templewallet": "temple-wallet",
  "app.backpack": "backpack",
  walletConnect: "walletconnect",
  coinbaseWalletSDK: "coinbase-wallet",
};

function getIconKey(id: string, name: string): string {
  return (
    WALLET_ICON_KEYS[id] ??
    name.toLowerCase().replace(/\s+/g, "-")
  );
}

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectors, connect, isPending } = useConnect();
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // With injected() wagmi uses EIP-6963 to discover all injected wallets
  // (MetaMask, OKX, Phantom, etc.) as separate entries — dedupe by name
  const unique = connectors.filter(
    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i,
  );

  const handleConnect = (connector: (typeof connectors)[number]) => {
    setConnectingId(connector.id);
    connect(
      { connector },
      {
        onSuccess: () => {
          setConnectingId(null);
          onClose();
        },
        onError: (err) => {
          console.error("connect error", err);
          setConnectingId(null);
        },
      },
    );
  };

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: colors.surface,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: "28px",
          overflow: "hidden",
          boxShadow:
            theme === "dark"
              ? "0 32px 80px rgba(0,0,0,0.6)"
              : "0 32px 80px rgba(2,27,82,0.18)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px 24px 16px",
            borderBottom: `1px solid ${colors.cardBorder}`,
          }}
        >
          <span
            style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: colors.textPrimary,
            }}
          >
            Connect Wallet
          </span>
          <button
            onClick={onClose}
            style={{
              background: colors.background,
              border: `1px solid ${colors.cardBorder}`,
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              color: colors.textSecondary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            padding: "20px",
          }}
        >
          {unique.map((connector) => {
            const isConnecting = connectingId === connector.id;
            const iconKey = getIconKey(connector.id, connector.name);
            // EIP-6963 connectors expose their own icon as a data URI
            const iconDataUri =
              typeof connector.icon === "string" ? connector.icon : null;

            return (
              <button
                key={connector.id}
                onClick={() => handleConnect(connector)}
                disabled={!!connectingId}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "24px 16px",
                  backgroundColor: colors.background,
                  border: `1px solid ${isConnecting ? colors.primary : colors.cardBorder}`,
                  borderRadius: "20px",
                  cursor: connectingId ? "not-allowed" : "pointer",
                  transition: "border-color 0.15s, opacity 0.15s",
                  opacity: connectingId && !isConnecting ? 0.4 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!connectingId)
                    e.currentTarget.style.borderColor = colors.primary;
                }}
                onMouseLeave={(e) => {
                  if (!isConnecting)
                    e.currentTarget.style.borderColor = colors.cardBorder;
                }}
              >
                {isConnecting ? (
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      border: `3px solid ${colors.cardBorder}`,
                      borderTopColor: colors.primary,
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                ) : iconDataUri ? (
                  // Use the connector's own icon (covers MetaMask via EIP-6963)
                  <img
                    src={iconDataUri}
                    alt={connector.name}
                    width={48}
                    height={48}
                    style={{ borderRadius: "10px", objectFit: "contain" }}
                  />
                ) : (
                  <WalletIcon name={iconKey} size={48} variant="branded" />
                )}

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: colors.textPrimary,
                    textAlign: "center",
                  }}
                >
                  {isConnecting ? "Connecting…" : connector.name}
                </span>
              </button>
            );
          })}
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.75rem",
            color: colors.textTertiary,
            padding: "0 24px 20px",
          }}
        >
          By connecting, you agree to BitPot&apos;s terms of use.
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>,
    document.body,
  );
}