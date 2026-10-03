import Image from "next/image";

export type FullScreenQuoteProps = {
  quote: string;
  attribution: string;
  photo: string;
  photoAlt?: string;
  /** Homepage section id. Omit in catalog previews. */
  id?: string;
  className?: string;
  /** When set, the whole plate opens this action (e.g. Fresco video modal). */
  onActivate?: () => void;
  /** Accessible name for the activate control. Required when `onActivate` is set. */
  activateLabel?: string;
};

/**
 * Full-bleed quote plate at the bottom of the homepage.
 * Parent looks up copy and photo; this view only paints what it is given.
 */
export function FullScreenQuote({
  quote,
  attribution,
  photo,
  photoAlt = "",
  id,
  className,
  onActivate,
  activateLabel,
}: FullScreenQuoteProps) {
  const attrId = id ? `${id}-attribution` : undefined;
  const interactive = typeof onActivate === "function";

  const body = (
    <div className="relative z-[1] mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 sm:flex-row sm:items-center sm:gap-8 sm:px-10">
      <div className="theme-closing-quote__photo relative isolate h-28 w-28 shrink-0 overflow-hidden sm:h-32 sm:w-32">
        <Image
          src={photo}
          alt={photoAlt}
          fill
          className="object-cover object-top"
          sizes="128px"
        />
        <div className="theme-photo-tint" aria-hidden />
      </div>
      <blockquote className="min-w-0 flex-1">
        <p className="theme-closing-quote__text">&ldquo;{quote}&rdquo;</p>
        <footer id={attrId} className="theme-closing-quote__attr mt-3">
          —{attribution}
        </footer>
      </blockquote>
    </div>
  );

  return (
    <section
      id={id}
      aria-labelledby={attrId}
      className={`theme-closing-quote theme-section-anchor relative overflow-hidden border-b border-white/10 py-16 sm:py-20 ${className ?? ""}`.trim()}
    >
      <svg
        className="theme-closing-quote__splash theme-decorative"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          fill="currentColor"
          d="M0,0 C28,6 52,38 72,68 C86,86 94,96 100,100 L100,100 L0,100 Z"
        />
      </svg>
      {interactive ? (
        <button
          type="button"
          onClick={onActivate}
          aria-label={activateLabel ?? `Open more about ${attribution}`}
          className="theme-focus-ring block w-full cursor-pointer rounded-none border-0 bg-transparent p-0 text-left transition hover:opacity-95"
        >
          {body}
        </button>
      ) : (
        body
      )}
    </section>
  );
}
