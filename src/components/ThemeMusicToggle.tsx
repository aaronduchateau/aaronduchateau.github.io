"use client";

import { useTheme } from "@/theme/ThemeProvider";

function SpeakerMutedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6.5 9H3v6h3.5L11 19V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M16 9.5l5 5M21 9.5l-5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpeakerOnIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5L6.5 9H3v6h3.5L11 19V5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 9.5a4.5 4.5 0 010 5M18.25 7a8 8 0 010 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export { SpeakerMutedIcon, SpeakerOnIcon };

/** Compact speaker control for primary theme music (intro Sound kits). */
export function ThemeMusicToggle({ className = "" }: { className?: string }) {
  const { themeMusicEnabled, setThemeMusicEnabled, playNavClick } = useTheme();

  return (
    <button
      type="button"
      aria-pressed={themeMusicEnabled}
      aria-label={
        themeMusicEnabled ? "Stop primary theme music" : "Play primary theme music"
      }
      title={themeMusicEnabled ? "Theme music on" : "Theme music off"}
      onClick={() => {
        playNavClick();
        setThemeMusicEnabled(!themeMusicEnabled);
      }}
      className={`sound-toggle theme-btn-shape inline-flex h-8 w-8 items-center justify-center transition ${className}`}
    >
      {themeMusicEnabled ? (
        <SpeakerOnIcon className="h-4 w-4" />
      ) : (
        <SpeakerMutedIcon className="h-4 w-4 opacity-90" />
      )}
    </button>
  );
}
