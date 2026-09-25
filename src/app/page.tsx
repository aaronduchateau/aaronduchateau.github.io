"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { INTRO_SPLASH_PATH } from "@/lib/routes";

/**
 * Site root always enters via splash. The launched portfolio lives at
 * `/portfolio-launched/` — no env gate between local and production.
 */
export default function RootEntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace(INTRO_SPLASH_PATH);
  }, [router]);

  return <div className="min-h-dvh bg-surface-950" aria-hidden />;
}
