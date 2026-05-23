"use client";

import Link from "next/link";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const colors = themeColors[theme];

  const [menuOpen, setMenuOpen] = useState(false);
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

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/pool", label: "Pool" },
    { href: "/winners", label: "Winners" },
    { href: "/profile", label: "My Stats" },
    { href: "/leaderboard", label: "Leaderboard" },
  ];

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor:
          theme === "dark"
            ? "rgba(18, 32, 56, 0.72)"
            : "rgba(252, 252, 253, 0.72)",
        borderBottom: `1px solid ${colors.accent}40`,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1152px",
          margin: "0 auto",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        {/* LOGO */}
        <Link
          href="/"
          style={{
            fontSize: "1.5rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/logo.png"
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

        {/* DESKTOP */}
        {!isMobile && (
          <>
            <nav
              style={{
                display: "flex",
                alignItems: "center",
                gap: "32px",
              }}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: colors.textSecondary,
                    fontWeight: 700,
                    fontSize: "1rem",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Theme toggle */}
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
                  transition: "0.2s ease",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "2px",
                    left: theme === "dark" ? "20px" : "2px",
                    width: "19px",
                    height: "20px",
                    backgroundColor: colors.surface,
                    borderRadius: "50%",
                    transition: "left 0.2s ease",
                  }}
                />
              </div>

              <ConnectWallet />
            </div>
          </>
        )}

        {/* MOBILE MENU BUTTON */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              color: colors.textPrimary,
              fontSize: "2rem",
            }}
          >
            ☰
          </button>
        )}
      </div>

      {/* MOBILE DROPDOWN */}
      {isMobile && menuOpen && (
        <div
          style={{
            padding: "20px",
            borderTop: `1px solid ${colors.accent}30`,
            backgroundColor: colors.surface,
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: colors.textPrimary,
                textDecoration: "none",
                fontWeight: 700,
              }}
            >
              {link.label}
            </Link>
          ))}

          {/* Theme toggle */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ color: colors.textPrimary }}>Theme</span>

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
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "2px",
                  left: theme === "dark" ? "20px" : "2px",
                  width: "19px",
                  height: "20px",
                  backgroundColor: colors.surface,
                  borderRadius: "50%",
                }}
              />
            </div>
          </div>

          {/* Wallet */}
          <ConnectWallet />
        </div>
      )}
    </header>
  );
}
