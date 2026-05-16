"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useState, useEffect, useRef } from "react";

function shorten(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, status, chain } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const connector = connectors[0];

  const isConnected = status === "connected";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (isConnected && address) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          style={{ cursor: "pointer" }}
        >
          {shorten(address)}
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">
                Connected Wallet
              </p>
              <p className="text-xs text-gray-500 truncate">{address}</p>
              {chain && (
                <p className="text-xs text-emerald-600 mt-1 capitalize">
                  {chain.name}
                </p>
              )}
            </div>

            <div className="py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  // Navigate to profile or open modal
                  console.log("View Profile");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                style={{ cursor: "pointer" }}
              >
                View Profile
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  // Navigate to history or open modal
                  console.log("View History / Status");
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                style={{ cursor: "pointer" }}
              >
                History & Status
              </button>
            </div>

            <div className="py-1 border-t border-gray-100">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  disconnect();
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                style={{ cursor: "pointer" }}
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector })}
      disabled={!connector || isPending}
      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
      style={{ cursor: "pointer" }}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
