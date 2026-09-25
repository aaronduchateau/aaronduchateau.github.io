"use client";

import { useLayoutEffect, useState } from "react";

/**
 * Tailwind `md` starts at 768px. Below that is phone-width only
 * (not tablet / laptop). Used to swap main-screen cards for a compact list.
 */
export const MOBILE_ONLY_QUERY = "(max-width: 767px)";

/** `null` until mounted so SSR / first paint match (full cards). */
export function useMediaQuery(query: string): boolean | null {
  const [matches, setMatches] = useState<boolean | null>(null);

  useLayoutEffect(() => {
    const media = window.matchMedia(query);
    const sync = () => setMatches(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [query]);

  return matches;
}

/** True only on a phone-width viewport after mount. */
export function useMobileOnlyViewport(): boolean {
  return useMediaQuery(MOBILE_ONLY_QUERY) === true;
}
