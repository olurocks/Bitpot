"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { useAccount } from "wagmi";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";

interface WrongNetworkOverlayProps {
  /** Only render on these path prefixes. If omitted, always renders when wrong network. */
  onlyOnPaths?: string[];
  currentPath?: string;
}

export function WrongNetworkOverlay({ onlyOnPaths, currentPath }: WrongNetworkOverlayProps) {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, isSwitching, switchError, switchToMezo, targetChain } = useNetwork();
  const { theme } = useTheme();
  const colors = themeColors[theme];

  // If path restrictions given, only show on matching paths
  if (onlyOnPaths && currentPath) {
    const matches = onlyOnPaths.some((p) => currentPath.startsWith(p));
    if (!matches) return null;
  }

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        backgroundColor:
          theme === "dark" ? "rgba(7, 16, 31, 0.85)" : "rgba(247, 248, 250, 0.85)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.error}44`,
          borderRadius: "28px",
          padding: "40px 36px",
          maxWidth: "420px",
          width: "100%",
          textAlign: "center",
          boxShadow:
            theme === "dark"
              ? `0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px ${colors.error}22`
              : `0 24px 64px rgba(239,68,68,0.12)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
        }}
      >
        {/* icon */}
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: `${colors.error}18`,
            border: `1.5px solid ${colors.error}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.8rem",
          }}
        >
          🔗
        </div>

        <div>
          <h2
            style={{
              margin: "0 0 6px",
              fontWeight: 800,
              fontSize: "1.25rem",
              letterSpacing: "-0.03em",
              color: colors.textPrimary,
            }}
          >
            Wrong Network
          </h2>
          <p
            style={{
              margin: 0,
              fontSize: "0.88rem",
              color: colors.textSecondary,
              lineHeight: 1.6,
            }}
          >
            BitPot runs on{" "}
            <strong style={{ color: colors.textPrimary }}>{targetChain.name}</strong>. Switch your
            wallet to the correct network to interact with the pool.
          </p>
        </div>

        {/* network badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: `${colors.accent}14`,
            border: `1px solid ${colors.accent}44`,
            borderRadius: "999px",
            padding: "6px 16px",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: colors.accent,
            letterSpacing: "0.04em",
          }}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              backgroundColor: colors.accent,
              display: "inline-block",
            }}
          />
          {targetChain.name} · Chain {targetChain.id}
        </div>

        {switchError && (
          <p
            style={{
              margin: 0,
              fontSize: "0.78rem",
              color: colors.error,
              fontWeight: 600,
              padding: "8px 14px",
              backgroundColor: `${colors.error}12`,
              borderRadius: "10px",
            }}
          >
            {switchError}
          </p>
        )}

        <button
          onClick={switchToMezo}
          disabled={isSwitching}
          style={{
            width: "100%",
            backgroundColor: colors.primary,
            color: colors.white,
            border: "none",
            borderRadius: "14px",
            padding: "14px",
            fontSize: "0.95rem",
            fontWeight: 700,
            cursor: isSwitching ? "not-allowed" : "pointer",
            opacity: isSwitching ? 0.7 : 1,
            transition: "opacity 0.15s, transform 0.1s",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            if (!isSwitching) e.currentTarget.style.transform = "scale(1.01)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isSwitching ? "Switching Network…" : `Switch to ${targetChain.name}`}
        </button>

        <p style={{ margin: 0, fontSize: "0.72rem", color: colors.textTertiary }}>
          If the network is not in your wallet yet, it will be added automatically.
        </p>
      </div>
    </div>
  );
}