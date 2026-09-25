/** Shared Tailwind classes for npm audit dashboard (dark theme, cyan accents) */

export const auditPanelClass = "rounded-xl border border-white/10 bg-black/60";

export const auditSectionClass = `${auditPanelClass} px-8 py-6`;

export const auditSectionTitleClass =
  "border-b border-white/10 pb-3 pl-2 text-base font-semibold text-accent-100";

export const auditSubheadingClass = "pl-2 text-sm font-medium text-surface-300";

export const auditMutedTextClass = "pl-2 text-xs text-surface-500";

export const auditKpiGridClass = "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-4";

export const auditKpiCardClass =
  "rounded-lg border border-white/10 bg-surface-900/50 px-4 py-4 text-center";

export const auditTableWrapperClass = "overflow-x-auto rounded-lg border border-white/10";

export const auditTableClass = "w-full border-collapse text-sm";

export const auditTableHeadClass =
  "bg-surface-900/80 text-left text-[11px] font-semibold uppercase tracking-wide text-surface-400";

export const auditThClass = "border-b border-white/10 px-4 py-2 pl-5";

export const auditTdClass = "border-b border-white/10 px-4 py-2 pl-5 align-top text-surface-300";

export const auditChartBoxClass = `${auditPanelClass} px-8 py-6`;

export const auditBannerClass =
  "rounded-lg border border-accent-500/20 bg-accent-950/30 px-5 py-4 pl-6 text-sm leading-relaxed text-surface-300";

export const auditRiskBannerClass =
  "rounded-lg border border-red-500/30 bg-red-950/20 px-5 py-4 pl-6 text-sm leading-relaxed text-surface-200";

export const auditInputTabClass =
  "rounded-full border px-3 py-1.5 text-xs font-semibold transition";

export const auditInputTabActiveClass =
  "border-accent-500/50 bg-accent-950/40 text-accent-200";

export const auditInputTabInactiveClass =
  "border-white/15 text-surface-400 hover:border-white/30 hover:text-surface-200";

export const severityColors: Record<string, string> = {
  critical: "bg-red-600 text-white",
  high: "bg-orange-600 text-white",
  moderate: "bg-amber-500 text-surface-900",
  low: "bg-blue-600 text-white",
  info: "bg-surface-500 text-white",
  major: "bg-purple-700 text-white",
  install: "bg-emerald-700 text-white",
  update: "bg-accent-700 text-white",
  review: "bg-orange-700 text-white",
  dev: "bg-surface-600 text-white",
  prod: "bg-red-800 text-white",
};

export const severityBarColors: Record<string, string> = {
  critical: "bg-red-600",
  high: "bg-orange-600",
  moderate: "bg-amber-500",
  low: "bg-blue-600",
  info: "bg-surface-500",
};

export const severityTextColors: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  moderate: "text-amber-400",
  low: "text-blue-400",
  info: "text-surface-400",
};
