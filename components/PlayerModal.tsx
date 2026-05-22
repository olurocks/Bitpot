"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useReadContract } from "wagmi";
import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";
import { useDrawHistory } from "@/hooks/useDrawHistory";
import { formatToken } from "@/lib/format";
import { formatUnits } from "viem";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";

// ─── helpers ─────────────────────────────────────────────────────────────────
function shorten(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}
function formatDate(ts: bigint) {
  return new Date(Number(ts) * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── types ───────────────────────────────────────────────────────────────────
export type PlayerModalProps = {
  address: `0x${string}` | null;
  onClose: () => void;
};

// ─── stat pill ───────────────────────────────────────────────────────────────
function Pill({
  label,
  value,
  accent,
  colors,
}: {
  label: string;
  value: string;
  accent: string;
  colors: any;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        backgroundColor: colors.background,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "16px",
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.07em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── main modal ──────────────────────────────────────────────────────────────
export function PlayerModal({ address, onClose }: PlayerModalProps) {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const overlayRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // animate in
  useEffect(() => {
    if (address) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [address]);

  // close on escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // lock body scroll
  useEffect(() => {
    if (address) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [address]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  // ── data reads ──────────────────────────────────────────────────────────
  const { data: depositWad } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "depositsWad",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: oddsData } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "getOdds",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const { data: isDepositorData } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "isDepositor",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const isDepositor = Boolean(isDepositorData);

  const { draws } = useDrawHistory();

  const myWins = useMemo(
    () =>
      draws.filter((d) => d.winner.toLowerCase() === address?.toLowerCase()),
    [draws, address],
  );

  const totalWon = useMemo(
    () => myWins.reduce((a, d) => a + d.prizeNative, BigInt(0)),
    [myWins],
  );

  const [oddsNum, oddsDen] = (oddsData as [bigint, bigint] | undefined) ?? [
    BigInt(0),
    BigInt(1),
  ];
  const oddsPercent =
    oddsDen > BigInt(0)
      ? ((Number(oddsNum) / Number(oddsDen)) * 100).toFixed(2)
      : "0.00";

  const depositDisplay =
    depositWad != null
      ? Number(formatUnits(depositWad as bigint, 18)).toLocaleString(
          undefined,
          { maximumFractionDigits: 4 },
        )
      : "0";

  const handleCopy = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!address) return null;

  const hasPrize = myWins.length > 0;

  return (
    <>
      {/* ── overlay ─────────────────────────────────────────────────────── */}
      <div
        ref={overlayRef}
        onClick={(e) => {
          if (e.target === overlayRef.current) handleClose();
        }}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          opacity: visible ? 1 : 0,
          transition: "opacity 220ms ease",
        }}
      >
        {/* ── modal panel ───────────────────────────────────────────────── */}
        <div
          style={{
            width: "100%",
            maxWidth: "520px",
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "32px",
            overflow: "hidden",
            boxShadow:
              theme === "dark"
                ? "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                : "0 32px 80px rgba(2,27,82,0.18)",
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.97)",
            transition:
              "transform 240ms cubic-bezier(0.2,0,0,1), opacity 220ms ease",
            opacity: visible ? 1 : 0,
          }}
        >
          {/* top accent bar */}
          <div
            style={{
              height: "4px",
            }}
          />

          {/* ── header ──────────────────────────────────────────────────── */}
          <div
            style={{
              padding: "24px 28px 0",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* avatar */}
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: `1px solid ${colors.secondary}`,
                  borderColor: colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  color: colors.white,
                  flexShrink: 0,
                }}
              >
                <img
                  src={
                    theme === "light"
                      ? "/profile-black.svg"
                      : "/profile-white.svg"
                  }
                  alt="profile"
                  style={{
                    width: "18px",
                    height: "18px",
                    objectFit: "contain",
                  }}
                />{" "}
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: colors.textPrimary,
                    }}
                  >
                    {shorten(address)}
                  </span>
                  <button
                    onClick={handleCopy}
                    style={{
                      background: "none",
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: "8px",
                      padding: "3px 9px",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: copied ? colors.accent : colors.textSecondary,
                      cursor: "pointer",
                      transition: "color 0.15s",
                    }}
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "6px",
                    flexWrap: "wrap",
                  }}
                >
                  {isDepositor && (
                    <span
                      style={{
                        backgroundColor: `${colors.accent}20`,
                        color: colors.accent,
                        border: `1px solid ${colors.accent}44`,
                        borderRadius: "999px",
                        padding: "2px 10px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      ● In Pool
                    </span>
                  )}
                  {hasPrize && (
                    <span
                      style={{
                        backgroundColor: `${colors.reward}18`,
                        color: colors.reward,
                        border: `1px solid ${colors.reward}44`,
                        borderRadius: "999px",
                        padding: "2px 10px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      🏆 {myWins.length}x Winner
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* close */}
            <button
              onClick={handleClose}
              style={{
                background: `${colors.background}`,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1rem",
                color: colors.textSecondary,
                flexShrink: 0,
                transition: "background-color 0.15s",
              }}
            >
              ✕
            </button>
          </div>

          {/* ── stats pills ─────────────────────────────────────────────── */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              padding: "20px 28px",
            }}
          >
            <Pill
              label="Deposit"
              value={`${depositDisplay} MUSD`}
              accent={colors.primary}
              colors={colors}
            />
            <Pill
              label="Win Chance"
              value={`${oddsPercent}%`}
              accent={colors.accent}
              colors={colors}
            />
            <Pill
              label="Draws Won"
              value={myWins.length.toString()}
              accent={colors.secondary}
              colors={colors}
            />
            <Pill
              label="MEZO Won"
              value={`${formatToken(totalWon)}`}
              accent={colors.reward}
              colors={colors}
            />
          </div>

          {/* ── win history ─────────────────────────────────────────────── */}
          <div
            style={{
              borderTop: `1px solid ${colors.cardBorder}`,
              marginBottom: "0",
            }}
          >
            <div
              style={{
                padding: "14px 28px 10px",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: colors.textTertiary,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Win History
            </div>

            {myWins.length === 0 ? (
              <div
                style={{
                  padding: "24px 28px 28px",
                  textAlign: "center",
                  color: colors.textSecondary,
                  fontSize: "0.85rem",
                }}
              >
                No wins yet 🎯
              </div>
            ) : (
              <div style={{ maxHeight: "220px", overflowY: "auto" }}>
                {[...myWins].reverse().map((draw, i) => (
                  <div
                    key={draw.drawId.toString()}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "64px 1fr 1fr",
                      padding: "11px 28px",
                      borderTop:
                        i === 0 ? "none" : `1px solid ${colors.cardBorder}`,
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: colors.textTertiary,
                      }}
                    >
                      #{draw.drawId.toString()}
                    </span>
                    <span
                      style={{
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: colors.reward,
                      }}
                    >
                      {formatToken(draw.prizeNative)} MEZO
                    </span>
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: colors.textSecondary,
                        textAlign: "right",
                      }}
                    >
                      {formatDate(draw.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── footer ──────────────────────────────────────────────────── */}
          <div
            style={{
              padding: "16px 28px 24px",
              borderTop: `1px solid ${colors.cardBorder}`,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleClose}
              style={{
                backgroundColor: colors.secondary,
                color: colors.white,
                border: "none",
                borderRadius: "999px",
                padding: "10px 24px",
                fontWeight: 700,
                fontSize: "0.88rem",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
