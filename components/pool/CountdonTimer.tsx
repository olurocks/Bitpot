"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";
import { contractConfig } from "@/config/contracts";
import { useReadContract, useAccount } from "wagmi";
import { DepositForm } from "./DepositForm";
import { formatToken } from "@/lib/format";
import { WithdrawForm } from "./WithdrawForm";
import { RequestDrawButton } from "./RequestDraw";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";

type TimerProps = {
  colors: any;
  value: string;
  label: string;
  labelSize?: string;
  valueSize?: string;
};

// ─── Not connected state ──────────────────────────────────────────────────────
function NotConnectedPanel({ colors }: { colors: any }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "48px 24px",
        textAlign: "center",
        width: "100%",
        maxWidth: "400px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <h2
          style={{
            color: colors.textPrimary,
            fontWeight: 800,
            fontSize: "1.3rem",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          Connect to Join or Exit
        </h2>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "0.88rem",
            lineHeight: 1.6,
            margin: 0,
            maxWidth: "280px",
          }}
        >
          Connect your wallet to deposit MUSD into the prize pool or withdraw
          your existing position.
        </p>
      </div>
      <ConnectWallet />
    </div>
  );
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [drawReady, setDrawReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const theme = useTheme();
  const colors = themeColors[theme.theme];

  const { isConnected } = useAccount();

  const { data: nextDrawTimestamp } = useReadContract({
    ...contractConfig,
    functionName: "nextDrawTime",
    query: { refetchInterval: 10000 },
  });

  const { data: drawPending } = useReadContract({
    ...contractConfig,
    functionName: "drawPending",
    query: { refetchInterval: 5000 },
  });

  const poolLocked = !!drawPending;

  const pad = (v: number) => String(v).padStart(2, "0");

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "00:00:00:00";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  const recompute = useCallback(() => {
    if (nextDrawTimestamp == null) return;
    const next = Number(nextDrawTimestamp);
    const now = Math.floor(Date.now() / 1000);
    const diff = next - now;
    if (diff <= 0) {
      setTimeLeft(0);
      setDrawReady(true);
    } else {
      setTimeLeft(diff);
      setDrawReady(false);
    }
    setIsLoading(false);
  }, [nextDrawTimestamp]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (isLoading) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setDrawReady(true);
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [isLoading]);

  const drawStatus = drawPending
    ? "⏳ Draw Requested — Awaiting Fulfillment"
    : drawReady
      ? "🎲 Draw Window Open"
      : null;

  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        textAlign: "center",
        width: "100%",
      }}
    >
      {/* Countdown always visible */}
      <TimeElement
        label="Next Draw In"
        value={drawReady ? "DRAW READY" : formatDuration(timeLeft)}
        colors={colors}
        labelSize={isMobile ? "1rem" : "2rem"}
        valueSize={
          isMobile
            ? drawReady
              ? "2rem"
              : "3rem"
            : drawReady
              ? "3.5rem"
              : "7rem"
        }
      />

      {drawStatus && (
        <span
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: drawPending ? colors.accent : colors.primary,
            backgroundColor: drawPending
              ? `${colors.accent}22`
              : `${colors.primary}22`,
            borderRadius: "999px",
            padding: "6px 16px",
          }}
        >
          {drawStatus}
        </span>
      )}

      {/* Action area — changes based on connection state */}
      {!isConnected ? (
        <NotConnectedPanel colors={colors} />
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            marginTop: "8px",
            width: "100%",
          }}
        >
          <button
            disabled={poolLocked}
            style={btnStyle(colors.secondary, colors.background)}
            onClick={() => setShowDeposit(true)}
          >
            Join Pool
          </button>
          <button
            disabled={poolLocked}
            style={btnStyle(colors.primary, colors.textPrimary)}
            onClick={() => setShowWithdraw(true)}
          >
            Exit Pool
          </button>
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <RequestDrawButton colors={colors} />
          </div>
        </div>
      )}

      {/* Deposit modal */}
      {showDeposit && (
        <div
          onClick={() => setShowDeposit(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              padding: isMobile ? "20px" : "32px",
              borderRadius: isMobile ? "22px" : "32px",
              boxShadow:
                theme.theme === "dark"
                  ? "0 20px 60px rgba(0,0,0,0.45)"
                  : "0 20px 60px rgba(2,27,82,0.12)",
            }}
          >
            <DepositForm />
            <button
              onClick={() => setShowDeposit(false)}
              style={{
                marginTop: "20px",
                width: "100%",
                backgroundColor: colors.secondary,
                color: colors.white,
                border: "none",
                borderRadius: "18px",
                padding: "14px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Withdraw modal */}
      {showWithdraw && (
        <div
          onClick={() => setShowWithdraw(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              backgroundColor: colors.surface,
              border: `1px solid ${colors.cardBorder}`,
              padding: isMobile ? "20px" : "32px",
              borderRadius: isMobile ? "22px" : "32px",
              boxShadow:
                theme.theme === "dark"
                  ? "0 20px 60px rgba(0,0,0,0.45)"
                  : "0 20px 60px rgba(2,27,82,0.12)",
            }}
          >
            <WithdrawForm />
            <button
              onClick={() => setShowWithdraw(false)}
              style={{
                marginTop: "20px",
                width: "100%",
                backgroundColor: colors.secondary,
                color: colors.white,
                border: "none",
                borderRadius: "18px",
                padding: "14px",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function TimeElement({
  label,
  value,
  colors,
  labelSize,
  valueSize,
}: TimerProps) {
  return (
    <div
      style={{
        borderRadius: "24px",
        padding: "20px",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        gap: "10px",
        transition: "all 0.2s ease",
      }}
    >
      <span
        style={{
          fontSize: labelSize,
          fontWeight: 600,
          color: colors.textSecondary,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: valueSize,
          fontWeight: 700,
          color: colors.textPrimary,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function btnStyle(bg: string, color: string, disabled = false) {
  return {
    backgroundColor: bg,
    color,
    border: "none",
    padding: "12px 18px",
    fontSize: "1rem",
    fontWeight: 600 as const,
    borderRadius: "24px",
    cursor: disabled ? "not-allowed" : ("pointer" as const),
    opacity: disabled ? 0.6 : 1,
    transition: "opacity 0.2s",
  };
}