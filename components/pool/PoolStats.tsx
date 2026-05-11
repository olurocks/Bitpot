"use client";

import { usePendingPrize } from "@/hooks/usePendingPrize";
import { usePoolStats } from "@/hooks/usePoolStats";
import { formatToken } from "@/lib/format";

export function PoolStats() {
  const { data: prize } = usePendingPrize() as { data: bigint | undefined };
  const { totalPrincipal, depositorCount } = usePoolStats() as {
    totalPrincipal: bigint | undefined;
    depositorCount: bigint | undefined;
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Stat label="Prize (MEZO)" value={formatToken(prize)} />
      <Stat label="Total Deposits (MUSD)" value={formatToken(totalPrincipal)} />
      <Stat label="Participants" value={depositorCount?.toString() || "0"} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4">
      <p className="text-sm text-slate-500" style={{ color: "#212a36" }}>
        {label}
      </p>
      <p className="text-xl font-bold" style={{ color: "#212a36" }}>
        {value}
      </p>
    </div>
  );
}
