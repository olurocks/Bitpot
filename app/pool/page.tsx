"use client";

import { PoolStats } from "@/components/pool/PoolStats";
import { CountdownTimer } from "@/components/pool/CountdonTimer";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";

export default function PoolPage() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",

          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px",
          alignItems: "start",
        }}
      >
        <section>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "24px",
              color: colors.textPrimary,
            }}
          >
            Pool Statistics
          </h1>

          <PoolStats />
        </section>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "80px",
            }}
          ></div>
          <CountdownTimer />
        </section>
      </div>
    </main>
  );
}
