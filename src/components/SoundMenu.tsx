"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/theme/ThemeProvider";
import { NO_SOUND_ID } from "@/theme/sounds";

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

function OnOffSwitch({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-3 px-3 py-2" role="menuitem">
      <span className="min-w-0 text-left text-xs text-surface-200">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "On" : "Off"}`}
        onClick={() => onChange(!checked)}
        className={`sound-switch inline-flex shrink-0 items-center gap-2 rounded-full border px-1 py-1 transition ${
          checked
            ? "border-accent-400/40 bg-accent-500/20"
            : "border-white/15 bg-white/5"
        }`}
      >
        <span
          className={`font-mono text-[9px] uppercase tracking-wider ${
            checked ? "text-surface-500" : "text-surface-200"
          }`}
        >
          Off
        </span>
        <span
          className={`relative h-4 w-7 rounded-full transition ${
            checked ? "bg-accent-400/80" : "bg-surface-600"
          }`}
          aria-hidden
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition ${
              checked ? "left-3.5" : "left-0.5"
            }`}
          />
        </span>
        <span
          className={`font-mono text-[9px] uppercase tracking-wider ${
            checked ? "text-accent-200" : "text-surface-500"
          }`}
        >
          On
        </span>
      </button>
    </div>
  );
}

/**
 * Nav sound control — granular toggles for theme music, clicks, content windows,
 * plus a master All sounds switch (synced with Options → No Sound).
 */
export function SoundMenu() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const {
    baseClickId,
    contentWindowSoundId,
    themeMusicEnabled,
    setThemeMusicEnabled,
    setClickInteractionsEnabled,
    setContentWindowSoundsEnabled,
    setAllSoundsEnabled,
    playNavClick,
  } = useTheme();

  const clicksOn = baseClickId !== NO_SOUND_ID;
  const contentWindowsOn = contentWindowSoundId !== NO_SOUND_ID;
  const allOn = themeMusicEnabled && clicksOn && contentWindowsOn;
  const anyOn = themeMusicEnabled || clicksOn || contentWindowsOn;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Sound settings"
        title="Sound settings"
        onClick={() => {
          playNavClick();
          setOpen((prev) => !prev);
        }}
        className="sound-toggle theme-btn-shape inline-flex h-9 w-9 items-center justify-center transition"
      >
        {anyOn ? (
          <SpeakerOnIcon className="h-5 w-5" />
        ) : (
          <SpeakerMutedIcon className="h-5 w-5 opacity-90" />
        )}
      </button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Sound settings"
          className="options-menu-panel absolute right-0 top-[calc(100%+0.4rem)] z-[60] w-[16.5rem] overflow-hidden border border-white/10 py-1 shadow-xl shadow-black/40"
        >
          <p className="px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            Sound
          </p>

          <OnOffSwitch
            label="Theme music"
            checked={themeMusicEnabled}
            onChange={(next) => {
              playNavClick();
              setThemeMusicEnabled(next);
            }}
          />
          <OnOffSwitch
            label="Click interactions"
            checked={clicksOn}
            onChange={(next) => {
              playNavClick();
              setClickInteractionsEnabled(next);
            }}
          />
          <OnOffSwitch
            label="Content windows"
            checked={contentWindowsOn}
            onChange={(next) => {
              playNavClick();
              setContentWindowSoundsEnabled(next);
            }}
          />

          <div className="my-1 border-t border-white/10" role="separator" />

          <OnOffSwitch
            label="All sounds"
            checked={allOn}
            onChange={(next) => {
              playNavClick();
              setAllSoundsEnabled(next);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
