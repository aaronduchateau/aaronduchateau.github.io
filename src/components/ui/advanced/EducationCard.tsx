export type ColorSplash = {
  from: string;
  to: string;
};

export type EducationCardProps = {
  years: string;
  degree: string;
  school: string;
  detail: string;
  /** Corner wash — same linear-gradient the homepage already uses. */
  splash: ColorSplash;
  className?: string;
};

/** Degree plate under University background — decorative splash is a content color pair. */
export function EducationCard({
  years,
  degree,
  school,
  detail,
  splash,
  className,
}: EducationCardProps) {
  return (
    <article
      className={`group relative overflow-hidden theme-radius-card theme-hairline border bg-surface-900/50 p-8 ${className ?? ""}`.trim()}
    >
      <div
        className="theme-decorative pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl transition group-hover:opacity-60"
        style={{
          background: `linear-gradient(135deg, ${splash.from}, ${splash.to})`,
        }}
      />
      <div className="relative space-y-4">
        <p className="font-mono text-xs text-surface-500">{years}</p>
        <h3 className="theme-heading-ink font-display text-xl font-semibold">{degree}</h3>
        <p className="theme-card-meta text-sm font-medium">{school}</p>
        <p className="theme-muted text-sm leading-relaxed">{detail}</p>
      </div>
    </article>
  );
}
