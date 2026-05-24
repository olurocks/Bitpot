"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { WalletModal } from "./WalletModal";
import { useNetwork } from "@/hooks/useNetwork";
import { createPortal } from "react-dom";
import { themeColors } from "@/constants";
import { useTheme } from "../ThemeProvider";

function shorten(address?: string) {
  if (!address || address.length < 10) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isCorrectNetwork, isSwitching, switchToMezo, targetChain } =
    useNetwork();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 224,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const colors = themeColors[theme];

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
      const dropdownWidth = 224;
      const viewportWidth = window.innerWidth;
      const margin = 8;

      // Ideal: align right edge of dropdown with right edge of button
      let left = rect.right - dropdownWidth;

      // Clamp so dropdown never goes off-screen on either side
      left = Math.max(margin, Math.min(left, viewportWidth - dropdownWidth - margin));

      setMenuPosition({
        top: rect.bottom + 8,
        left,
        width: dropdownWidth,
      });
    }
    setMenuOpen((prev) => !prev);
  }

  const showConnected = mounted && isConnected && address;

  return (
    <>
      {showConnected ? (
        <div ref={wrapperRef} className="relative bg-emerald-500 rounded-full">
          <button
            ref={buttonRef}
            onClick={toggleMenu}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold cursor-pointer transition"
            style={{
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
                  width: `${menuPosition.width}px`,
                  zIndex: 9999,
                  backgroundColor: colors.surface,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: "12px",
                }}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
              >
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium" style={{color: colors.success}}>Connected Wallet</p>
                  <p
                    className="truncate text-xs text-gray-500"
                    style={{ maxWidth: "200px" }}
                  >
                    {address}
                  </p>
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
                    {isSwitching
                      ? "Switching…"
                      : `Switch to ${targetChain.name}`}
                  </button>
                )}

                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    router.push("/profile");
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                  style={{ color: colors.textPrimary }}
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
            style={{ cursor: "pointer" }}
          >
            Connect Wallet
          </button>

          {modalOpen && <WalletModal onClose={() => setModalOpen(false)} />}
        </>
      )}
    </>
  );
}