"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { InteractiveDemoBadge } from "@/components/InteractiveDemoBadge";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { trackAttrs } from "@/activity/trackAttrs";
import { MOBILE_ONLY_QUERY } from "@/hooks/useMediaQuery";

export type MobileContentGraphic =
  | {
      kind: "image";
      src: string;
      alt?: string;
      mark?: "play";
      shape?: "rect" | "circle";
      tone?: "color" | "bw";
    }
  | { kind: "demo" }
  | { kind: "article" };

export type MobileContentListItem = {
  id: string;
  title: string;
  date?: string;
  graphic: MobileContentGraphic;
  ariaLabel: string;
  onClick: () => void;
  wiggling?: boolean;
  footer?: ReactNode;
  /** Replaces the compact row with the original card (major projects). */
  expanded?: ReactNode;
  onCollapse?: () => void;
};

function PlayMark() {
  return (
    <span className="theme-content-list__play" aria-hidden>
      <span className="theme-play-triangle" />
    </span>
  );
}

function ArticleMark() {
  return (
    <span className="theme-content-list__article" aria-hidden>
      <svg viewBox="0 0 24 24" fill="none" className="theme-content-list__article-icon">
        <rect x="5" y="3" width="14" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ListGraphic({
  graphic,
  showDecorativeMedia,
}: {
  graphic: MobileContentGraphic;
  showDecorativeMedia: boolean;
}) {
  if (!showDecorativeMedia) {
    return <span className="theme-content-list__graphic theme-content-list__graphic--plain" aria-hidden />;
  }

  if (graphic.kind === "demo") {
    return (
      <span className="theme-content-list__graphic theme-content-list__graphic--demo">
        <InteractiveDemoBadge size="list" />
      </span>
    );
  }

  if (graphic.kind === "article") {
    return (
      <span className="theme-content-list__graphic theme-content-list__graphic--article-slot">
        <ArticleMark />
      </span>
    );
  }

  const shapeClass = graphic.shape === "circle" ? "theme-content-list__graphic--circle" : "";
  const toneClass = graphic.tone === "bw" ? "theme-content-list__graphic--bw" : "";
  return (
    <span className={`theme-content-list__graphic ${shapeClass} ${toneClass}`.trim()}>
      <Image
        src={graphic.src}
        alt={graphic.alt ?? ""}
        fill
        className={`object-cover ${graphic.tone === "bw" ? "grayscale" : ""}`.trim()}
        sizes="56px"
      />
      <div className="theme-photo-tint" aria-hidden />
      {graphic.mark === "play" ? <PlayMark /> : null}
    </span>
  );
}

export function MobileContentList({
  items,
  showDecorativeMedia,
  className,
}: {
  items: readonly MobileContentListItem[];
  showDecorativeMedia: boolean;
  className?: string;
}) {
  const hasExpanded = items.some((item) => item.expanded);
  const expandedId = items.find((item) => item.expanded)?.id ?? null;
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expandedId || !revealRef.current) return;
    if (!window.matchMedia(MOBILE_ONLY_QUERY).matches) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = revealRef.current.getBoundingClientRect().top + window.scrollY - 150;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [expandedId]);

  return (
    <ul className={`theme-content-list ${className ?? ""}`.trim()}>
      {items.map((item) => (
        <li
          key={item.id}
          className={`theme-content-list__item${
            hasExpanded && !item.expanded ? " theme-content-list__item--dim" : ""
          }`}
        >
          {item.expanded ? (
            <div ref={revealRef} className="theme-content-list__reveal">
              {item.onCollapse ? (
                <div className="theme-content-list__reveal-close">
                  <ModalCloseButton
                    size="lg"
                    ariaLabel={`Close ${item.title}`}
                    onClick={item.onCollapse}
                  />
                </div>
              ) : null}
              {item.expanded}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={item.onClick}
                aria-label={item.ariaLabel}
                className={`theme-content-list__row ${item.wiggling ? "animate-wiggle" : ""}`.trim()}
                {...trackAttrs(item.id)}
              >
                <ListGraphic graphic={item.graphic} showDecorativeMedia={showDecorativeMedia} />
                <span className="theme-content-list__copy">
                  {item.date ? <span className="theme-content-list__date">{item.date}</span> : null}
                  <span className="theme-content-list__title">{item.title}</span>
                </span>
              </button>
              {item.footer ? <div className="theme-content-list__footer">{item.footer}</div> : null}
            </>
          )}
        </li>
      ))}
    </ul>
  );
}
