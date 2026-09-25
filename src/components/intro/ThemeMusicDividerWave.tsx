"use client";

import { DividerWave } from "@/components/DividerWave";
import { ensureThemeMusicAnalyser, getThemeMusicAudio } from "@/theme/sounds";

interface ThemeMusicDividerWaveProps {
  src: string;
  /** Theme music preference on — wave animates only while audio is actually playing. */
  active: boolean;
  className?: string;
}

/**
 * Header/body seam that reads as a normal divider at rest, then becomes a
 * live oscilloscope of the current theme-music signal (no left→right scroll).
 */
export function ThemeMusicDividerWave({
  src,
  active,
  className = "",
}: ThemeMusicDividerWaveProps) {
  return (
    <DividerWave
      active={active}
      className={`absolute inset-x-0 bottom-0 h-10 sm:h-12 ${className}`.trim()}
      getAnalyser={() => {
        const audio = getThemeMusicAudio(src);
        const playing = Boolean(active && audio && !audio.paused && !audio.ended);
        if (!playing) return null;
        return ensureThemeMusicAnalyser(src);
      }}
    />
  );
}
