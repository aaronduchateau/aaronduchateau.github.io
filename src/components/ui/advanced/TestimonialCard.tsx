"use client";

import Image from "next/image";
import { testimonialFirstName } from "@/lib/testimonialIntro";

export function testimonialPreview(quote: string, maxLength = 230) {
  const flat = quote.replace(/\n\n+/g, " ");
  if (flat.length <= maxLength) return flat;
  return `${flat.slice(0, maxLength).trimEnd()}...`;
}

export type TestimonialCardProps = {
  name: string;
  title: string;
  /** Full letter body — never a catalog id. The parent looks up the letter. */
  quote: string;
  photo: string;
  onClick: () => void;
  ariaLabel?: string;
  className?: string;
};

/** Homepage testimonial plate — same module the catalog story mounts. */
export function TestimonialCard({
  name,
  title,
  quote,
  photo,
  onClick,
  ariaLabel,
  className,
}: TestimonialCardProps) {
  const preview = testimonialPreview(quote);
  const givenName = testimonialFirstName(name);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel ?? `Read full testimonial from ${givenName}`}
      className={`theme-card group flex h-full w-full flex-col justify-between bg-gradient-to-b from-surface-900/80 to-surface-950/80 p-6 text-left shadow-inner shadow-white/5 ${className ?? ""}`.trim()}
    >
      <div>
        <p className="text-sm leading-relaxed text-surface-300">“{preview}”</p>
        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-accent-300 transition hover:text-accent-200">
          Read more
          <span aria-hidden>→</span>
        </span>
      </div>
      <footer className="mt-8 border-t border-white/10 pt-4 text-sm">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="theme-heading-ink font-semibold">{givenName}</p>
            <p className="text-surface-500">{title}</p>
          </div>
          <div className="relative isolate h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15">
            <Image
              src={photo}
              alt=""
              fill
              className="object-cover grayscale"
              sizes="56px"
            />
            <div className="theme-photo-tint" aria-hidden />
          </div>
        </div>
      </footer>
    </button>
  );
}
