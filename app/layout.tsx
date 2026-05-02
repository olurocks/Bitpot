import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "BitPot",
  description: "No-loss prize savings on Mezo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f8fffb] text-slate-950">
        <Providers>
          <Header />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
