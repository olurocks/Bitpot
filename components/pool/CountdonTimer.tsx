"use client";

import { useEffect, useState, useCallback } from "react";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";
import { contractConfig } from "@/config/contracts";
import {
  useReadContract,
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from "wagmi";
import { DepositForm } from "./DepositForm";
import { formatToken } from "@/lib/format";
import { usePendingPrize } from "@/hooks/usePendingPrize";
import { usePoolStats } from "@/hooks/usePoolStats";
import { formatUnits } from "viem";
import { WithdrawForm } from "./WithdrawForm";
import { RequestDrawButton } from "./RequestDraw";

type TimerProps = {
  colors: any;
  value: string;
  label: string;
  labelSize?: string;
  valueSize?: string;
};
export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [drawReady, setDrawReady] = useState(false);
  const [isDrawTime, setIsDrawTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const [lastDrawTime, setLastDrawTime] = useState<bigint | null>(null);

  const theme = useTheme();
  const colors = themeColors[theme.theme];

  const { data: nextDrawTimestamp, refetch: refetchNextDraw } = useReadContract(
    {
      ...contractConfig,
      functionName: "nextDrawTime",
      query: { refetchInterval: 10000 },
    },
  );

  const { data: drawPending, refetch: refetchDrawPending } = useReadContract({
    ...contractConfig,
    functionName: "drawPending",
    query: { refetchInterval: 5000 },
  });

  // const toBigInt = (v: any): bigint | null => {
  //   if (v === null || v === undefined) return null;
  //   if (typeof v === "bigint") return v;
  //   if (typeof v === "number") return BigInt(Math.floor(v));
  //   try {
  //     // ethers BigNumber or numeric string
  //     return BigInt(String((v as any).toString ? (v as any).toString() : v));
  //   } catch (_) {
  //     return null;
  //   }
  // };

  const poolLocked = !!drawPending;

  //request draw when drawPending

  const pad = (v: number) => String(v).padStart(2, "0");

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "00:00:00:00";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  // Recompute countdown from nextDrawTime
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

  // Tick every second
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

  // update lastDrawTime when contract returns data
  // useEffect(() => {
  //   if (lastDraw.isLoading) {
  //     setIsLoading(true);
  //     return;
  //   }

  //   const l = toBigInt(lastDraw.data);
  //   if (l !== null) {
  //     setLastDrawTime(l);
  //     setIsLoading(false);
  //   }
  // }, [lastDraw.data, lastDraw.isLoading]);

  // compute timeLeft from lastDrawTime (draws every 5 minutes)
  // const pad = (value: number) => String(value).padStart(2, "0");

  // const formatDuration = (seconds: number) => {
  //   if (seconds <= 0) return "00:00:00:00";
  //   const days = Math.floor(seconds / 86400);
  //   const hours = Math.floor((seconds % 86400) / 3600);
  //   const minutes = Math.floor((seconds % 3600) / 60);
  //   const secs = seconds % 60;
  //   return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  // };

  // useEffect(() => {
  //   if (!isDrawTime) return;
  //   setIsLoading(true);
  //   lastDraw.refetch?.();
  // }, [isDrawTime, lastDraw.refetch]);

  // useEffect(() => {
  //   if (isLoading) return;

  //   if (isDrawTime) {
  //     setTimeLeft(0);
  //     return;
  //   }

  //   const id = setInterval(() => {
  //     setTimeLeft((prev) => {
  //       if (prev <= 1) {
  //         clearInterval(id);
  //         setIsDrawTime(true);
  //         return 0;
  //       }
  //       return prev - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(id);
  // }, [isLoading, isDrawTime]);

  return (
    <div
      style={{
        justifyContent: "center",
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        textAlign: "center",
      }}
    >
      <TimeElement
        label="Next Draw In"
        value={drawReady ? "DRAW READY" : formatDuration(timeLeft)}
        colors={colors}
        labelSize="2rem"
        valueSize={drawReady ? "3.5rem" : "7rem"}
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
      {/* Action buttons */}
      <div
        style={{
          display: "grid",
          gap: "12px",
          gridTemplateColumns: "1fr 1fr",
          marginTop: "8px",
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
        </div>{" "}
      </div>
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

              borderRadius: "32px",

              padding: "32px",

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
              borderRadius: "32px",
              padding: "32px",
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
      {/* LABEL */}
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

      {/* VALUE */}
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

function Modal({
  onClose,
  colors,
  theme,
  children,
}: {
  onClose: () => void;
  colors: any;
  theme: any;
  children: React.ReactNode;
}) {
  return (
    <div
      onClick={onClose}
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
          borderRadius: "32px",
          padding: "32px",
          boxShadow:
            theme.theme === "dark"
              ? "0 20px 60px rgba(0,0,0,0.45)"
              : "0 20px 60px rgba(2,27,82,0.12)",
        }}
      >
        {children}
        <button
          onClick={onClose}
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
  );
}
