"use client";

import { useConnect } from "wagmi";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import { WalletIcon } from "@web3icons/react/dynamic";

const WALLET_KEYS: Record<string, string> = {
  metaMask: "metamask",
  metaMaskSDK: "metamask",
  walletConnect: "walletconnect",
  coinbaseWalletSDK: "coinbase-wallet",
  injected: "wallet",
};

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectors, connect, isPending } = useConnect();
  const { theme } = useTheme();
  const colors = themeColors[theme];

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const unique = connectors.filter(
    (c, i, arr) => arr.findIndex((x) => x.name === c.name) === i,
  );

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
            const walletKey =
              WALLET_KEYS[connector.id] ??
              connector.name.toLowerCase().replace(/\s+/g, "-");

            return (
              <button
                key={connector.id}
                onClick={() => {
                  connect({ connector });
                  onClose();
                }}
                disabled={isPending}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "12px",
                  padding: "24px 16px",
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "20px",
                  cursor: isPending ? "not-allowed" : "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.borderColor = colors.primary)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.borderColor = colors.cardBorder)
                }
              >
                <WalletIcon
                  name={WALLET_KEYS[connector.id] ?? connector.name}
                  size={48}
                  variant="branded"
                />

                <span
                  style={{
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: colors.textPrimary,
                  }}
                >
                  {connector.name}
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
    </div>,
    document.body,
  );
}
