"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { WalletModal } from "./WalletModal";
import { useNetwork } from "@/hooks/useNetwork";
import { createPortal } from "react-dom";

function shorten(address?: string) {
  if (!address || address.length < 10) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isCorrectNetwork, isSwitching, switchToMezo, targetChain } = useNetwork();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const insideButton = wrapperRef.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideButton && !insideDropdown) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function toggleMenu() {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.right - 224,
      });
    }
    setMenuOpen((prev) => !prev);
  }

  const showConnected = mounted && isConnected && address;

  return (
    <>
      {showConnected ? (
        <div ref={wrapperRef} className="relative">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition"
            style={{
              // Red tint when on wrong network
              outline: !isCorrectNetwork ? "2px solid #EF4444" : "none",
              outlineOffset: "2px",
            }}
          >
            {!isCorrectNetwork && (
              <span style={{ fontSize: "0.75rem" }}>⚠️</span>
            )}
            {shorten(address)}
          </button>

          {mounted &&
            menuOpen &&
            createPortal(
              <div
                ref={dropdownRef}
                role="menu"
                style={{
                  position: "fixed",
                  top: menuPosition.top,
                  left: menuPosition.left,
                  width: "224px",
                  zIndex: 9999,
                }}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium">Connected Wallet</p>
                  <p className="truncate text-xs text-gray-500">{address}</p>
                  {!isCorrectNetwork && (
                    <p className="mt-1 text-xs font-semibold text-red-500">
                      Wrong network — switch to {targetChain.name}
                    </p>
                  )}
                </div>

                {!isCorrectNetwork && (
                  <button
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      switchToMezo();
                    }}
                    disabled={isSwitching}
                    className="w-full px-4 py-2 text-left text-sm font-semibold text-emerald-600 hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {isSwitching ? "Switching…" : `Switch to ${targetChain.name}`}
                  </button>
                )}

                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                >
                  View Profile
                </button>

                <div className="border-t" />

                <button
                  role="menuitem"
                  onClick={() => {
                    disconnect();
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Disconnect
                </button>
              </div>,
              document.body,
            )}
        </div>
      ) : (
        <>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            style={{cursor: "pointer"}}
          >
            Connect Wallet
          </button>

          {modalOpen && <WalletModal onClose={() => setModalOpen(false)} />}
        </>
      )}
    </>
  );
}