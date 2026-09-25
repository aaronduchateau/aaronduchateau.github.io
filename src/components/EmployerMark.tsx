import type { CSSProperties } from "react";

type Mark = { initials: string; from: string; to: string };

const sizeClasses = {
  md: {
    box: "h-28 w-28 theme-radius-media",
    grid: "[background-size:12px_12px]",
    blob: "-right-6 -top-6 h-20 w-20",
    initials: "text-2xl",
  },
  sm: {
    box: "h-12 w-12 theme-radius-control sm:h-14 sm:w-14",
    grid: "[background-size:8px_8px]",
    blob: "-right-3 -top-3 h-10 w-10",
    initials: "text-sm sm:text-base",
  },
} as const;

export function EmployerMark({
  mark,
  className = "",
  size = "md",
}: {
  mark: Mark;
  className?: string;
  size?: keyof typeof sizeClasses;
}) {
  const s = sizeClasses[size];
  const markStyle = {
    "--employer-mark-from": mark.from,
    "--employer-mark-to": mark.to,
  } as CSSProperties;
  return (
    <div
      className={`theme-employer-mark relative flex shrink-0 items-center justify-center overflow-hidden theme-hairline border ${s.box} ${className}`}
      style={markStyle}
      aria-hidden
    >
      <div
        className={`theme-employer-mark__deco pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] ${s.grid}`}
      />
      <div
        className={`theme-employer-mark__deco pointer-events-none absolute rounded-full bg-white/10 blur-2xl ${s.blob}`}
      />
      <span
        className={`theme-employer-mark__initials relative font-display font-bold tracking-tight text-white drop-shadow-md ${s.initials}`}
      >
        {mark.initials}
      </span>
    </div>
  );
}
