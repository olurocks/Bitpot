"use client";

import { useEffect, useRef, useState } from "react";
import { useReadContract } from "wagmi";
import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";
import { useDrawHistory } from "@/hooks/useDrawHistory";
import { formatToken } from "@/lib/format";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";

function shorten(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WinnerToast() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const [visible, setVisible] = useState(false);
  const [animIn, setAnimIn] = useState(false);

  const { data: drawPending } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "drawPending",
    query: { refetchInterval: 3000 },
  });

  const { draws } = useDrawHistory();
  const prevPending = useRef<boolean | undefined>(undefined);
  const prevDrawCount = useRef<number>(draws.length);

  const latestDraw = draws.length > 0 ? draws[draws.length - 1] : null;

  useEffect(() => {
    const wasPending = prevPending.current;
    const isNowPending = !!drawPending;

    // Trigger when drawPending flips from true → false AND a new draw appeared
    if (
      wasPending === true &&
      isNowPending === false &&
      draws.length > prevDrawCount.current
    ) {
      setVisible(true);
      requestAnimationFrame(() => setAnimIn(true));
      const timer = setTimeout(() => {
        setAnimIn(false);
        setTimeout(() => setVisible(false), 350);
      }, 6000);
      return () => clearTimeout(timer);
    }

    prevPending.current = isNowPending;
    prevDrawCount.current = draws.length;
  }, [drawPending, draws.length]);

  if (!visible || !latestDraw) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "28px",
        left: "50%",
        transform: `translateX(-50%) translateY(${animIn ? "0" : "24px"})`,
        opacity: animIn ? 1 : 0,
        transition: "transform 350ms cubic-bezier(0.2,0,0,1), opacity 350ms ease",
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.accent}55`,
          borderRadius: "20px",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          boxShadow:
            theme === "dark"
              ? "0 8px 32px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(2,27,82,0.14)",
          minWidth: "300px",
          maxWidth: "420px",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontSize: "1.8rem" }}>🏆</span>
        <div>
          <p
            style={{
              margin: 0,
              fontWeight: 800,
              fontSize: "0.95rem",
              color: colors.reward,
              letterSpacing: "-0.01em",
            }}
          >
            Winner selected!
          </p>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "0.82rem",
              color: colors.textSecondary,
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                color: colors.textPrimary,
                fontWeight: 700,
              }}
            >
              {shorten(latestDraw.winner)}
            </span>
            {" won "}
            <span style={{ color: colors.reward, fontWeight: 700 }}>
              {formatToken(latestDraw.prizeNative)} MEZO
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}