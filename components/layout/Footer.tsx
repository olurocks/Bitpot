"use client";

import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";

export function Footer() {
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: `1px solid ${colors.cardBorder}`,
        backgroundColor: colors.elevatedSurface,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          maxWidth: "1152px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.75rem",
            color: colors.textTertiary,
            margin: 0,
            opacity: 0.6,
          }}
        >
          © {year} BitPot. Built on Mezo.
        </p>
      </div>
    </footer>
  );
}