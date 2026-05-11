import { PoolStats } from "@/components/pool/PoolStats";

export default function PoolPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">BitPot Pool</h1>

      <PoolStats />
    </div>
  );
}
