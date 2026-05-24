"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { useAccount } from "wagmi";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useEffect, useState } from "react";

export function WrongNetworkBanner() {
  const { isConnected } = useAccount();
  const { isCorrectNetwork, isSwitching, switchError, switchToMezo, targetChain } = useNetwork();
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isConnected && !isCorrectNetwork) {
      // small delay so the banner animates in after wallet connects
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [isConnected, isCorrectNetwork]);

  if (!isConnected || isCorrectNetwork) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: "70px", // below the fixed header
        left: 0,
        right: 0,
        zIndex: 90,
        display: "flex",
        justifyContent: "center",
        padding: "0 16px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backgroundColor: theme === "dark" ? "#1a0a0a" : "#fff5f5",
          border: `1px solid ${colors.error}55`,
          borderRadius: "14px",
          padding: "12px 20px",
          boxShadow:
            theme === "dark"
              ? `0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px ${colors.error}22`
              : `0 4px 24px rgba(239,68,68,0.12)`,
          maxWidth: "640px",
          width: "100%",
          pointerEvents: "all",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-8px)",
          transition: "opacity 250ms ease, transform 250ms ease",
        }}
      >
        {/* warning icon */}
        <span style={{ fontSize: "1.2rem", flexShrink: 0 }}>⚠️</span>

        {/* text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 700,
              fontSize: "0.88rem",
              color: colors.error,
              letterSpacing: "-0.01em",
            }}
          >
            Wrong network detected
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.78rem",
              color: colors.textSecondary,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Please switch to{" "}
            <strong style={{ color: colors.textPrimary }}>{targetChain.name}</strong> to use BitPot.
            {switchError && (
              <span style={{ color: colors.error }}> — {switchError}</span>
            )}
          </p>
        </div>

        {/* switch button */}
        <button
          onClick={switchToMezo}
          disabled={isSwitching}
          style={{
            flexShrink: 0,
            backgroundColor: colors.error,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "8px 16px",
            fontSize: "0.82rem",
            fontWeight: 700,
            cursor: isSwitching ? "not-allowed" : "pointer",
            opacity: isSwitching ? 0.7 : 1,
            transition: "opacity 0.15s, transform 0.15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!isSwitching) (e.currentTarget.style.transform = "scale(1.03)");
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {isSwitching ? "Switching…" : "Switch Network"}
        </button>
      </div>
    </div>
  );
}