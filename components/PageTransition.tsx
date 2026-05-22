"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { themeColors } from "@/constants";

function RouteSkeleton({
  pathname,
  colors,
}: {
  pathname: string;
  colors: any;
}) {
  const block = (extra: Record<string, string | number> = {}) => ({
    borderRadius: "24px",
    backgroundColor: colors.divider,
    opacity: 0.75,
    ...extra,
  });

  const panel = (extra: Record<string, string | number> = {}) => ({
    borderRadius: "32px",
    backgroundColor: colors.surface,
    border: `1px solid ${colors.cardBorder}`,
    ...extra,
  });

  const pulseSection = (
    height: string,
    width = "100%",
    extra: Record<string, string | number> = {},
  ) => <div style={block({ height, width, ...extra })} />;

  if (pathname.startsWith("/pool")) {
    return (
      <div
        className="space-y-8 px-4 py-6 sm:px-6"
        style={{ backgroundColor: colors.background }}
      >
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            {pulseSection("2.5rem", "66%")}
            <div className="grid gap-4 sm:grid-cols-2">
              {pulseSection("7rem")}
              {pulseSection("7rem")}
            </div>
          </div>
          <div className="space-y-4">
            {pulseSection("6rem")}
            {pulseSection("10rem")}
          </div>
        </div>
        <div className="space-y-3" style={panel({ padding: "1rem" })}>
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} style={block({ height: "4rem" })} />
          ))}
        </div>
      </div>
    );
  }

  if (pathname.startsWith("/leaderboard")) {
    return (
      <div
        className="space-y-8 px-4 py-6 sm:px-6"
        style={{ backgroundColor: colors.background }}
      >
        <div className="space-y-4">
          {pulseSection("2.5rem", "60%")}
          {pulseSection("1.5rem", "40%")}
        </div>
        <div className="space-y-3" style={panel({ padding: "1rem" })}>
          <div
            className="grid grid-cols-[56px_1fr_100px_160px_140px_110px] gap-3"
            style={block({ padding: "1rem" })}
          />
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[56px_1fr_100px_160px_140px_110px] gap-3"
              style={block({ padding: "1rem" })}
            />
          ))}
        </div>
      </div>
    );
  }

  if (pathname.startsWith("/profile")) {
    return (
      <div
        className="space-y-8 px-4 py-6 sm:px-6"
        style={{ backgroundColor: colors.background }}
      >
        <div className="space-y-4" style={panel({ padding: "1.5rem" })}>
          {pulseSection("2.5rem", "50%")}
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} style={block({ height: "7rem" })} />
            ))}
          </div>
        </div>
        <div className="space-y-3" style={panel({ padding: "1rem" })}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} style={block({ height: "4rem" })} />
          ))}
        </div>
      </div>
    );
  }

  if (pathname.startsWith("/winners")) {
    return (
      <div
        className="space-y-8 px-4 py-6 sm:px-6"
        style={{ backgroundColor: colors.background }}
      >
        <div className="space-y-4">
          {pulseSection("2rem", "20%")}
          {pulseSection("3rem", "60%")}
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} style={block({ height: "5rem" })} />
          ))}
        </div>
        <div className="space-y-3" style={panel({ padding: "1rem" })}>
          <div
            className="grid grid-cols-[80px_1fr_160px_100px_180px] gap-3"
            style={block({ padding: "1rem" })}
          />
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-[80px_1fr_160px_100px_180px] gap-3"
              style={block({ padding: "1rem" })}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="space-y-8 px-4 py-6 sm:px-6"
      style={{ backgroundColor: colors.background }}
    >
      {pulseSection("3rem", "40%")}
      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} style={block({ height: "10rem" })} />
        ))}
      </div>
      <div className="space-y-3" style={panel({ padding: "1rem" })}>
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} style={block({ height: "4rem" })} />
        ))}
      </div>
    </div>
  );
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const colors = themeColors[theme];
  const [displayChildren, setDisplayChildren] = useState(children);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPathname, setNextPathname] = useState(pathname);
  const prevPathname = useRef(pathname);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname === prevPathname.current) {
      setDisplayChildren(children);
      return;
    }

    prevPathname.current = pathname;
    setNextPathname(pathname);
    setIsLoading(true);

    timerRef.current = window.setTimeout(() => {
      setDisplayChildren(children);
      setIsLoading(false);
    }, 180);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [pathname, children]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] animate-pulse opacity-90">
        <RouteSkeleton pathname={nextPathname} colors={colors} />
      </div>
    );
  }

  return (
    <div className="transition-opacity duration-200 ease-out">
      {displayChildren}
    </div>
  );
}
