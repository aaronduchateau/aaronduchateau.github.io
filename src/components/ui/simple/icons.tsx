"use client";

import type { ComponentType } from "react";
import { SoundAvailableIcon, SoundLockIcon } from "@/components/SoundLockIcon";
import { SpeakerMutedIcon, SpeakerOnIcon } from "@/components/ThemeMusicToggle";
import { VideoPauseIcon, VideoPlayIcon } from "@/lib/youtubeIframeApi";

export type AppIconProps = { className?: string };
export type AppIconComponent = ComponentType<AppIconProps>;

export type AppIconEntry = {
  id: string;
  label: string;
  Icon: AppIconComponent;
};

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ChevronLeftIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export function BackIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export function CloseIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}

export function PlusIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function MinusIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Circular refresh arrow — Options “Start over”, etc. */
export function RefreshIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M20 12a8 8 0 10-2.34 5.66"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M20 7v5h-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ExpandIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M21 16v5h-5" />
    </svg>
  );
}

export function PrintIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M6 9V4h12v5M6 14H4a1 1 0 01-1-1v-3a2 2 0 012-2h14a2 2 0 012 2v3a1 1 0 01-1 1h-2M6 14h12v6H6v-6z" />
    </svg>
  );
}

export function PdfIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V9l-5-6z" />
      <path d="M14 3v6h6M9 13h6M9 17h4" />
    </svg>
  );
}

export function MenuIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
    </svg>
  );
}

export function InfoIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" {...stroke} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 8h.01" />
    </svg>
  );
}

export function CheckIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function NaturalIcon({ className = "h-4 w-4" }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="6.25" y="6.25" width="11.5" height="11.5" rx="1.75" />
    </svg>
  );
}

export function FullscreenIcon({ className = "h-4 w-4" }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5h4M15 5h4v4M20 15v4h-4M9 19H5v-4" />
    </svg>
  );
}

export function TabletIcon({ className = "h-4 w-4" }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3.5" y="5.5" width="17" height="13" rx="1.75" />
      <circle cx="12" cy="16.25" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PhoneIcon({ className = "h-4 w-4" }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="7.25" y="3.25" width="9.5" height="17.5" rx="2" />
      <circle cx="12" cy="17.75" r="0.55" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function CaretDownIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ArticleIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function RestoreIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4.5 12a7.5 7.5 0 0112.6-5.5M19.5 12a7.5 7.5 0 01-12.6 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5V7h-3.5M7.5 20.5V17H11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompareIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowRightIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ReplyIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden>
      <path fill="currentColor" d="M10 3a7 7 0 0 0-5.6 11.2l-.9 3.4 3.5-.9A7 7 0 1 0 10 3Z" />
    </svg>
  );
}

export function MediaLockIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 11V8a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.92" />
      <circle cx="12" cy="16" r="1.5" fill="rgb(15 23 42)" />
    </svg>
  );
}

export function TreasureChestIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 10.5h16v8.5a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 19V10.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M4 10.5V8.25C4 7.01 5.01 6 6.25 6h11.5C18.99 6 20 7.01 20 8.25V10.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M3.5 10.5h17" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M12 6v4.5M10.5 14.5h3v2.5h-3z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 6.2c0-1.2 1.34-2.2 3-2.2s3 1 3 2.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SettingsGearIcon({ className }: AppIconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {/* Flat 6-tooth cog — thick body, large hole, matches chest visual weight */}
      <path
        fillRule="evenodd"
        d="M10.25 2.75h3.5v2.4l1.85.75 1.7-1.7 2.45 2.45-1.7 1.7.75 1.85h2.4v3.5h-2.4l-.75 1.85 1.7 1.7-2.45 2.45-1.7-1.7-1.85.75v2.4h-3.5v-2.4l-1.85-.75-1.7 1.7-2.45-2.45 1.7-1.7-.75-1.85h-2.4v-3.5h2.4l.75-1.85-1.7-1.7L6.7 4.2l1.7 1.7 1.85-.75V2.75zM12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zm0 2.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5z"
      />
    </svg>
  );
}

/** Every unique UI glyph used on the site — catalog grid and shared imports. */
export const APP_ICON_CATALOG: readonly AppIconEntry[] = [
  { id: "chevron-left", label: "Chevron left", Icon: ChevronLeftIcon },
  { id: "chevron-right", label: "Chevron right", Icon: ChevronRightIcon },
  { id: "back", label: "Back", Icon: BackIcon },
  { id: "caret-down", label: "Caret down", Icon: CaretDownIcon },
  { id: "arrow-right", label: "Arrow right", Icon: ArrowRightIcon },
  { id: "close", label: "Close", Icon: CloseIcon },
  { id: "refresh", label: "Refresh", Icon: RefreshIcon },
  { id: "expand", label: "Expand", Icon: ExpandIcon },
  { id: "fullscreen", label: "Full screen", Icon: FullscreenIcon },
  { id: "natural", label: "Natural", Icon: NaturalIcon },
  { id: "phone", label: "Phone", Icon: PhoneIcon },
  { id: "tablet", label: "Tablet", Icon: TabletIcon },
  { id: "menu", label: "Menu", Icon: MenuIcon },
  { id: "info", label: "Info", Icon: InfoIcon },
  { id: "play", label: "Play", Icon: VideoPlayIcon },
  { id: "pause", label: "Pause", Icon: VideoPauseIcon },
  { id: "print", label: "Print", Icon: PrintIcon },
  { id: "pdf", label: "PDF", Icon: PdfIcon },
  { id: "article", label: "Article", Icon: ArticleIcon },
  { id: "check", label: "Check", Icon: CheckIcon },
  { id: "available", label: "Available", Icon: SoundAvailableIcon },
  { id: "lock", label: "Lock", Icon: SoundLockIcon },
  { id: "media-lock", label: "Media lock", Icon: MediaLockIcon },
  { id: "speaker-on", label: "Speaker on", Icon: SpeakerOnIcon },
  { id: "speaker-muted", label: "Speaker muted", Icon: SpeakerMutedIcon },
  { id: "restore", label: "Restore", Icon: RestoreIcon },
  { id: "chest", label: "Treasure chest", Icon: TreasureChestIcon },
  { id: "settings", label: "Settings", Icon: SettingsGearIcon },
  { id: "compare", label: "Compare", Icon: CompareIcon },
  { id: "reply", label: "Reply", Icon: ReplyIcon },
];
