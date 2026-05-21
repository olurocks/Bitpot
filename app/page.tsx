"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useAllTimeStats } from "@/hooks/useAllTimeStats";
import { formatToken } from "@/lib/format";
import { useEffect, useRef, useState } from "react";

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({
  value,
  duration = 1200,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  const start = useRef<number | null>(null);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (value === 0) return;
    start.current = null;
    const step = (ts: number) => {
      if (!start.current) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(ease * value));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// ─── How It Works graphic ─────────────────────────────────────────────────────
function HowItWorks({ colors }: { colors: any }) {
  const steps = [
    {
      icon: "💰",
      title: "Deposit MUSD",
      desc: "Add your Bitcoin-backed MUSD to the prize pool. No lock-ups, withdraw anytime.",
    },
    {
      icon: "📈",
      title: "Yield Accrues",
      desc: "Your MUSD earns yield in Mezo's institutional-grade vault — managed by August.",
    },
    {
      icon: "🎲",
      title: "Draw Happens",
      desc: "At each interval, a provably fair draw selects a winner weighted by deposit size and time held.",
    },
    {
      icon: "🏆",
      title: "Winner Gets Prize",
      desc: "The winner receives all accrued MEZO rewards. Everyone else keeps their full principal.",
    },
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* connecting line */}
      <div
        style={{
          position: "absolute",
          top: "52px",
          left: "12.5%",
          width: "75%",
          height: "2px",
          background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent}, ${colors.secondary})`,
          opacity: 0.35,
          borderRadius: "999px",
        }}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "24px",
          position: "relative",
        }}
      >
        {steps.map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: "16px",
            }}
          >
            {/* circle */}
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${colors.primary}22, ${colors.accent}22)`,
                border: `2px solid ${colors.accent}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                position: "relative",
                zIndex: 1,
                backdropFilter: "blur(8px)",
              }}
            >
              {s.icon}
              <span
                style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  backgroundColor: colors.primary,
                  color: colors.white,
                  fontSize: "0.7rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i + 1}
              </span>
            </div>
            <div>
              <p
                style={{
                  color: colors.textPrimary,
                  fontWeight: 700,
                  fontSize: "1rem",
                  margin: "0 0 6px",
                }}
              >
                {s.title}
              </p>
              <p
                style={{
                  color: colors.textSecondary,
                  fontSize: "0.85rem",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Why Mezo ─────────────────────────────────────────────────────────────────
function WhyMezo({ colors }: { colors: any }) {
  const points = [
    {
      icon: "₿",
      title: "Bitcoin-Backed Yield",
      desc: "MUSD is collateralized by Bitcoin and redeemable back to BTC. Your savings stay Bitcoin-aligned — no synthetic substitutes.",
    },
    {
      icon: "🏦",
      title: "Institutional-Grade Vault",
      desc: "The MUSD vault is managed by August, a DeFi prime brokerage processing $7B+ in monthly volume. Sophisticated strategies, one click.",
    },
    {
      icon: "⚡",
      title: "Real Yield, Not Emissions",
      desc: "MEZO rewards come from real network activity — bridging fees, swap fees, MUSD interest — not inflationary token printing.",
    },
    {
      icon: "🔒",
      title: "Never Sell Your Bitcoin",
      desc: "Earn, save, and win without ever selling, wrapping, or giving up custody of your BTC. Mezo keeps Bitcoin at the center.",
    },
    {
      icon: "🌐",
      title: "Circular Bitcoin Economy",
      desc: "Mezo is building BTC-backed loans, stablecoins, and yield in one ecosystem — the infrastructure layer Bitcoin always needed.",
    },
    {
      icon: "🛡️",
      title: "No-Loss by Design",
      desc: "BitPot never touches your principal. Only the yield earned by the vault becomes the prize pool. You can't lose what you put in.",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
      }}
    >
      {points.map((p, i) => (
        <div
          key={i}
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            transition: "border-color 0.2s",
          }}
        >
          <span style={{ fontSize: "1.6rem" }}>{p.icon}</span>
          <p
            style={{
              color: colors.textPrimary,
              fontWeight: 700,
              fontSize: "0.95rem",
              margin: 0,
            }}
          >
            {p.title}
          </p>
          <p
            style={{
              color: colors.textSecondary,
              fontSize: "0.83rem",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {p.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  colors,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  colors: any;
  accent?: string;
}) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "24px",
        padding: "28px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
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
          fontSize: "0.85rem",
          fontWeight: 600,
          color: colors.textSecondary,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "2.4rem",
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: "0.8rem", color: colors.textTertiary }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ─── Disclaimer ───────────────────────────────────────────────────────────────
function Disclaimer({ colors }: { colors: any }) {
  return (
    <div
      style={{
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "16px",
        padding: "24px 28px",
        backgroundColor: `${colors.surface}88`,
      }}
    >
      <p
        style={{
          color: colors.textSecondary,
          fontSize: "0.78rem",
          lineHeight: 1.7,
          margin: 0,
        }}
      >
        <strong style={{ color: colors.textPrimary }}>Disclaimer: </strong>
        BitPot is an experimental, no-loss prize savings protocol deployed on
        the Mezo testnet. It is provided for demonstration and hackathon
        purposes only and has not been audited. Do not deposit funds you cannot
        afford to lose. Yield and prize amounts are not guaranteed and depend on
        vault performance and network conditions. MEZO token rewards are subject
        to change. This is not financial advice. Participation is subject to the
        risks inherent in smart contract interactions, including but not limited
        to bugs, exploits, and market volatility. Always do your own research
        before interacting with any DeFi protocol.
      </p>
    </div>
  );
}

// ─── Main landing page ────────────────────────────────────────────────────────
export default function Home() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const {
    allTimeDepositWad,
    drawCount,
    depositorCount,
    totalPrizesWad,
    uniqueWinners,
    totalDraws,
  } = useAllTimeStats();

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        overflowX: "hidden",
      }}
    >
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          padding: "100px 24px 80px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* bg glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
            background: `radial-gradient(ellipse, ${colors.primary}18 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "60px",
            left: "10%",
            width: "300px",
            height: "300px",
            background: `radial-gradient(ellipse, ${colors.accent}10 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div
          style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}
        >
          {/* badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: `${colors.accent}18`,
              border: `1px solid ${colors.accent}44`,
              borderRadius: "999px",
              padding: "6px 16px",
              marginBottom: "28px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                backgroundColor: colors.accent,
                display: "inline-block",
                animation: "pulse 2s infinite",
              }}
            />
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: colors.accent,
                letterSpacing: "0.04em",
              }}
            >
              LIVE ON MEZO TESTNET
            </span>
          </div>

          <h1
            style={{
              fontSize: "clamp(2.8rem, 6vw, 4.8rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              margin: "0 0 20px",
              color: colors.textPrimary,
            }}
          >
            Save Bitcoin.{" "}
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Win Bitcoin.
            </span>
            <br />
            Never Lose a Sat.
          </h1>

          <p
            style={{
              fontSize: "1.15rem",
              color: colors.textSecondary,
              lineHeight: 1.7,
              margin: "0 0 40px",
              maxWidth: "540px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            BitPot is a no-loss prize savings pool on Mezo. Your principal is
            always safe — only the yield becomes the prize.
          </p>

          <div
            style={{ display: "flex", gap: "16px", justifyContent: "center" }}
          >
            <Link
              href="/pool"
              style={{
                backgroundColor: colors.primary,
                color: colors.white,
                padding: "16px 36px",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                display: "inline-block",
                letterSpacing: "0.01em",
              }}
            >
              Enter the Pool →
            </Link>
            <Link
              href="/winners"
              style={{
                backgroundColor: "transparent",
                color: colors.textPrimary,
                padding: "16px 36px",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "1rem",
                textDecoration: "none",
                display: "inline-block",
                border: `1.5px solid ${colors.cardBorder}`,
              }}
            >
              View Winners
            </Link>
          </div>
        </div>
      </section>

      {/* ── ALL-TIME STATS ────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
          }}
        >
          <StatCard
            label="Total Depositors"
            value={<AnimatedNumber value={Number(depositorCount ?? 0)} />}
            sub="all time"
            colors={colors}
            accent={colors.primary}
          />
          <StatCard
            label="Unique Winners"
            value={<AnimatedNumber value={uniqueWinners} />}
            sub={`across ${totalDraws} draws`}
            colors={colors}
            accent={colors.accent}
          />
          <StatCard
            label="Total Deposited"
            value={formatToken(allTimeDepositWad)}
            sub="MUSD all time"
            colors={colors}
            accent={colors.secondary}
          />
          <StatCard
            label="Prizes Distributed"
            value={formatToken(totalPrizesWad)}
            sub="MEZO · USD price TBD"
            colors={colors}
            accent={colors.reward}
          />
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 100px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: colors.primary,
              textTransform: "uppercase",
            }}
          >
            Simple by design
          </span>
          <h2
            style={{
              fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: colors.textPrimary,
              margin: "10px 0 0",
            }}
          >
            How It Works
          </h2>
        </div>
        <HowItWorks colors={colors} />
      </section>

      {/* ── WHY MEZO ─────────────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: colors.surface,
          borderTop: `1px solid ${colors.cardBorder}`,
          borderBottom: `1px solid ${colors.cardBorder}`,
          padding: "80px 24px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: colors.accent,
                textTransform: "uppercase",
              }}
            >
              Built on Bitcoin
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: colors.textPrimary,
                margin: "10px 0 12px",
              }}
            >
              Why Mezo?
            </h2>
            <p
              style={{
                color: colors.textSecondary,
                fontSize: "1rem",
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Mezo is the Bitcoin economic layer that makes BTC productive
              capital — without ever asking you to sell.
            </p>
          </div>
          <WhyMezo colors={colors} />
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section
        style={{
          textAlign: "center",
          padding: "100px 24px 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "400px",
            background: `radial-gradient(ellipse, ${colors.secondary}14 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative" }}>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 900,
              letterSpacing: "-0.04em",
              color: colors.textPrimary,
              margin: "0 0 16px",
            }}
          >
            Your principal. Always safe.
            <br />
            <span
              style={{
                background: `linear-gradient(135deg, ${colors.secondary}, ${colors.primary})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Your odds. Always improving.
            </span>
          </h2>
          <p
            style={{
              color: colors.textSecondary,
              fontSize: "1rem",
              marginBottom: "36px",
            }}
          >
            The longer you stay, the better your shot at the prize.
          </p>
          <Link
            href="/pool"
            style={{
              backgroundColor: colors.secondary,
              color: colors.white,
              padding: "18px 44px",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "1.05rem",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Join the Pool
          </Link>
        </div>
      </section>

      {/* ── DISCLAIMER ───────────────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "0 24px 60px",
        }}
      >
        <Disclaimer colors={colors} />
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}
