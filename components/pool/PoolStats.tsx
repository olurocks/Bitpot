"use client";

import { usePendingPrize } from "@/hooks/usePendingPrize";
import { usePoolStats } from "@/hooks/usePoolStats";
import { formatToken } from "@/lib/format";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";

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

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        justifyContent: "center",
      }}
    >
      {" "}
      <Stat label="Prize (MEZO)" value={formatToken(prize)} colors={colors} />
      <Stat
        label="Total Deposits (MUSD)"
        value={formatToken(totalPrincipal)}
        colors={colors}
      />
      <Stat
        label="Participants"
        value={depositorCount?.toString() || "0"}
        colors={colors}
      />
    </div>
  );
}

export function Stat({ label, value, colors }: StatProps) {
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "24px",

        padding: "24px",

        display: "flex",
        flexDirection: "column",
        maxWidth:"100%",
        width:"400px",

        alignItems: "center",
        gap: "10px",
        // minHeight: "150px",

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
          fontSize: "0.95rem",
          fontWeight: 600,
          color: colors.textSecondary,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>

      {/* VALUE */}
      <span
        style={{
          fontSize: "2rem",
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
