"use client";

import { Addresses } from "@/config/contracts";
import { useDeposit } from "@/hooks/useDeposit";
import { useState, useEffect } from "react";
import { useTheme } from "../ThemeProvider";
import { themeColors } from "@/constants";

export function DepositForm() {
  const [amount, setAmount] = useState("");

  const { theme } = useTheme();
  const colors = themeColors[theme];

  const { deposit, status, isLoading, isSuccess, error, reset } = useDeposit(
    Addresses.prizePool,
  );

  useEffect(() => {
    if (isSuccess) {
      setAmount("");

      setTimeout(reset, 3000);
    }
  }, [isSuccess, reset]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        deposit(amount);
      }}
      style={{
        marginTop: "24px",

        width: "100%",
        maxWidth: "420px",

        display: "flex",
        flexDirection: "column",
        gap: "16px",

        backgroundColor: colors.surface,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: "24px",

        padding: "24px",
      }}
    >
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isLoading}
        placeholder="Enter MUSD amount"
        style={{
          width: "100%",
          padding: "14px 18px",

          borderRadius: "16px",
          border: `1px solid ${colors.cardBorder}`,

          backgroundColor: colors.background,
          color: colors.textPrimary,

          fontSize: "1rem",
          outline: "none",
        }}
      />

      <button
        type="submit"
        disabled={isLoading || !amount}
        style={{
          backgroundColor: colors.primary,
          color: colors.textPrimary,

          border: "none",
          borderRadius: "16px",

          padding: "14px 20px",

          fontSize: "1rem",
          fontWeight: 700,

          cursor: isLoading ? "not-allowed" : "pointer",

          opacity: isLoading || !amount ? 0.6 : 1,

          transition: "all 0.2s ease",
        }}
      >
        {status === "approving" && "Approving MUSD..."}
        {status === "depositing" && "Depositing..."}
        {status === "idle" && "Deposit"}
        {status === "success" && "Deposited!"}
      </button>

      {error && (
        <div
          style={{
            color: colors.error,
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          Transaction failed
        </div>
      )}
    </form>
  );
}
