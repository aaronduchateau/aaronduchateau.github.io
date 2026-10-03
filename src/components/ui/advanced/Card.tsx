import Image from "next/image";
import type { MouseEventHandler, ReactNode } from "react";
import { InteractiveDemoBadge } from "@/components/InteractiveDemoBadge";
import { trackAttrs } from "@/activity/trackAttrs";

export type CardCover =
  | { kind: "image"; src: string; alt?: string }
  | { kind: "video"; src: string; alt?: string; play?: boolean }
  | { kind: "demo" }
  | { kind: "article" };

export type CardProps = {
  title: string;
  excerpt: string;
  cta: string;
  date?: string;
  /** Omit or pass null to hide the cover — ADA / catalog “None”. */
  cover?: CardCover | null;
  as?: "article" | "button";
  onClick?: MouseEventHandler<HTMLButtonElement>;
  ariaLabel?: string;
  trackId?: string;
  className?: string;
  /**
   * Decorative themes only: restyle into the compact list row below 768px.
   * ADA Guy must not set this — phone ADA stays `MobileContentList`.
   */
  compactAtPhone?: boolean;
};

const SHELL =
  "theme-card group flex h-full w-full min-w-0 flex-col text-left transition-[border-color,box-shadow] duration-card-reveal ease-card-reveal delay-0 motion-reduce:transition-none hover:delay-card-reveal";

const CTA = "theme-card-cta theme-card__cta mt-6 inline-flex items-center gap-1 text-xs font-semibold";

const CTA_BUTTON = `${CTA} rounded-sm text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`;

function PlayMark({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <span className="theme-play-triangle" />
    </span>
  );
}

function ArticleMark() {
  return (
    <span className="theme-card__row-article" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" className="theme-content-list__article-icon">
        <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function CoverDate({ date, yearChip }: { date: string; yearChip: boolean }) {
  if (yearChip) {
    return (
      <p
        className="theme-card-meta theme-card__cover-date absolute right-3 top-3 z-20 max-w-[min(100%-1.5rem,11rem)] rounded-md bg-surface-950/85 px-2.5 py-1 text-left font-mono text-[11px] font-semibold leading-snug tracking-wide ring-1 ring-white/15 sm:text-xs"
        aria-label={date}
      >
        {date}
      </p>
    );
  }

  return (
    <p className="theme-card-meta theme-card__cover-date absolute bottom-3 left-4 z-20 font-mono text-[10px] uppercase tracking-widest">
      {date}
    </p>
  );
}

function CoverRegion({ cover, date }: { cover: CardCover; date?: string }) {
  const yearChip = Boolean(date && /^\d{4}$/.test(date));
  const dateMark = date ? <CoverDate date={date} yearChip={yearChip} /> : null;
  const coverKind = cover.kind;

  if (cover.kind === "image" || cover.kind === "video") {
    const video = cover.kind === "video";
    const play = video && cover.play !== false;

    return (
      <div
        className={`theme-card__cover relative isolate aspect-[16/10] overflow-hidden rounded-t-3xl bg-surface-900 ${
          video ? "theme-card__cover--video" : "theme-card__cover--image"
        }`}
      >
        <div className="theme-card__thumb absolute inset-0 overflow-hidden rounded-t-3xl">
          <div className={video ? "theme-card__thumb-zoom" : "relative h-full w-full"}>
            <Image
              src={cover.src}
              alt={cover.alt ?? ""}
              fill
              className={video ? "theme-card__thumb-fade" : "object-cover transition duration-500 group-hover:scale-105"}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="theme-photo-tint" aria-hidden />
        </div>
        {video ? <div className="theme-card__thumb-dim" aria-hidden /> : null}
        <div className="pointer-events-none absolute inset-0 z-[2] rounded-t-3xl bg-gradient-to-t from-surface-950/90 to-transparent" />
        {play ? (
          <span className="pointer-events-none absolute inset-0 z-10 grid place-items-center" aria-hidden>
            <PlayMark className="theme-card__play theme-play-btn h-14 w-14 origin-center opacity-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] transition-[opacity,transform] duration-card-reveal ease-card-reveal delay-0 scale-[0.92] will-change-[opacity,transform] motion-reduce:transition-none group-hover:scale-100 group-hover:opacity-100 group-hover:delay-card-reveal sm:h-16 sm:w-16" />
          </span>
        ) : null}
        {dateMark}
      </div>
    );
  }

  return (
    <div
      className={`theme-card__cover relative isolate aspect-[16/10] overflow-hidden rounded-t-3xl bg-gradient-to-br from-surface-900 via-black to-accent-950/40 ${
        coverKind === "demo" ? "theme-card__cover--demo" : "theme-card__cover--article"
      }`}
    >
      <div className="theme-card-cover-wash pointer-events-none absolute inset-0" />
      <div className="theme-card__plate-graphic absolute inset-0 grid place-items-center">
        {coverKind === "demo" ? (
          <InteractiveDemoBadge />
        ) : (
          <InteractiveDemoBadge kicker="Article" label="Read the write-up" />
        )}
      </div>
      {coverKind === "article" ? <ArticleMark /> : null}
      {dateMark}
    </div>
  );
}

/** Homepage media plate — same module the catalog story mounts. */
export function Card({
  title,
  excerpt,
  cta,
  date,
  cover = null,
  as,
  onClick,
  ariaLabel,
  trackId,
  className,
  compactAtPhone = false,
}: CardProps) {
  const showCover = Boolean(cover);
  const tag = as ?? (showCover && onClick ? "button" : "article");
  const body = (
    <>
      {cover ? <CoverRegion cover={cover} date={date} /> : null}
      <div className="theme-card__body flex min-h-0 flex-1 flex-col overflow-visible rounded-b-3xl p-6 pb-8">
        {date ? <p className="theme-card__row-date">{date}</p> : null}
        <h3 className="card-display-heading">
          <span className="card-display-heading__text">{title}</span>
        </h3>
        <p className="theme-card__excerpt theme-muted mt-3 min-h-0 flex-1 text-sm leading-relaxed">{excerpt}</p>
        {tag === "button" || !onClick ? (
          <span className={CTA}>
            {cta}
            <span aria-hidden>→</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={CTA_BUTTON}
            {...(trackId ? trackAttrs(trackId) : {})}
          >
            {cta}
            <span aria-hidden>→</span>
          </button>
        )}
      </div>
    </>
  );

  const shell =
    `${SHELL} ${compactAtPhone ? "theme-card--compact" : ""} ${className ?? ""}`.trim();
  const tracking = trackId ? trackAttrs(trackId) : {};

  if (tag === "button") {
    return (
      <button
        type="button"
        onClick={onClick}
        className={shell}
        aria-label={ariaLabel ?? `${cta}: ${title}`}
        {...tracking}
      >
        {body}
      </button>
    );
  }

  return <article className={shell}>{body}</article>;
}

export function CardGrid({
  children,
  compactAtPhone = false,
}: {
  children: ReactNode;
  compactAtPhone?: boolean;
}) {
  return (
    <div
      className={`theme-card-grid mt-12 grid gap-8 md:grid-cols-3${
        compactAtPhone ? " theme-card-grid--compact" : ""
      }`}
    >
      {children}
    </div>
  );
}
