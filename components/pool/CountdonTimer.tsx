"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";
import { contractConfig } from "@/config/contracts";
import { useReadContract } from "wagmi";
import { DepositForm } from "./DepositForm";

type TimerProps = {
  colors: any;
  value: string;
  label: string;
  labelSize?: string;
  valueSize?: string;
};
export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isDrawTime, setIsDrawTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);

  const [lastDrawTime, setLastDrawTime] = useState<bigint | null>(null);

  const theme = useTheme();
  const colors = themeColors[theme.theme];

  const lastDraw = useReadContract({
    ...contractConfig,
    functionName: "lastDrawTime",
    query: { refetchInterval: 5000 },
  });

  const toBigInt = (v: any): bigint | null => {
    if (v === null || v === undefined) return null;
    if (typeof v === "bigint") return v;
    if (typeof v === "number") return BigInt(Math.floor(v));
    try {
      // ethers BigNumber or numeric string
      return BigInt(String((v as any).toString ? (v as any).toString() : v));
    } catch (_) {
      return null;
    }
  };

  // update lastDrawTime when contract returns data
  useEffect(() => {
    if (lastDraw.isLoading) {
      setIsLoading(true);
      return;
    }

    const l = toBigInt(lastDraw.data);
    if (l !== null) {
      setLastDrawTime(l);
      setIsLoading(false);
    }
  }, [lastDraw.data, lastDraw.isLoading]);

  // compute timeLeft from lastDrawTime (draws every 5 minutes)
  const pad = (value: number) => String(value).padStart(2, "0");

  const formatDuration = (seconds: number) => {
    if (seconds <= 0) return "00:00:00:00";
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  };

  useEffect(() => {
    if (lastDrawTime === null) return;

    const now = BigInt(Math.floor(Date.now() / 1000));
    const NEXT_INTERVAL = BigInt(5 * 60); // 5 minutes
    const nextDrawTime = lastDrawTime + NEXT_INTERVAL;
    const timeUntilNextDraw =
      nextDrawTime > now ? nextDrawTime - now : BigInt(0);

    setTimeLeft(Number(timeUntilNextDraw));
    setIsDrawTime(timeUntilNextDraw === BigInt(0));
    setIsLoading(false);
  }, [lastDrawTime]);

  useEffect(() => {
    if (!isDrawTime) return;
    setIsLoading(true);
    lastDraw.refetch?.();
  }, [isDrawTime, lastDraw.refetch]);

  useEffect(() => {
    if (isLoading) return;

    if (isDrawTime) {
      setTimeLeft(0);
      return;
    }

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setIsDrawTime(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isLoading, isDrawTime]);

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
        label="Last Draw Time"
        value={lastDrawTime?.toString() || "0"}
        colors={colors}
        labelSize="1.4rem"
        valueSize="2rem"
      />
      <TimeElement
        label="Next Draw In"
        value={formatDuration(timeLeft)}
        colors={colors}
        labelSize="2rem"
        valueSize="7rem"
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      ></div>

      <div
        style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }}
      >
        <button
          style={{
            backgroundColor: colors.secondary,
            color: colors.background,
            border: "none",
            padding: "12px 24px",
            fontSize: "1.2rem",
            fontWeight: 600,
            borderRadius: "24px",
            cursor: "pointer",
          }}
          onClick={() => {
            setShowDeposit(true);
          }}
        >
          Join Pool
        </button>
        <button
          style={{
            backgroundColor: colors.primary,
            color: colors.textPrimary,
            border: "none",
            padding: "12px 24px",
            fontSize: "1.2rem",
            fontWeight: 600,
            borderRadius: "24px",
            cursor: "pointer",
          }}
        >
          Exit Pool
        </button>
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
