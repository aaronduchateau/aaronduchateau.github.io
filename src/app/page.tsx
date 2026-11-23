"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PORTFOLIO_PATH } from "@/lib/routes";

/**
 * `/` is an alias of the portfolio. The canonical page stays
 * `/portfolio-launched/`. Start over is the only path to Your Experience.
 */
export default function RootEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(PORTFOLIO_PATH);
  }, [router]);

  return <div className="min-h-dvh bg-surface-950" aria-hidden />;
}
