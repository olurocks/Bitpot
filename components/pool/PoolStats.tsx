"use client";

import { usePendingPrize } from "@/hooks/usePendingPrize";
import { usePoolStats } from "@/hooks/usePoolStats";
import { formatToken } from "@/lib/format";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";
import { useIsMobile } from "@/hooks/useIsMobile";

type StatProps = {
  label: string;
  colors: any;
  value: string;
};

export function PoolStats() {
  const { data: prize } = usePendingPrize() as { data: bigint | undefined };
  const { totalPrincipal, depositorCount } = usePoolStats() as {
    totalPrincipal: bigint | undefined;
    depositorCount: bigint | undefined;
  };
  const theme = useTheme();
  const colors = themeColors[theme.theme];
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        width: "100%",
        gridTemplateColumns: isMobile ? "1fr" : "1fr",
        justifyContent: "center",
      }}
    >
      <Stat label="Prize (MEZO)" value={formatToken(prize)} colors={colors} isMobile={isMobile} />
      <Stat
        label="Total Deposits (MUSD)"
        value={formatToken(totalPrincipal)}
        colors={colors}
        isMobile={isMobile}
      />
      <Stat
        label="Participants"
        value={depositorCount?.toString() || "0"}
        colors={colors}
        isMobile={isMobile}
      />
    </div>
  );
}

export function Stat({
  label,
  value,
  colors,
  isMobile,
}: StatProps & { isMobile?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "24px",
        padding: isMobile ? "20px 16px" : "24px",
        display: "flex",
        flexDirection: "column",
        width: "100%",
        maxWidth: isMobile ? "100%" : "400px",
        margin: "0 auto",
        alignItems: "center",
        gap: "10px",
        boxShadow:
          colors.background === "#07101F"
            ? "0 4px 20px rgba(0,0,0,0.25)"
            : "0 4px 20px rgba(2, 27, 82, 0.06)",
        transition: "all 0.2s ease",
      }}
    >
      {/* LABEL */}
      <span
        style={{
          fontSize: isMobile ? "0.85rem" : "0.95rem",
          fontWeight: 600,
          color: colors.textSecondary,
          letterSpacing: "0.02em",
          textAlign: "center",
        }}
      >
        {label}
      </span>

      {/* VALUE */}
      <span
        style={{
          fontSize: isMobile ? "1.6rem" : "2rem",
          fontWeight: 800,
          color: colors.textPrimary,
          letterSpacing: "-0.04em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </span>
    </div>
  );
}