"use client";

import Link from "next/link";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";

export function Header() {
  const { theme, toggleTheme } = useTheme();

  const colors = themeColors[theme];

  return (
    <header
      style={{
        backgroundColor: colors.elevatedSurface,
        borderBottom: `1px solid ${colors.accent}80`,
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "12px 16px",

          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexDirection: "row",
            justifySelf: "start",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              // gap: "8px",
            }}
          >
            <img
              src="logo.png"
              alt="Bitpot Logo"
              style={{
                width: "48px",
                height: "48px",
                objectFit: "contain",
                marginRight: "12px",
              }}
            />

            <span style={{ color: colors.secondary }}>Bit</span>
            <span style={{ color: colors.primary }}>Pot</span>
          </Link>
        </div>

        {/* CENTER */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "32px",
            justifySelf: "center",
          }}
        >
          <Link
            href="/pool"
            style={{
              color: colors.textSecondary,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Pool
          </Link>

          <Link
            href="/winners"
            style={{
              color: colors.textSecondary,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Winners
          </Link>

          <Link
            href="/demo"
            style={{
              color: colors.textSecondary,
              fontWeight: 700,
              fontSize: "1rem",
              textDecoration: "none",
            }}
          >
            Demo
          </Link>
        </nav>

        {/* RIGHT */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            justifySelf: "end",
          }}
        >
          <div
            onClick={toggleTheme}
            style={{
              width: "40px",
              height: "24px",
              backgroundColor:
                theme === "dark" ? colors.secondary : colors.primary,
              borderRadius: "12px",
              cursor: "pointer",
              position: "relative",
              transition: "background-color 0.2s ease",
              marginRight: "18px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "2px",
                left: theme === "dark" ? "20px" : "2px",
                width: "19px",
                height: "21px",
                backgroundColor: colors.surface,
                borderRadius: "50%",
                transition: "left 0.2s ease",
              }}
            ></div>
          </div>

          <ConnectWallet />
        </div>
      </div>
    </header>
  );
}
