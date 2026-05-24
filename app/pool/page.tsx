"use client";

import { PoolStats } from "@/components/pool/PoolStats";
import { CountdownTimer } from "@/components/pool/CountdonTimer";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";
import { ParticipantsTable } from "@/components/pool/ParticipantsTable";
import { WrongNetworkOverlay } from "@/components/WrongNetworkOverlay";
import { useEffect, useState } from "react";

export default function PoolPage() {
  const { theme } = useTheme();
  const colors = themeColors[theme];

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* Blocks the pool UI when on wrong network */}
      <WrongNetworkOverlay />

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: colors.background,
          padding: isMobile ? "90px 16px 32px" : "110px 40px 40px",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: isMobile ? "48px" : "32px",
            alignItems: "start",
          }}
        >
          {/* LEFT */}
          <section
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? "1.7rem" : "2rem",
                fontWeight: 800,
                marginBottom: "24px",
                color: colors.textPrimary,
                textAlign: "center",
              }}
            >
              Pool Statistics
            </h1>

            <PoolStats />
          </section>

          <section>
            <CountdownTimer />
          </section>
        </div>

        <ParticipantsTable />
      </main>
    </>
  );
}
