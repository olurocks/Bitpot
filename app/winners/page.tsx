"use client";

import { useDrawHistory } from "@/hooks/useDrawHistory";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { formatToken } from "@/lib/format";
import { useState, useEffect } from "react";
import { PlayerModal } from "@/components/PlayerModal";
import { useIsMobile } from "@/hooks/useIsMobile";
import { usePagination } from "@/hooks/usePagination";
import { PaginationControls } from "@/components/PaginationControls";

function shorten(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(timestamp: bigint) {
  return new Date(Number(timestamp) * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ colors }: { colors: any }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <span style={{ fontSize: "3.5rem" }}>🎲</span>
      <h2
        style={{
          color: colors.textPrimary,
          fontWeight: 800,
          fontSize: "1.5rem",
          margin: 0,
        }}
      >
        No draws yet
      </h2>
      <p
        style={{ color: colors.textSecondary, margin: 0, fontSize: "0.95rem" }}
      >
        The first winner will appear here once the initial draw is complete.
      </p>
    </div>
  );
}

// ─── Winners page ─────────────────────────────────────────────────────────────
export default function WinnersPage() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const { draws, isLoading } = useDrawHistory();
  const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(
    null,
  );
  const isMobile = useIsMobile();

  // most recent first
  const sorted = [...draws].reverse();

  const { paginated, page, totalPages, next, prev } = usePagination(sorted, 10);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        padding: isMobile ? "28px 16px" : "48px 24px",
      }}
    >
      <div style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
        {/* header */}
        <div style={{ marginBottom: "40px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: colors.primary,
              textTransform: "uppercase",
            }}
          >
            Hall of fame
          </span>
          <h1
            style={{
              fontSize: "clamp(2rem, 8vw, 2.4rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: colors.textPrimary,
              margin: "8px 0 10px",
            }}
          >
            Winners
          </h1>
          <p
            style={{
              color: colors.textSecondary,
              fontSize: isMobile ? "0.9rem" : "0.95rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Every draw, every winner on-chain verifiable.
          </p>
        </div>

        {/* summary strip */}
        {draws.length > 0 && !isMobile && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {[
              { label: "Total Draws", value: draws.length.toString() },
              {
                label: "Total Prizes",
                value:
                  formatToken(
                    draws.reduce((a, d) => a + d.prizeNative, BigInt(0)),
                  ) + " MEZO",
              },
              {
                label: "Unique Winners",
                value: new Set(
                  draws.map((d) => d.winner.toLowerCase()),
                ).size.toString(),
              },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "16px",
                  padding: "18px 22px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",

                  alignItems: "center",
                  textAlign: "center",
                  justifyContent: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: colors.textSecondary,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {s.label}
                </span>
                <span
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    color: colors.textPrimary,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {s.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* table */}
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          {/* table header */}
          {draws.length > 0 && !isMobile && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 150px 90px 160px",
                padding: isMobile ? "12px 18px" : "14px 24px",
                borderBottom: `1px solid ${colors.cardBorder}`,
                backgroundColor: colors.elevatedSurface,
                textAlign: "center",
              }}
            >
              {["Draw ", "Winner", "Prize (MEZO)", "Odds", "Date"].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize: "0.75rem",
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
          )}

          {isLoading ? (
            <div
              style={{
                padding: "48px",
                textAlign: "center",
                color: colors.textSecondary,
              }}
            >
              Loading draw history...
            </div>
          ) : draws.length === 0 ? (
            <EmptyState colors={colors} />
          ) : (
            paginated.map((draw, i) =>
              isMobile ? (
                <div
                  key={draw.drawId.toString()}
                  onClick={() => setSelectedAddress(draw.winner)}
                  style={{
                    padding: "16px",
                    borderBottom:
                      i < paginated.length - 1
                        ? `1px solid ${colors.cardBorder}`
                        : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: colors.textPrimary,
                      }}
                    >
                      Draw #{draw.drawId.toString()}
                    </span>

                    <span
                      style={{
                        color: colors.textSecondary,
                        fontSize: "0.8rem",
                      }}
                    >
                      {formatDate(draw.timestamp)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <img src="/crown.svg" alt="winner" width={28} height={28} />

                    <span
                      style={{
                        fontFamily: "monospace",
                        color: colors.textPrimary,
                        fontWeight: 600,
                      }}
                    >
                      {shorten(draw.winner)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        color: colors.textSecondary,
                      }}
                    >
                      Prize
                    </span>

                    <span
                      style={{
                        color: colors.reward,
                        fontWeight: 700,
                      }}
                    >
                      {formatToken(draw.prizeNative)} MEZO
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  key={draw.drawId.toString()}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 160px 100px 180px",
                    padding: isMobile ? "16px 18px" : "18px 24px",
                    borderBottom:
                      i < paginated.length - 1
                        ? `1px solid ${colors.cardBorder}`
                        : "none",
                    alignItems: "center",
                    transition: "background-color 0.15s",
                    cursor: "pointer",
                    textAlign: "center",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = `${colors.accent}08`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => {
                    setSelectedAddress(draw.winner);
                  }}
                >
                  {/* draw id */}
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: colors.textTertiary,
                    }}
                  >
                    {draw.drawId.toString()}
                  </span>

                  {/* winner */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {/* avatar circle */}
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        paddingRight: "10px",
                      }}
                    >
                      <img
                        src="/crown.svg"
                        alt="profile"
                        style={{
                          // width: "18px",
                          // height: "18px",
                          objectFit: "contain",
                        }}
                      />{" "}
                    </div>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: colors.textPrimary,
                        fontFamily: "monospace",
                      }}
                    >
                      {shorten(draw.winner)}
                    </span>
                  </div>

                  {/* prize */}
                  <div>
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: colors.reward,
                      }}
                    >
                      {formatToken(draw.prizeNative)} MEZO
                    </span>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: colors.textTertiary,
                        marginTop: "2px",
                      }}
                    >
                      USD price TBD
                    </div>
                  </div>

                  {/* odds placeholder — prizeWad / totalWeight not stored per draw, show — */}
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: colors.textSecondary,
                      fontStyle: "italic",
                    }}
                  >
                    —
                  </span>

                  {/* date */}
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: colors.textSecondary,
                    }}
                  >
                    {formatDate(draw.timestamp)}
                  </span>
                </div>
              ),
            )
          )}
          <PaginationControls
            page={page}
            totalPages={totalPages}
            onNext={next}
            onPrev={prev}
            colors={colors}
          />
        </div>
      </div>
      <PlayerModal
        address={selectedAddress}
        onClose={() => setSelectedAddress(null)}
      />
    </main>
  );
}
