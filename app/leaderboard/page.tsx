"use client";

import { useMemo, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useDrawHistory } from "@/hooks/useDrawHistory";
import { useParticipants } from "@/hooks/useParticipants";
import { formatToken } from "@/lib/format";
import { PlayerModal } from "@/components/PlayerModal";

// ─── helpers ─────────────────────────────────────────────────────────────────
function shorten(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

type SortKey = "wins" | "mezo" | "deposit";

// ─── medal ───────────────────────────────────────────────────────────────────
function Medal({ rank }: { rank: number }) {
  if (rank === 0) return <span style={{ fontSize: "1.3rem" }}>🥇</span>;
  if (rank === 1) return <span style={{ fontSize: "1.3rem" }}>🥈</span>;
  if (rank === 2) return <span style={{ fontSize: "1.3rem" }}>🥉</span>;
  return (
    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#7D8BA1" }}>
      #{rank + 1}
    </span>
  );
}

// ─── sort toggle ─────────────────────────────────────────────────────────────
function SortBtn({
  k, label, active, colors, onClick,
}: { k: SortKey; label: string; active: boolean; colors: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? `${colors.primary}22` : "transparent",
        color: active ? colors.primary : colors.textSecondary,
        border: `1px solid ${active ? colors.primary + "55" : colors.cardBorder}`,
        borderRadius: "999px",
        padding: "6px 16px",
        fontSize: "0.78rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

// ─── leaderboard row ─────────────────────────────────────────────────────────
function LeaderRow({
  rank, address, wins, totalMezo, depositWad, oddsPercent, colors, onClick,
}: {
  rank: number;
  address: `0x${string}`;
  wins: number;
  totalMezo: bigint;
  depositWad: bigint;
  oddsPercent: number;
  colors: any;
  onClick: () => void;
}) {
  const isTop3 = rank < 3;

  return (
    <div
      onClick={onClick}
      style={{
        display: "grid",
        gridTemplateColumns: "56px 1fr 100px 160px 140px 110px",
        padding: isTop3 ? "20px 28px" : "16px 28px",
        alignItems: "center",
        cursor: "pointer",
        transition: "background-color 0.15s",
        borderBottom: `1px solid ${colors.cardBorder}`,
        backgroundColor: isTop3
          ? rank === 0
            ? `${colors.reward}08`
            : `${colors.primary}05`
          : "transparent",
        position: "relative",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${colors.accent}0D`)}
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = isTop3
          ? rank === 0 ? `${colors.reward}08` : `${colors.primary}05`
          : "transparent")
      }
    >
      {/* left glow for #1 */}
      {rank === 0 && (
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "3px",
          background: `linear-gradient(180deg, ${colors.reward}, ${colors.primary})`,
          borderRadius: "0 2px 2px 0",
        }} />
      )}

      {/* rank */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Medal rank={rank} />
      </div>

      {/* address */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
          background: rank === 0
            ? `linear-gradient(135deg, ${colors.reward}, ${colors.primary})`
            : `linear-gradient(135deg, ${colors.primary}88, ${colors.secondary}88)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.9rem",
        }}>
          {rank === 0 ? "👑" : "👤"}
        </div>
        <div>
          <span style={{
            fontFamily: "monospace", fontSize: "0.9rem",
            fontWeight: 700, color: colors.textPrimary,
          }}>
            {shorten(address)}
          </span>
          <div style={{ fontSize: "0.72rem", color: colors.textTertiary, marginTop: "2px" }}>
            tap to view profile
          </div>
        </div>
      </div>

      {/* wins */}
      <div style={{ textAlign: "center" }}>
        <span style={{
          fontSize: wins > 0 ? "1.3rem" : "0.9rem",
          fontWeight: 800,
          color: wins > 0 ? colors.reward : colors.textTertiary,
          letterSpacing: "-0.02em",
        }}>
          {wins > 0 ? wins : "—"}
        </span>
      </div>

      {/* mezo won */}
      <div>
        <span style={{ fontSize: "0.92rem", fontWeight: 700, color: wins > 0 ? colors.reward : colors.textTertiary }}>
          {wins > 0 ? `${formatToken(totalMezo)} MEZO` : "—"}
        </span>
        {wins > 0 && (
          <div style={{ fontSize: "0.7rem", color: colors.textTertiary, marginTop: "2px" }}>
            USD price TBD
          </div>
        )}
      </div>

      {/* deposit */}
      <div>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: colors.textPrimary }}>
          {Number(depositWad) > 0
            ? `${Number(depositWad / BigInt(10 ** 18)).toLocaleString()} MUSD`
            : "—"}
        </span>
      </div>

      {/* odds */}
      <div>
        <div style={{
          fontSize: "0.85rem", fontWeight: 700,
          color: oddsPercent > 0 ? colors.primary : colors.textTertiary,
          marginBottom: "4px",
        }}>
          {oddsPercent > 0 ? `${oddsPercent.toFixed(2)}%` : "—"}
        </div>
        {oddsPercent > 0 && (
          <div style={{
            height: "3px", borderRadius: "999px",
            backgroundColor: `${colors.primary}22`, overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${Math.min(oddsPercent * 2, 100)}%`,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
              borderRadius: "999px",
            }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── empty state ─────────────────────────────────────────────────────────────
function EmptyState({ colors }: { colors: any }) {
  return (
    <div style={{
      padding: "80px 24px", textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: "16px",
    }}>
      <span style={{ fontSize: "3rem" }}>🏆</span>
      <h2 style={{ color: colors.textPrimary, fontWeight: 800, fontSize: "1.4rem", margin: 0 }}>
        No winners yet
      </h2>
      <p style={{ color: colors.textSecondary, fontSize: "0.9rem", margin: 0 }}>
        Leaderboard populates after the first draw is complete.
      </p>
    </div>
  );
}

// ─── main leaderboard page ────────────────────────────────────────────────────
export default function LeaderboardPage() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const [sortBy, setSortBy] = useState<SortKey>("wins");
  const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(null);

  const { draws, isLoading: drawsLoading } = useDrawHistory();
  const { participants, isLoading: participantsLoading } = useParticipants();

  // Build combined leaderboard: all addresses who have ever won OR are in pool
  const leaderboard = useMemo(() => {
    // aggregate wins per address
    const winMap = new Map<string, { wins: number; totalMezo: bigint }>();
    for (const draw of draws) {
      const key = draw.winner.toLowerCase();
      const existing = winMap.get(key) ?? { wins: 0, totalMezo: BigInt(0) };
      winMap.set(key, {
        wins: existing.wins + 1,
        totalMezo: existing.totalMezo + draw.prizeNative,
      });
    }

    // merge with current participants
    const allAddresses = new Set<string>([
      ...winMap.keys(),
      ...participants.map((p) => p.address.toLowerCase()),
    ]);

    const rows = Array.from(allAddresses).map((addrLower) => {
      const participant = participants.find(
        (p) => p.address.toLowerCase() === addrLower
      );
      const winData = winMap.get(addrLower) ?? { wins: 0, totalMezo: BigInt(0) };

      return {
        address: (participant?.address ?? addrLower) as `0x${string}`,
        wins: winData.wins,
        totalMezo: winData.totalMezo,
        depositWad: participant?.depositWad ?? BigInt(0),
        oddsPercent: participant?.oddsPercent ?? 0,
      };
    });

    // sort
    return rows.sort((a, b) => {
      if (sortBy === "wins") {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return b.totalMezo > a.totalMezo ? 1 : -1;
      }
      if (sortBy === "mezo") return b.totalMezo > a.totalMezo ? 1 : -1;
      return b.depositWad > a.depositWad ? 1 : -1;
    });
  }, [draws, participants, sortBy]);

  const isLoading = drawsLoading || participantsLoading;
  const totalPrizes = draws.reduce((a, d) => a + d.prizeNative, BigInt(0));

  return (
    <>
      <main style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        padding: "48px 24px",
      }}>
        <div style={{ maxWidth: "1020px", margin: "0 auto" }}>

          {/* ── header ────────────────────────────────────────────────── */}
          <div style={{ marginBottom: "36px" }}>
            <span style={{
              fontSize: "0.75rem", fontWeight: 700,
              letterSpacing: "0.12em", color: colors.primary,
              textTransform: "uppercase",
            }}>
              All-time rankings
            </span>
            <h1 style={{
              fontSize: "2.6rem", fontWeight: 900,
              letterSpacing: "-0.04em", color: colors.textPrimary,
              margin: "8px 0 10px",
            }}>
              Leaderboard
            </h1>
            <p style={{ color: colors.textSecondary, fontSize: "0.95rem", margin: 0 }}>
              Ranked by draws won. Click any row to view a player's full stats.
            </p>
          </div>

          {/* ── summary strip ─────────────────────────────────────────── */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "16px", marginBottom: "28px",
          }}>
            {[
              { label: "Players Ranked", value: leaderboard.length.toString() },
              { label: "Total Draws", value: draws.length.toString() },
              { label: "Total Prizes", value: `${formatToken(totalPrizes)} MEZO` },
            ].map((s, i) => (
              <div key={i} style={{
                backgroundColor: colors.surface,
                border: `1px solid ${colors.cardBorder}`,
                borderRadius: "16px", padding: "18px 22px",
                display: "flex", flexDirection: "column", gap: "4px",
              }}>
                <span style={{
                  fontSize: "0.75rem", fontWeight: 700,
                  color: colors.textSecondary,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  {s.label}
                </span>
                <span style={{
                  fontSize: "1.4rem", fontWeight: 800,
                  color: colors.textPrimary, letterSpacing: "-0.03em",
                }}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          {/* ── sort controls ─────────────────────────────────────────── */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <SortBtn k="wins" label="Most Wins" active={sortBy === "wins"} colors={colors} onClick={() => setSortBy("wins")} />
            <SortBtn k="mezo" label="Most MEZO" active={sortBy === "mezo"} colors={colors} onClick={() => setSortBy("mezo")} />
            <SortBtn k="deposit" label="Biggest Deposit" active={sortBy === "deposit"} colors={colors} onClick={() => setSortBy("deposit")} />
          </div>

          {/* ── table ─────────────────────────────────────────────────── */}
          <div style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "24px", overflow: "hidden",
          }}>
            {/* table header */}
            {leaderboard.length > 0 && (
              <div style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr 100px 160px 140px 110px",
                padding: "12px 28px",
                borderBottom: `1px solid ${colors.cardBorder}`,
                backgroundColor: colors.elevatedSurface,
              }}>
                {["Rank", "Address", "Wins", "MEZO Won", "Deposit", "Odds"].map((h) => (
                  <span key={h} style={{
                    fontSize: "0.72rem", fontWeight: 700,
                    color: colors.textTertiary,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    textAlign: h === "Wins" ? "center" : "left",
                  }}>
                    {h}
                  </span>
                ))}
              </div>
            )}

            {isLoading ? (
              <div style={{ padding: "48px", textAlign: "center", color: colors.textSecondary }}>
                Loading leaderboard...
              </div>
            ) : leaderboard.length === 0 ? (
              <EmptyState colors={colors} />
            ) : (
              leaderboard.map((row, i) => (
                <LeaderRow
                  key={row.address}
                  rank={i}
                  {...row}
                  colors={colors}
                  onClick={() => setSelectedAddress(row.address as `0x${string}`)}
                />
              ))
            )}
          </div>

          {leaderboard.length > 0 && (
            <p style={{
              textAlign: "center", marginTop: "16px",
              fontSize: "0.78rem", color: colors.textTertiary,
            }}>
              Tap any row to view a player's full stats
            </p>
          )}
        </div>
      </main>

      {/* ── player modal ────────────────────────────────────────────── */}
      <PlayerModal
        address={selectedAddress}
        onClose={() => setSelectedAddress(null)}
      />
    </>
  );
}