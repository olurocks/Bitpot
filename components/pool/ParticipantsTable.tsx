"use client";

import { useParticipants } from "@/hooks/useParticipants";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { formatUnits } from "viem";
import { useState } from "react";
import { PlayerModal } from "../PlayerModal";
import { FileX } from "lucide-react";

function shorten(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

type SortKey = "deposit" | "odds";

export function ParticipantsTable() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const { participants, count, isLoading } = useParticipants();
  const [sortBy, setSortBy] = useState<SortKey>("odds");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<`0x${string}` | null>(
    null,
  );

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(address);
    setTimeout(() => setCopied(null), 1500);
  };

  const sorted = [...participants].sort((a, b) => {
    if (sortBy === "deposit") return b.depositWad > a.depositWad ? 1 : -1;
    return b.oddsPercent - a.oddsPercent;
  });

  const SortBtn = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => setSortBy(k)}
      style={{
        backgroundColor: sortBy === k ? `${colors.primary}22` : "transparent",
        color: sortBy === k ? colors.primary : colors.textSecondary,
        border: `1px solid ${sortBy === k ? colors.primary + "55" : colors.cardBorder}`,
        borderRadius: "999px",
        padding: "5px 14px",
        fontSize: "0.75rem",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <section style={{ marginTop: "48px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "12px",
          paddingInline: "140px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.4rem",
              fontWeight: 800,
              color: colors.textPrimary,
              margin: "0 0 4px",
              letterSpacing: "-0.02em",
            }}
          >
            Participants
          </h2>
          <p
            style={{
              color: colors.textSecondary,
              fontSize: "0.85rem",
              margin: 0,
            }}
          >
            active depositor{count !== 1 ? "s" : ""} : {count}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <SortBtn k="odds" label="Sort by Odds" />
          <SortBtn k="deposit" label="Sort by Deposit" />
        </div>
      </div>

      <div
        style={{
          maxWidth: "90%",
          margin: "0 auto",
          paddingInline: "32px",
        }}
      >
        <div
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "24px",
            overflow: "hidden",
          }}
        >
          {/* table header */}
          {participants.length > 0 && (
            // REPLACE the entire header inner map with this:
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 38px 1fr 180px 120px",
                padding: "12px 24px",
                borderBottom: `1px solid ${colors.cardBorder}`,
                backgroundColor: colors.elevatedSurface,
              }}
            >
              {["#", "", "Address", "Deposit (MUSD)", "Win Odds"].map((h) => (
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
          )}

          {isLoading ? (
            <div
              style={{
                padding: "40px",
                textAlign: "center",
                color: colors.textSecondary,
                fontSize: "0.9rem",
              }}
            >
              Loading participants...
            </div>
          ) : participants.length === 0 ? (
            <div
              style={{
                padding: "56px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>🏊</span>
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                No depositors yet — be the first to join the pool.
              </p>
            </div>
          ) : (
            sorted.map((p, i) => {
              const depositDisplay = Number(
                formatUnits(p.depositWad, 18),
              ).toLocaleString(undefined, { maximumFractionDigits: 4 });

              const barWidth = Math.min(p.oddsPercent * 2, 100);

              return (
                <div
                  key={p.address}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 180px 120px",
                    padding: "20px 30px",
                    borderBottom:
                      i < sorted.length - 1
                        ? `1px solid ${colors.cardBorder}`
                        : "none",
                    alignItems: "center",
                    transition: "background-color 0.15s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = `${colors.accent}08`)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  onClick={() => setSelectedAddress(p.address)}
                >
                  {/* rank */}
                  <span
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: i === 0 ? colors.reward : colors.textTertiary,
                    }}
                  >
                    {i === 0
                      ? "🥇"
                      : i === 1
                        ? "🥈"
                        : i === 2
                          ? "🥉"
                          : `#${i + 1}`}
                  </span>

                  {/* address */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      justifySelf: "start",
                    }}
                  >
                    <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
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
                        width: "30px",
                        height: "30px",
                        objectFit: "contain",
                      }}
                    />{" "}
                  </div>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: colors.secondary,
                        textAlign: "center",
                        justifySelf: "center",
                      }}
                    >
                      {shorten(p.address)}
                    </span>
                    <button
                      onClick={() => handleCopy(p.address)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "0.72rem",
                        color:
                          copied === p.address
                            ? colors.accent
                            : colors.textTertiary,
                        padding: "2px 6px",
                        fontWeight: 600,
                      }}
                    >
                      {copied === p.address ? "✓" : "copy"}
                    </button>
                  </div>

                  {/* deposit */}
                  <span
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: colors.textPrimary,
                      textAlign: "center",
                    }}
                  >
                    {depositDisplay}
                  </span>

                  {/* odds bar */}
                  <div>
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: colors.primary,
                        marginBottom: "4px",
                        alignItems: "center",
                      }}
                    >
                      {p.oddsPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      <PlayerModal
        address={selectedAddress}
        onClose={() => setSelectedAddress(null)}
      />
    </section>
  );
}
