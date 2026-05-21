"use client";

import { useAccount } from "wagmi";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useDrawHistory } from "@/hooks/useDrawHistory";
import { useUserDeposit } from "@/hooks/useUserDeposit";
import { useReadContract } from "wagmi";
import { prizePoolAbi } from "@/abi/PrizePool";
import { Addresses } from "@/config/contracts";
import { formatToken } from "@/lib/format";
import { formatUnits } from "viem";
import Link from "next/link";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { useMemo, useState } from "react";

function shorten(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: bigint) {
  return new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function CopyButton({ text, colors }: { text: string; colors: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        background: "none",
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "8px",
        padding: "4px 10px",
        fontSize: "0.75rem",
        color: copied ? colors.accent : colors.textSecondary,
        cursor: "pointer",
        fontWeight: 600,
        transition: "all 0.15s",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ─── Not connected state ──────────────────────────────────────────────────────
function NotConnected({ colors }: { colors: any }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "100px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <span style={{ fontSize: "3rem" }}>🔌</span>
      <h2
        style={{
          color: colors.textPrimary,
          fontWeight: 800,
          fontSize: "1.6rem",
          margin: 0,
        }}
      >
        Connect your wallet
      </h2>
      <p
        style={{
          color: colors.textSecondary,
          fontSize: "0.95rem",
          maxWidth: "360px",
          lineHeight: 1.6,
          margin: 0,
        }}
      >
        Connect your wallet to view your deposit, win history, and live odds.
      </p>
      <ConnectWallet />
    </div>
  );
}

// ─── Stat box ─────────────────────────────────────────────────────────────────
function InfoBox({
  label,
  value,
  sub,
  colors,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  colors: any;
  accent?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "20px",
        padding: "22px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background: `linear-gradient(90deg, ${accent ?? colors.primary}, ${colors.accent})`,
        }}
      />
      <span
        style={{
          fontSize: "0.78rem",
          fontWeight: 600,
          color: colors.textSecondary,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1.8rem",
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "-0.03em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: "0.75rem", color: colors.textTertiary }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ─── Profile page ─────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const { address, isConnected } = useAccount();

  const { data: depositWad } = useUserDeposit();
  const { draws } = useDrawHistory();

  // odds
  const { data: oddsData } = useReadContract({
    address: Addresses.prizePool,
    abi: prizePoolAbi,
    functionName: "getOdds",
    args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const [oddsNum, oddsDen] = (oddsData as [bigint, bigint] | undefined) ?? [
    BigInt(0),
    BigInt(1),
  ];

  const oddsPercent =
    oddsDen > BigInt(0)
      ? ((Number(oddsNum) / Number(oddsDen)) * 100).toFixed(2)
      : "0.00";

  // user's wins
  const myWins = useMemo(
    () =>
      draws.filter(
        (d) => d.winner.toLowerCase() === address?.toLowerCase()
      ),
    [draws, address]
  );

  const totalWonWad = useMemo(
    () => myWins.reduce((a, d) => a + d.prizeNative, BigInt(0)),
    [myWins]
  );

  const depositDisplay =
    depositWad != null
      ? Number(formatUnits(depositWad as bigint, 18)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })
      : "0";

  const isInPool = depositWad != null && (depositWad as bigint) > BigInt(0);

  if (!isConnected || !address) {
    return (
      <main
        style={{ minHeight: "100vh", backgroundColor: colors.background }}
      >
        <NotConnected colors={colors} />
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: "880px", margin: "0 auto" }}>

        {/* ── Identity card ─────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "28px",
            padding: "32px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* gradient accent */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.secondary})`,
            }}
          />

          {/* avatar */}
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              flexShrink: 0,
            }}
          >
            {myWins.length > 0 ? "🏆" : "👤"}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "6px",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: colors.textPrimary,
                }}
              >
                {shorten(address)}
              </span>
              <CopyButton text={address} colors={colors} />
              {isInPool && (
                <span
                  style={{
                    backgroundColor: `${colors.accent}22`,
                    color: colors.accent,
                    border: `1px solid ${colors.accent}44`,
                    borderRadius: "999px",
                    padding: "3px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  ● In Pool
                </span>
              )}
            </div>
            <p
              style={{
                color: colors.textSecondary,
                fontSize: "0.85rem",
                margin: 0,
              }}
            >
              {myWins.length > 0
                ? `${myWins.length} draw${myWins.length > 1 ? "s" : ""} won · Keep holding to improve your odds`
                : isInPool
                ? "Active depositor · Odds improve the longer you stay"
                : "Not currently in the pool"}
            </p>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
            <Link
              href="/pool"
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                padding: "10px 20px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "0.85rem",
                textDecoration: "none",
              }}
            >
              {isInPool ? "Manage" : "Join Pool"}
            </Link>
          </div>
        </div>

        {/* ── Stats grid ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
            marginBottom: "28px",
          }}
        >
          <InfoBox
            label="My Deposit"
            value={depositDisplay}
            sub="MUSD"
            colors={colors}
            accent={colors.primary}
          />
          <InfoBox
            label="Win Chance"
            value={`${oddsPercent}%`}
            sub="next draw"
            colors={colors}
            accent={colors.accent}
          />
          <InfoBox
            label="Draws Won"
            value={myWins.length.toString()}
            sub="all time"
            colors={colors}
            accent={colors.secondary}
          />
          <InfoBox
            label="MEZO Won"
            value={formatToken(totalWonWad)}
            sub="total prizes"
            colors={colors}
            accent={colors.reward}
          />
        </div>

        {/* ── Win history ───────────────────────────────────────────────── */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${colors.cardBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2
              style={{
                color: colors.textPrimary,
                fontWeight: 700,
                fontSize: "1.05rem",
                margin: 0,
              }}
            >
              Win History
            </h2>
            <Link
              href="/winners"
              style={{
                fontSize: "0.82rem",
                color: colors.primary,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              All draws →
            </Link>
          </div>

          {myWins.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>🎯</span>
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                No wins yet — your odds increase the longer you stay in the pool.
              </p>
            </div>
          ) : (
            <>
              {/* table header */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr 160px 180px",
                  padding: "12px 24px",
                  borderBottom: `1px solid ${colors.cardBorder}`,
                  backgroundColor: colors.elevatedSurface,
                }}
              >
                {["Draw #", "Prize (MEZO)", "USD Value", "Date"].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: colors.textTertiary,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {[...myWins].reverse().map((draw, i) => (
                <div
                  key={draw.drawId.toString()}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 160px 180px",
                    padding: "16px 24px",
                    borderBottom:
                      i < myWins.length - 1
                        ? `1px solid ${colors.cardBorder}`
                        : "none",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: colors.textTertiary,
                    }}
                  >
                    #{draw.drawId.toString()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: colors.reward,
                    }}
                  >
                    {formatToken(draw.prizeNative)} MEZO
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: colors.textTertiary,
                      fontStyle: "italic",
                    }}
                  >
                    USD price TBD
                  </span>
                  <span style={{ fontSize: "0.82rem", color: colors.textSecondary }}>
                    {formatDate(draw.timestamp)}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}