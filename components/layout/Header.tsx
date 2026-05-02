import Link from "next/link";
import { ConnectWallet } from "@/components/wallet/ConnectWallet";

export function Header() {
  return (
    <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-2xl font-black tracking-tight">
          <span className="text-slate-950">Bit</span>
          <span className="text-emerald-500">Pot</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link href="/pool" className="hover:text-slate-950">
            Pool
          </Link>
          <Link href="/winners" className="hover:text-slate-950">
            Winners
          </Link>
          <Link href="/demo" className="hover:text-slate-950">
            Demo
          </Link>
        </nav>

        <ConnectWallet />
      </div>
    </header>
  );
}
