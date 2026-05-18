"use client";

// ─────────────────────────────────────────────
// WithdrawForm.tsx
// ─────────────────────────────────────────────
import { useState } from "react";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";
import { useWithdraw } from "@/hooks/useWithdraw";
import { Addresses } from "@/config/contracts";
import { formatUnits } from "viem";

export function WithdrawForm() {
  const [amount, setAmount] = useState("");
  const theme = useTheme();
  const colors = themeColors[theme.theme];

  const {
    withdraw,
    status,
    isLoading,
    maxWithdrawNative,
    userDepositWad,
    reset,
  } = useWithdraw(Addresses.prizePool);

  const maxDisplay =
    userDepositWad != null
      ? Number(formatUnits(userDepositWad, 18)).toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })
      : "0";

  const handleMax = () => {
    if (userDepositWad != null) {
      setAmount(formatUnits(userDepositWad, 18));
    }
  };

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) return;
    withdraw(amount);
  };

  if (status === "success") {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>✅</div>
        <p
          style={{
            color: colors.textPrimary,
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          Withdrawal successful!
        </p>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "0.9rem",
            marginBottom: "16px",
          }}
        >
          Your MUSD has been returned to your wallet.
        </p>
        <button
          onClick={() => {
            reset();
            setAmount("");
          }}
          style={submitBtnStyle(colors.secondary, colors.white)}
        >
          Withdraw More
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>❌</div>
        <p
          style={{
            color: colors.textPrimary,
            fontWeight: 700,
            fontSize: "1.1rem",
          }}
        >
          Withdrawal failed
        </p>
        <p
          style={{
            color: colors.textSecondary,
            fontSize: "0.9rem",
            marginBottom: "16px",
          }}
        >
          Check your balance and try again.
        </p>
        <button
          onClick={() => {
            reset();
            setAmount("");
          }}
          style={submitBtnStyle(colors.secondary, colors.white)}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header */}
      <div>
        <h3
          style={{
            margin: 0,
            color: colors.textPrimary,
            fontWeight: 800,
            fontSize: "1.3rem",
          }}
        >
          Exit Pool
        </h3>
        <p
          style={{
            margin: "4px 0 0",
            color: colors.textSecondary,
            fontSize: "0.9rem",
          }}
        >
          Withdraw your MUSD from the prize pool
        </p>
      </div>

      {/* Balance display */}
      <div
        style={{
          backgroundColor: colors.background,
          borderRadius: "16px",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
          Your deposit
        </span>
        <span
          style={{
            color: colors.textPrimary,
            fontWeight: 700,
            fontSize: "0.95rem",
          }}
        >
          {maxDisplay} MUSD
        </span>
      </div>

      {/* Amount input */}
      <div style={{ position: "relative" }}>
        <input
          type="number"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "16px 80px 16px 16px",
            fontSize: "1.3rem",
            fontWeight: 700,
            borderRadius: "16px",
            border: `1.5px solid ${colors.cardBorder}`,
            backgroundColor: colors.surface,
            color: colors.textPrimary,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={handleMax}
          disabled={isLoading}
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            backgroundColor: `${colors.primary}22`,
            color: colors.primary,
            border: "none",
            borderRadius: "8px",
            padding: "6px 12px",
            fontWeight: 700,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          MAX
        </button>
      </div>

      {/* Warning */}
      <div
        style={{
          backgroundColor: `${colors.accent}18`,
          border: `1px solid ${colors.accent}44`,
          borderRadius: "12px",
          padding: "10px 14px",
          fontSize: "0.82rem",
          color: colors.textSecondary,
          lineHeight: 1.5,
        }}
      >
        ⚠️ Withdrawing will remove you from the current draw. Your time-weighted
        odds are reset on exit.
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isLoading || !amount || Number(amount) <= 0}
        style={submitBtnStyle(
          isLoading || !amount || Number(amount) <= 0
            ? "#888"
            : colors.secondary,
          colors.white,
          isLoading || !amount || Number(amount) <= 0,
        )}
      >
        {isLoading ? "Withdrawing..." : "Confirm Withdrawal"}
      </button>
    </div>
  );
}

function submitBtnStyle(bg: string, color: string, disabled = false) {
  return {
    backgroundColor: bg,
    color,
    border: "none",
    borderRadius: "16px",
    padding: "16px",
    fontSize: "1rem",
    fontWeight: 700 as const,
    cursor: disabled ? ("not-allowed" as const) : ("pointer" as const),
    opacity: disabled ? 0.6 : 1,
    transition: "opacity 0.2s",
    width: "100%",
  };
}
