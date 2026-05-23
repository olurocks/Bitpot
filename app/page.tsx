"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { useAllTimeStats } from "@/hooks/useAllTimeStats";
import { formatToken } from "@/lib/format";
import {  useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

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

function HowItWorks({ colors }: { colors: any }) {
  const { theme } = useTheme();
  const steps = [
    {
      icon: "https://s2.coinmarketcap.com/static/img/coins/64x64/37163.png",
      title: "Deposit MUSD",
      desc: "Add your Bitcoin-backed MUSD to the prize pool. No lock-ups, withdraw anytime.",
    },
    {
      icon: { light: "/chart.png", dark: "/chart-white.svg" },
      title: "Yield Accrues",
      desc: "Your MUSD earns yield in Mezo's institutional-grade vault — managed by August.",
    },
    {
      icon: { light: "/casino-black.png", dark: "/casino-white.png" },
      title: "Draw Happens",
      desc: "At each interval, a provably fair draw selects a winner weighted by deposit size and time held.",
    },
    {
      icon: { light: "/winner-black.svg", dark: "/winner-white.svg" },
      title: "Winner Gets Prize",
      desc: "The winner receives all accrued MEZO rewards. Everyone else keeps their full principal.",
    },
  ];

  return (
    <div style={{ position: "relative" }}>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
                border: `2px solid ${colors.accent}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                position: "relative",
                zIndex: 1,
                backdropFilter: "blur(8px)",
                padding: "8px",
              }}
            >
              <img
                src={
                  typeof s.icon === "string"
                    ? s.icon
                    : s.icon[theme === "light" ? "light" : "dark"]
                }
                alt={s.title}
                style={{ overflow: "hidden" }}
              />
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

function WhyMezo({ colors }: { colors: any }) {
  const { theme } = useTheme();
  // const isMobile = useIsMobile();
  const points = [
    {
      icon: { light: "/bitcoin-black.svg", dark: "/bitcoin-white.svg" },
      title: "Bitcoin-Backed Yield",
      desc: "MUSD is collateralized by Bitcoin and redeemable back to BTC. Your savings stay Bitcoin-aligned — no synthetic substitutes.",
    },
    {
      icon: "/enterprise.svg",
      title: "Institutional-Grade Vault",
      desc: "The MUSD vault is managed by August, a DeFi prime brokerage processing $7B+ in monthly volume. Sophisticated strategies, one click.",
    },
    {
      icon: "/chart.png",
      title: "Real Yield, Not Emissions",
      desc: "MEZO rewards come from real network activity — bridging fees, swap fees, MUSD interest — not inflationary token printing.",
    },
    {
      icon: "/btc.svg",
      title: "Never Sell Your Bitcoin",
      desc: "Earn, save, and win without ever selling, wrapping, or giving up custody of your BTC. Mezo keeps Bitcoin at the center.",
    },
    {
      icon: "/economy.svg",
      title: "Circular Bitcoin Economy",
      desc: "Mezo is building BTC-backed loans, stablecoins, and yield in one ecosystem — the infrastructure layer Bitcoin always needed.",
    },
    {
      icon: "/piggy.svg",
      title: "No-Loss by Design",
      desc: "BitPot never touches your principal. Only the yield earned by the vault becomes the prize pool. You can't lose what you put in.",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "20px",
      }}
    >
      {points.map((p, i) => (
        <div
          key={i}
          style={{
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: "20px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: "10px",
            transition: "border-color 0.2s",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={
                typeof p.icon === "string"
                  ? p.icon
                  : p.icon[theme === "light" ? "light" : "dark"]
              }
              alt={p.title}
              style={{ overflow: "hidden" }}
            />{" "}
          </div>
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
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "18px",
        padding: "20px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <span
        style={{
          fontSize: "0.85rem",
          fontWeight: 600,
          color: colors.textSecondary,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: "8px",
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
          marginBottom: "20px",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function Home() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const isMobile = useIsMobile();


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
      <section
        style={{
          position: "relative",
          padding: isMobile ? "90px 16px 56px" : "100px 24px 80px",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-120px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "500px",
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
            pointerEvents: "none",
          }}
        />

        <div
          style={{ position: "relative", maxWidth: "760px", margin: "0 auto" }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: `${colors.accent}18`,
              border: `1px solid ${colors.accent}60`,
              borderRadius: "10px",
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
                letterSpacing: "0.2em",
                fontFamily: "monospace",
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
            Save MUSD.{" "}
            <span
              style={{
                color: colors.primary,
              }}
            >
              Win MEZO.
            </span>
            <br />
          </h1>

          <p
            style={{
              fontSize: "1.3rem",
              color: colors.textSecondary,
              fontWeight: "bold",
              lineHeight: 1.7,
              margin: "0 0 40px",
              maxWidth: "540px",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            BitPot is a no-loss prize savings pool on Mezo.{" "}
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              gap: "16px",
              justifyContent: "center",
              alignItems: "center",
            }}
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
                width: isMobile ? "100%" : "auto",
                maxWidth: "320px",
                textAlign: "center",
              }}
            >
              Enter the Pool
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
                width: isMobile ? "100%" : "auto",
                maxWidth: "320px",
                textAlign: "center",
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
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
          padding: isMobile ? "56px 16px" : "80px 24px",
        }}
      >
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
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
              capital.
            </p>
          </div>
          <WhyMezo colors={colors} />
        </div>
      </section>

      <section
        style={{
          textAlign: "center",
          padding: isMobile ? "90px 16px 56px" : "100px 24px 80px",
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
                color: colors.secondary,
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

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </main>
  );
}
