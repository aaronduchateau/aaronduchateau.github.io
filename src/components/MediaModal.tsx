"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { displayExternalUrl, LeaveSiteConfirm } from "@/components/LeaveSiteConfirm";
import { ModalChromeIconButton } from "@/components/ModalChromeIconButton";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button } from "@/components/ui";
import { ChromelessYouTubePlayer } from "@/components/ChromelessYouTubePlayer";
import { useActivity } from "@/activity/ActivityProvider";
import { applyFeatureGates } from "@/activity/unlockRoutes";
import { recordActivity } from "@/activity/tracker";
import { DevModalToolsMenu, dumpStudioExport } from "@/dev/content-studio";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { isDevMode } from "@/lib/portfolioMode";
import {
  DEFAULT_MODAL_STRUCTURE_POLICY,
  enterCollectionIndex,
  finalResultPhotoIdForView,
  resolveCollectionCover,
  resolveModalStructure,
  type ModalStructurePolicy,
} from "@/modal-structure";
import { playBoundNavClick } from "@/theme/sounds";
import type {
  MediaModalCollectionItem,
  MediaModalConfig,
  MediaModalItem,
  MediaModalSlideRevealItem,
} from "@/types/media-modal";

type Props = {
  config: MediaModalConfig | null;
  onClose: () => void;
  /** Drill-down stack of collection ids to restore on first mount. */
  initialPath?: string[];
  /** Item id (from config) selected within the current view on first mount. */
  initialItemId?: string | null;
  /** Called when the view (collection path + selected item) changes. */
  onNavigate?: (path: string[], itemId: string | null) => void;
};

function isCollection(item: MediaModalItem): item is MediaModalCollectionItem {
  return item.type === "collection";
}

/** Walk a drill-down path of collection ids, returning the resolved view. */
function resolveView(
  media: MediaModalItem[],
  path: string[],
): { items: MediaModalItem[]; collection: MediaModalCollectionItem | null; resolvedPath: string[] } {
  let items = media;
  let collection: MediaModalCollectionItem | null = null;
  const resolvedPath: string[] = [];
  for (const id of path) {
    const next = items.find((it) => it.id === id && isCollection(it)) as
      | MediaModalCollectionItem
      | undefined;
    if (!next) break;
    collection = next;
    items = next.items;
    resolvedPath.push(id);
  }
  return { items, collection, resolvedPath };
}

/** First strip item, including nested albums (e.g. Ceiling fan in Repairs). */
function firstViewableIndex(items: MediaModalItem[]): number {
  return items.length === 0 ? 0 : 0;
}

function FinalResultBadge({
  compact,
  onGoBack,
}: {
  compact?: boolean;
  /** When set, badge becomes a hover “GO BACK” control that exits the collection. */
  onGoBack?: () => void;
}) {
  if (compact) {
    return (
      <span
        className="theme-success-badge--solid pointer-events-none absolute bottom-0.5 right-0.5 z-10 inline-flex max-w-[calc(100%-4px)] items-center gap-0.5 rounded px-1 py-0.5 text-[7px] font-bold uppercase leading-none tracking-wide shadow-sm"
        title="Intended final result"
      >
        <svg className="h-2.5 w-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <span className="truncate">Intended</span>
      </span>
    );
  }

  const shellClass =
    "absolute bottom-3 right-3 z-10 origin-bottom-right transition-transform duration-200 ease-out will-change-transform motion-reduce:transition-none";

  const pillClass =
    "theme-success-badge--solid inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide shadow-lg shadow-black/40";

  const iconSlot = (
    <span className="relative h-3.5 w-3.5 shrink-0" aria-hidden>
      <svg
        className="absolute inset-0 h-3.5 w-3.5 transition-opacity duration-200 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
      <svg
        className="absolute inset-0 h-3.5 w-3.5 opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </span>
  );

  const labelSlot = (
    <span className="relative inline-grid">
      <span className="invisible col-start-1 row-start-1 whitespace-nowrap" aria-hidden>
        Intended final result
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap transition-opacity duration-200 ease-out group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none">
        Intended final result
      </span>
      <span className="col-start-1 row-start-1 whitespace-nowrap opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
        Go back
      </span>
    </span>
  );

  if (onGoBack) {
    return (
      <button
        type="button"
        onClick={onGoBack}
        className={`group ${shellClass} hover:scale-110 focus-visible:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300`}
        aria-label="Go back"
      >
        <span className={pillClass}>
          {iconSlot}
          {labelSlot}
        </span>
      </button>
    );
  }

  return (
    <span className={`pointer-events-none ${shellClass}`}>
      <span className={pillClass}>
        <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Intended final result
      </span>
    </span>
  );
}

function isTestimonialOnly(media: MediaModalItem[]) {
  return media.length > 0 && media.every((m) => m.type === "testimonial");
}

function isItemLocked(item: MediaModalItem | null | undefined) {
  return Boolean(item?.locked);
}

function isMediaTreeUnlocked(items: MediaModalItem[]): boolean {
  return items.every((item) => {
    if (item.locked) return false;
    if (item.type === "collection") return isMediaTreeUnlocked(item.items);
    return true;
  });
}

function LockGlyph({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 11V8a5 5 0 0 1 10 0v3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" opacity="0.92" />
      <circle cx="12" cy="16" r="1.5" fill="rgb(15 23 42)" />
    </svg>
  );
}

function lockedMediaImageClass(locked: boolean, extra: string) {
  return locked ? `${extra} theme-media-locked`.trim() : extra;
}

/** Centered lock badge over veiled media (pane or thumb). */
function LockOverlay({ compact }: { compact?: boolean }) {
  return (
    <span
      className={`theme-media-lock-veil pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/35 text-white ${
        compact ? "" : "backdrop-blur-[1px]"
      }`}
      aria-hidden
    >
      <span
        className={`theme-media-lock-veil__mark inline-flex items-center justify-center rounded-full bg-surface-950/80 ring-1 ring-white/25 ${
          compact ? "h-7 w-7" : "h-14 w-14 shadow-lg"
        }`}
      >
        <LockGlyph className={compact ? "h-3.5 w-3.5" : "h-7 w-7"} />
      </span>
    </span>
  );
}

function thumbnailSrc(item: MediaModalItem, policy: ModalStructurePolicy) {
  if (item.type === "video") {
    return `https://img.youtube.com/vi/${item.youtubeId}/default.jpg`;
  }
  if (item.type === "photo") return item.src;
  if (item.type === "slideReveal") return item.before.src;
  if (item.type === "collection") return resolveCollectionCover(item, policy).src;
  return item.photoSrc ?? "/photos/testimonials/Aaron_DuChateau_placeholder-avatar.svg";
}

const SLIDE_REVEAL_REST = 50;
const SLIDE_REVEAL_PEAK = 94;
const SLIDE_REVEAL_INTRO_START = 6;
const SLIDE_REVEAL_INTRO_MS = 1800;
const SLIDE_REVEAL_RETURN_MS = 750;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

function SlideRevealPane({
  item,
  forceBw,
}: {
  item: MediaModalSlideRevealItem;
  forceBw?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const animating = useRef(false);
  const [position, setPosition] = useState(SLIDE_REVEAL_INTRO_START);
  const [hasIntroAnimated, setHasIntroAnimated] = useState(false);

  const setPositionFromClientX = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  useEffect(() => {
    dragging.current = false;
    animating.current = false;
    setHasIntroAnimated(false);
    setPosition(SLIDE_REVEAL_INTRO_START);

    const start = performance.now();
    animating.current = true;

    let frame = 0;
    const total = SLIDE_REVEAL_INTRO_MS + SLIDE_REVEAL_RETURN_MS;
    const tick = (now: number) => {
      if (!animating.current) return;
      const elapsed = now - start;
      let next: number;
      if (elapsed < SLIDE_REVEAL_INTRO_MS) {
        const t = elapsed / SLIDE_REVEAL_INTRO_MS;
        next = SLIDE_REVEAL_INTRO_START + (SLIDE_REVEAL_PEAK - SLIDE_REVEAL_INTRO_START) * easeOutCubic(t);
      } else {
        const t = Math.min(1, (elapsed - SLIDE_REVEAL_INTRO_MS) / SLIDE_REVEAL_RETURN_MS);
        next = SLIDE_REVEAL_PEAK + (SLIDE_REVEAL_REST - SLIDE_REVEAL_PEAK) * easeInOutCubic(t);
      }
      setPosition(next);
      if (elapsed < total) {
        frame = requestAnimationFrame(tick);
      } else {
        setPosition(SLIDE_REVEAL_REST);
        animating.current = false;
        setHasIntroAnimated(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      animating.current = false;
      cancelAnimationFrame(frame);
    };
  }, [item.id]);

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) return;
      setPositionFromClientX(event.clientX);
    };
    const onUp = () => {
      dragging.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [setPositionFromClientX]);

  const clipRight = 100 - position;
  const showPulse = hasIntroAnimated && !dragging.current;

  return (
    <div
      ref={containerRef}
      className={`relative min-h-0 w-full flex-1 touch-none select-none overflow-hidden bg-black ${
        forceBw ? "grayscale" : ""
      }`}
      onPointerDown={(event) => {
        if (isItemLocked(item)) return;
        animating.current = false;
        dragging.current = true;
        containerRef.current?.setPointerCapture(event.pointerId);
        setPositionFromClientX(event.clientX);
      }}
    >
      <div className="absolute inset-0">
        <Image
          src={item.after.src}
          alt={item.after.alt}
          fill
          className={lockedMediaImageClass(isItemLocked(item), "object-contain")}
          sizes="100vw"
          draggable={false}
        />
      </div>

      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${clipRight}% 0 0)` }}>
        <Image
          src={item.before.src}
          alt={item.before.alt}
          fill
          className={lockedMediaImageClass(isItemLocked(item), "object-contain")}
          sizes="100vw"
          draggable={false}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.45)]"
        style={{ left: `${position}%` }}
        aria-hidden
      />

      <div
        className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${position}%` }}
        aria-hidden
      >
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/90 bg-surface-950/75 shadow-lg backdrop-blur-sm ${
            showPulse ? "animate-pulse" : ""
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 8l-4 4 4 4M16 8l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white/80 backdrop-blur-sm">
        Slide to compare
      </p>
      {isItemLocked(item) ? <LockOverlay /> : null}
    </div>
  );
}

function CollectionEnterSplashGate({
  splash,
  onContinue,
}: {
  splash: NonNullable<MediaModalConfig["enterSplash"]>;
  onContinue: () => void;
}) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center gap-8 px-3 text-center sm:px-6">
      <p className="max-w-md text-lg font-semibold leading-snug tracking-tight text-surface-100 sm:text-xl">
        {splash.message}
      </p>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-full bg-accent-500/90 px-8 py-2.5 text-sm font-semibold text-surface-950 hover:bg-accent-400"
      >
        {splash.continueLabel ?? "Continue"}
      </button>
    </div>
  );
}

function MediaPane({
  item,
  onEnter,
  forceBw,
  showFinalResult,
  onFinalResultGoBack,
  structurePolicy,
}: {
  item: MediaModalItem;
  onEnter?: () => void;
  forceBw?: boolean;
  showFinalResult?: boolean;
  onFinalResultGoBack?: () => void;
  structurePolicy: ModalStructurePolicy;
}) {
  const locked = isItemLocked(item);
  const bw = forceBw ? "grayscale" : "";

  if (item.type === "collection") {
    const cover = resolveCollectionCover(item, structurePolicy);
    return (
      <button
        type="button"
        onClick={locked ? undefined : onEnter}
        disabled={locked}
        className={`group relative min-h-0 w-full flex-1 overflow-hidden bg-black ${bw} ${
          locked ? "cursor-not-allowed" : ""
        }`}
        aria-label={locked ? `${item.openLabel ?? item.title} (locked)` : `Open ${item.openLabel ?? item.title}`}
        data-track-id={item.id}
      >
        <Image
          src={cover.src}
          alt={cover.alt ?? item.title}
          fill
          className={lockedMediaImageClass(locked, "object-contain")}
          sizes="100vw"
        />
        {locked ? (
          <LockOverlay />
        ) : (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-gradient-to-t from-black/80 to-transparent p-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-500/90 px-5 py-2.5 text-sm font-semibold text-surface-950 transition group-hover:bg-accent-400">
              Open {item.openLabel ?? item.title}
              <span aria-hidden>→</span>
            </span>
          </span>
        )}
      </button>
    );
  }

  if (item.type === "video") {
    if (locked) {
      return (
        <div
          className={`relative flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-black ${bw}`}
          aria-label="Video locked"
        >
          <Image
            src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
            alt=""
            fill
            className={lockedMediaImageClass(true, "object-contain")}
            sizes="100vw"
          />
          <LockOverlay />
        </div>
      );
    }
    return (
      <div className={`flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-black ${bw}`}>
        <ChromelessYouTubePlayer
          youtubeId={item.youtubeId}
          startSeconds={item.startSeconds}
          title="Video"
          className="min-h-0 flex-1"
          onEnded={() => {
            void recordActivity({
              type: "video.complete",
              contentId: item.id,
              label: `Video ${item.id}`,
            });
          }}
        />
      </div>
    );
  }

  if (item.type === "photo") {
    return (
      <div className={`relative min-h-0 w-full flex-1 overflow-hidden bg-black ${bw}`}>
        <Image
          src={item.src}
          alt={item.alt}
          fill
          className={lockedMediaImageClass(locked, "object-contain")}
          sizes="100vw"
        />
        {showFinalResult ? <FinalResultBadge onGoBack={onFinalResultGoBack} /> : null}
        {locked ? <LockOverlay /> : null}
      </div>
    );
  }

  if (item.type === "slideReveal") {
    return <SlideRevealPane item={item} forceBw={forceBw} />;
  }

  return (
    <div className={`relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-1 ${bw}`}>
      <blockquote className="text-sm leading-relaxed text-surface-300 sm:text-base">
        <p>&ldquo;{item.quote}&rdquo;</p>
      </blockquote>
      <footer className="mt-6 flex items-center gap-4 border-t border-white/10 pt-4 text-sm">
        {item.photoSrc ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/15">
            <Image
              src={item.photoSrc}
              alt=""
              fill
              className={lockedMediaImageClass(locked, "object-cover grayscale")}
              sizes="48px"
            />
          </div>
        ) : null}
        <div>
          <p className="font-semibold text-white">{item.attribution}</p>
          {item.org ? <p className="text-surface-500">{item.org}</p> : null}
        </div>
      </footer>
      {locked ? <LockOverlay /> : null}
    </div>
  );
}

function ExternalLinkCta({
  link,
  onOpenLeaveConfirm,
}: {
  link: { href: string; label: string };
  onOpenLeaveConfirm: () => void;
}) {
  return (
    <Button
      role="primary"
      className="w-full px-6 py-3"
      onClick={() => {
        playBoundNavClick();
        onOpenLeaveConfirm();
      }}
    >
      {link.label}
    </Button>
  );
}

function modalDetailNodes(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

function ContextColumn({
  contextLabel,
  heading,
  intro,
  detailLead,
  detail,
}: {
  contextLabel: string;
  heading: string;
  intro?: string;
  detailLead?: string;
  detail?: string;
}) {
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">{contextLabel}</p>
      <h2 id="media-modal-title" className={`modal-display-heading mt-2 text-xl sm:text-2xl`}>
        <span className="modal-display-heading__text">{heading}</span>
      </h2>
      {intro ? <p className="mt-3 shrink-0 text-sm leading-relaxed text-surface-300">{intro}</p> : null}
      {detailLead || detail ? (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-white/10 pt-4 text-sm leading-relaxed text-surface-400">
          {detailLead ? <p className="font-bold">{detailLead}</p> : null}
          {detail ? (
            <div className={`whitespace-pre-line ${detailLead ? "mt-3" : ""}`}>
              {modalDetailNodes(detail)}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

const THUMB_STRIDE_FALLBACK = 88; // w-20 (80px) + gap-2 (8px)

const thumbPaddleClass =
  "flex h-14 w-8 shrink-0 items-center justify-center self-center rounded-md border border-white/15 bg-surface-900/70 text-accent-400/80 transition hover:border-accent-500/40 hover:bg-accent-950/40 hover:text-accent-300 disabled:cursor-not-allowed disabled:opacity-30";

function ThumbChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ThumbChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}

/** Distance between the first two strip slots (thumb + gap, or collection stack width). */
function thumbStridePx(strip: HTMLElement): number {
  const { children } = strip;
  if (children.length >= 2) {
    const first = children[0] as HTMLElement;
    const second = children[1] as HTMLElement;
    return second.offsetLeft - first.offsetLeft;
  }
  if (children.length === 1) {
    return (children[0] as HTMLElement).offsetWidth + 8;
  }
  return THUMB_STRIDE_FALLBACK;
}

function thumbImageClass(item: MediaModalItem) {
  const fit = item.type === "photo" ? "object-contain bg-black" : "object-cover";
  return lockedMediaImageClass(isItemLocked(item), fit);
}

function ThumbnailStrip({
  items,
  activeItemId,
  onSelect,
  onReorder,
  rearranging,
  finalResultItemId,
  structurePolicy,
}: {
  items: MediaModalItem[];
  activeItemId: string | null;
  onSelect: (item: MediaModalItem, index: number) => void;
  /** Dev sort mode — live order update. */
  onReorder?: (next: MediaModalItem[]) => void;
  rearranging?: boolean;
  /** When set, that photo thumb shows a compact final-result mark. */
  finalResultItemId?: string | null;
  structurePolicy: ModalStructurePolicy;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const dragIndexRef = useRef<number | null>(null);
  const didDragRef = useRef(false);
  const droppedRef = useRef(false);

  const activeIndex = useMemo(
    () => items.findIndex((item) => item.id === activeItemId),
    [items, activeItemId],
  );

  const finishDrag = useCallback(() => {
    dragIndexRef.current = null;
    didDragRef.current = false;
    droppedRef.current = false;
  }, []);

  const handleDrop = (dropIndex: number) => {
    if (!rearranging || !onReorder) {
      finishDrag();
      return;
    }
    if (droppedRef.current) return;
    const from = dragIndexRef.current;
    if (from === null || from === dropIndex) {
      finishDrag();
      return;
    }
    droppedRef.current = true;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(dropIndex, 0, moved);
    onReorder(next);
    finishDrag();
  };

  const dragHandlers = (index: number) =>
    rearranging
      ? {
          draggable: true as const,
          onDragStart: (e: DragEvent) => {
            e.dataTransfer.effectAllowed = "move";
            dragIndexRef.current = index;
            didDragRef.current = true;
          },
          onDragOver: (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = "move";
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleDrop(index);
          },
        }
      : {};

  const setThumbRef = (id: string, el: HTMLButtonElement | null) => {
    if (el) thumbRefs.current.set(id, el);
    else thumbRefs.current.delete(id);
  };

  /** Step selection; keep active thumb inset so ring isn’t clipped at the scrollport. */
  const stepSelection = useCallback(
    (direction: -1 | 1) => {
      if (rearranging) return;
      const idx = activeIndex >= 0 ? activeIndex : 0;
      const next = idx + direction;
      if (next < 0 || next >= items.length) return;
      const item = items[next];
      if (!item) return;
      onSelect(item, next);
      requestAnimationFrame(() => {
        const strip = stripRef.current;
        const el = thumbRefs.current.get(item.id);
        if (!strip || !el) return;
        const stripRect = strip.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const pad = 12; // match strip inset so ring-2 stays fully visible
        if (elRect.left < stripRect.left + pad) {
          strip.scrollBy({ left: elRect.left - stripRect.left - pad, behavior: "smooth" });
        } else if (elRect.right > stripRect.right - pad) {
          strip.scrollBy({ left: elRect.right - stripRect.right + pad, behavior: "smooth" });
        }
      });
    },
    [activeIndex, items, onSelect, rearranging],
  );

  const showPaddles = items.length > 1;
  const canGoPrev = !rearranging && activeIndex > 0;
  const canGoNext = !rearranging && activeIndex >= 0 && activeIndex < items.length - 1;

  return (
    <div className="mt-3 flex shrink-0 items-stretch gap-1.5">
      {showPaddles ? (
        <button
          type="button"
          onClick={() => stepSelection(-1)}
          disabled={!canGoPrev}
          aria-label="Previous item"
          className={thumbPaddleClass}
        >
          <ThumbChevronLeft className="h-5 w-5" />
        </button>
      ) : null}

      {/*
        Inset padding + per-thumb p-1 wrappers keep ring highlights from clipping
        against the scrollport / paddles (first & last active thumbs).
      */}
      <div
        ref={stripRef}
        className="flex min-w-0 flex-1 gap-1 overflow-x-auto px-2.5 py-2 scrollbar-none"
        onDragEnd={finishDrag}
      >
        {items.map((item, index) => {
          const isActive = item.id === activeItemId;
          const dragProps = dragHandlers(index);

          const handleClick = () => {
            if (didDragRef.current) {
              didDragRef.current = false;
              return;
            }
            if (rearranging) return;
            if (activeItemId === item.id) return;

            const strip = stripRef.current;
            const prevId = activeItemId;
            const prevEl = prevId ? thumbRefs.current.get(prevId) : null;
            const prevLeft = prevEl?.getBoundingClientRect().left;

            onSelect(item, index);

            if (!strip || !prevId || prevLeft === undefined) return;
            if (prevId === items[0]?.id || item.id === items[0]?.id) return;

            const nextEl = thumbRefs.current.get(item.id);
            const nextLeft = nextEl?.getBoundingClientRect().left;
            if (nextLeft === undefined) return;

            const stride = thumbStridePx(strip);
            if (nextLeft > prevLeft + 1) {
              strip.scrollBy({ left: stride, behavior: "smooth" });
            } else if (nextLeft < prevLeft - 1) {
              strip.scrollBy({ left: -stride, behavior: "smooth" });
            }
          };

          if (isCollection(item)) {
            return (
              <div key={item.id} className="relative mr-1 shrink-0 p-1">
                <span
                  aria-hidden
                  className="absolute left-2.5 top-2.5 h-14 w-20 rounded-md bg-surface-800 ring-1 ring-white/10"
                />
                <span
                  aria-hidden
                  className="absolute left-1.5 top-1.5 h-14 w-20 rounded-md bg-surface-700 ring-1 ring-white/10"
                />
                <button
                  ref={(el) => setThumbRef(item.id, el)}
                  type="button"
                  data-thumb
                  onClick={handleClick}
                  {...dragProps}
                  className={`relative block h-14 w-20 overflow-hidden rounded-md ring-2 transition ${
                    isActive ? "ring-accent-400" : "ring-white/25 hover:ring-accent-400"
                  } ${rearranging ? "cursor-grab active:cursor-grabbing" : ""}`}
                  aria-label={`Open ${item.title} (${item.items.length} items)`}
                  aria-current={isActive ? "true" : undefined}
                >
                  <Image
                    src={thumbnailSrc(item, structurePolicy)}
                    alt=""
                    fill
                    className={thumbImageClass(item)}
                    sizes="80px"
                    draggable={false}
                  />
                  {isItemLocked(item) ? <LockOverlay compact /> : null}
                  <span className="absolute bottom-0 right-0 rounded-tl-md bg-surface-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-accent-200">
                    {item.items.length}
                  </span>
                </button>
              </div>
            );
          }

          return (
            <div key={item.id} className="shrink-0 p-1">
              <button
                ref={(el) => setThumbRef(item.id, el)}
                type="button"
                data-thumb
                onClick={handleClick}
                {...dragProps}
              className={`relative block h-14 w-20 overflow-hidden rounded-md ring-2 transition ${
                isActive ? "ring-accent-400" : "ring-white/15 opacity-70 hover:opacity-100"
              } ${rearranging ? "cursor-grab active:cursor-grabbing" : ""}`}
                aria-label={
                  isItemLocked(item) ? `Show slide ${index + 1} (locked)` : `Show slide ${index + 1}`
                }
                aria-current={isActive ? "true" : undefined}
              >
                <Image
                  src={thumbnailSrc(item, structurePolicy)}
                  alt=""
                  fill
                  className={thumbImageClass(item)}
                  sizes="80px"
                  draggable={false}
                />
                {isItemLocked(item) ? <LockOverlay compact /> : null}
                {finalResultItemId === item.id ? <FinalResultBadge compact /> : null}
              </button>
            </div>
          );
        })}
      </div>

      {showPaddles ? (
        <button
          type="button"
          onClick={() => stepSelection(1)}
          disabled={!canGoNext}
          aria-label="Next item"
          className={thumbPaddleClass}
        >
          <ThumbChevronRight className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

function ModalHeader({
  date,
  onClose,
  padX,
  tools,
  compactNav,
}: {
  date: string;
  onClose: () => void;
  padX: string;
  tools?: ReactNode;
  compactNav?: {
    infoMode: boolean;
    onToggleInfo: () => void;
    collectionBack?: { label: string; onClick: () => void };
  };
}) {
  return (
    <div className={`flex h-14 shrink-0 items-center justify-between border-b border-white/10 ${padX}`}>
      <ModalCloseButton onClick={onClose} />
      <div className="flex items-center gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">{date}</p>
        {compactNav && !compactNav.infoMode && compactNav.collectionBack ? (
          <span className="lg:hidden">
            <ModalChromeIconButton
              icon="back"
              ariaLabel={compactNav.collectionBack.label}
              onClick={compactNav.collectionBack.onClick}
            />
          </span>
        ) : null}
        {tools}
        {compactNav ? (
          <span className="lg:hidden">
            <ModalChromeIconButton
              icon={compactNav.infoMode ? "back" : "info"}
              ariaLabel={compactNav.infoMode ? "Back to media" : "View context"}
              onClick={compactNav.onToggleInfo}
            />
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function MediaModal({ config, onClose, initialPath, initialItemId, onNavigate }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [sorting, setSorting] = useState(false);
  const [forceBw, setForceBw] = useState(false);
  const [draftItems, setDraftItems] = useState<MediaModalItem[] | null>(null);
  const [splashDismissed, setSplashDismissed] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [structurePolicy, setStructurePolicy] = useState<ModalStructurePolicy>(
    DEFAULT_MODAL_STRUCTURE_POLICY,
  );

  useModalAccessibility(Boolean(config) && mounted, dialogRef, onClose);
  const { grantedPrizes } = useActivity();
  const media = useMemo(
    () => applyFeatureGates(config?.media ?? [], grantedPrizes.featureIds),
    [config?.media, grantedPrizes.featureIds],
  );

  const path = useMemo(
    () => resolveView(media, initialPath ?? []).resolvedPath,
    [media, initialPath],
  );
  const pathKey = path.join("~");

  const { items: resolvedItems, collection } = useMemo(() => resolveView(media, path), [media, path]);
  const currentItems = sorting && draftItems ? draftItems : resolvedItems;

  useEffect(() => {
    setDraftItems(null);
    setSorting(false);
  }, [pathKey, config?.title]);

  useEffect(() => {
    setSplashDismissed(false);
  }, [config?.title, config?.date, config?.enterSplash?.message]);

  useEffect(() => {
    let cancelled = false;
    const structureId = config?.structureId ?? "default";
    void resolveModalStructure({ structureId }).then((policy) => {
      if (!cancelled) setStructurePolicy(policy);
    });
    return () => {
      cancelled = true;
    };
  }, [config?.structureId]);

  useEffect(() => {
    if (!sorting) return;
    setDraftItems((prev) => prev ?? resolvedItems.map((item) => item));
  }, [sorting, resolvedItems]);

  const parentCollection = useMemo(
    () => resolveView(media, path.slice(0, -1)).collection,
    [media, path],
  );

  const pathLabels = useMemo(() => {
    const labels: string[] = [];
    let cursor = media;
    for (const id of path) {
      const next = cursor.find((it) => it.id === id && isCollection(it)) as
        | MediaModalCollectionItem
        | undefined;
      if (!next) break;
      labels.push(next.title);
      cursor = next.items;
    }
    return labels;
  }, [media, path]);

  const dumpOrder = useCallback(
    (items: MediaModalItem[]) => {
      if (!config || !isDevMode()) return;
      dumpStudioExport({
        modalTitle: config.title,
        path: [...path],
        pathLabels: [...pathLabels],
        items,
      });
    },
    [config, path, pathLabels],
  );

  const toggleSort = useCallback(() => {
    if (!isDevMode()) return;
    setSorting((prev) => {
      const next = !prev;
      if (next) {
        const items = (draftItems ?? resolvedItems).map((item) => item);
        setDraftItems(items);
        dumpOrder(items);
      }
      return next;
    });
  }, [draftItems, dumpOrder, resolvedItems]);

  const handleReorder = useCallback(
    (next: MediaModalItem[]) => {
      setDraftItems(next);
      dumpOrder(next);
    },
    [dumpOrder],
  );

  const activeIndex = useMemo(() => {
    const idx = currentItems.findIndex((item) => item.id === initialItemId);
    return idx >= 0 ? idx : firstViewableIndex(currentItems);
  }, [currentItems, initialItemId]);

  const testimonialOnly = useMemo(() => isTestimonialOnly(currentItems), [currentItems]);
  const activeItem = currentItems[activeIndex] ?? null;
  const locked = isItemLocked(activeItem);
  const itemOwnLink =
    activeItem && "externalLink" in activeItem ? activeItem.externalLink : undefined;
  // Locked items never inherit the modal-level YouTube/external CTA (photos shouldn't
  // surface the first video's link). Own links still show, but disabled.
  const activeLink = itemOwnLink ?? (locked ? undefined : config?.externalLink);
  const allContentUnlocked = isMediaTreeUnlocked(media);

  const activePhotoId =
    activeItem && (activeItem.type === "photo" || activeItem.type === "slideReveal")
      ? activeItem.id
      : null;
  const activePhotoLabel =
    activeItem?.type === "photo"
      ? activeItem.alt || activeItem.id
      : activeItem?.type === "slideReveal"
        ? activeItem.intro || activeItem.id
        : null;

  useEffect(() => {
    if (!activePhotoId || !activePhotoLabel) return;
    void recordActivity({
      type: "photo.view",
      contentId: activePhotoId,
      label: activePhotoLabel,
    });
  }, [activePhotoId, activePhotoLabel]);

  const onNavigateRef = useRef(onNavigate);
  onNavigateRef.current = onNavigate;

  const navigate = useCallback(
    (nextPath: string[], index: number) => {
      const { items, resolvedPath } = resolveView(media, nextPath);
      const safeIndex = index >= 0 && index < items.length ? index : firstViewableIndex(items);
      onNavigateRef.current?.(resolvedPath, items[safeIndex]?.id ?? null);
    },
    [media],
  );

  const handleStripSelect = useCallback(
    (item: MediaModalItem, index: number) => {
      // Paddles / thumbs only select at the current level — never drill into collections.
      if (index < 0 || index >= currentItems.length || currentItems[index]?.id !== item.id) return;
      navigate(path, index);
    },
    [currentItems, navigate, path],
  );

  const exitCollection = useCallback(() => navigate(path.slice(0, -1), -1), [navigate, path]);

  const enterCollection = useCallback(
    (item: MediaModalItem) => {
      if (!isCollection(item)) return;
      const nextPath = [...path, item.id];
      const index = enterCollectionIndex(item.items, structurePolicy, firstViewableIndex);
      navigate(nextPath, index);
    },
    [navigate, path, structurePolicy],
  );

  const activeItemId = activeItem?.id ?? null;
  /** Sort only when the current path’s content list has 2+ items (from modal JSON). */
  const canSort = resolvedItems.length > 1;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!canSort && sorting) setSorting(false);
  }, [canSort, sorting]);

  useEffect(() => {
    setLeaveConfirm(false);
  }, [activeItemId]);

  if (!config || !activeItem || !mounted) return null;

  const showEnterSplash = Boolean(config.enterSplash) && !splashDismissed;
  const padX = testimonialOnly ? "px-3 sm:px-8" : "px-3 sm:px-8 md:px-10";

  const contextLabel = collection?.contextLabel ?? config.contextLabel;
  const heading = collection?.title ?? config.title;
  const intro = activeItem.intro ?? collection?.intro ?? config.intro;
  const detailLead = config.detailLead;
  const detail = activeItem.detail ?? collection?.detail ?? config.detail;
  const backLabel = `Back to ${parentCollection?.title ?? config.title}`;
  const finalPhotoId = finalResultPhotoIdForView(collection, currentItems, structurePolicy);
  const showWatchCta = Boolean(activeLink) && allContentUnlocked && !leaveConfirm;

  const openLeaveConfirm = () => {
    setLeaveConfirm(true);
    if (!activeLink || !activeItem) return;
    void recordActivity({
      type: "project.leavePreview",
      contentId: activeItem.id,
      label: `Leave preview · ${heading}`,
      meta: { href: activeLink.href },
    });
  };

  const confirmLeaveVisit = () => {
    if (!activeLink || !activeItem) return;
    void recordActivity({
      type: "project.visitSite",
      contentId: activeItem.id,
      label: `Visit site · ${heading}`,
      meta: { href: activeLink.href },
    });
  };

  const leaveConfirmPane =
    leaveConfirm && activeLink ? (
      <LeaveSiteConfirm
        phase={2}
        title={heading}
        subtitle={displayExternalUrl(activeLink.href)}
        href={activeLink.href}
        paddleLabel={heading}
        onTogglePhase={() => setLeaveConfirm(false)}
        onVisit={confirmLeaveVisit}
        className="min-h-0 flex-1 bg-black"
      />
    ) : null;

  const studioTools = isDevMode();
  const tools =
    studioTools && !testimonialOnly ? (
      <DevModalToolsMenu
        canSort={canSort}
        sorting={sorting}
        forceBw={forceBw}
        onToggleSort={toggleSort}
        onToggleForceBw={() => setForceBw((v) => !v)}
      />
    ) : null;

  const strip =
    currentItems.length > 1 ? (
      <ThumbnailStrip
        items={currentItems}
        activeItemId={activeItemId}
        onSelect={handleStripSelect}
        rearranging={studioTools && sorting}
        onReorder={studioTools && sorting ? handleReorder : undefined}
        finalResultItemId={finalPhotoId}
        structurePolicy={structurePolicy}
      />
    ) : null;

  if (testimonialOnly) {
    return createPortal(
      <div
        ref={dialogRef}
        className="modal-launch fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-modal-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          aria-label="Close modal"
          onClick={() => {
            playBoundNavClick();
            onClose();
          }}
        />
        <div className="relative z-10 flex h-[min(86dvh,820px)] max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-950 shadow-2xl">
          <ModalHeader date={config.date} onClose={onClose} padX={padX} tools={tools} />
          <div className={`flex min-h-0 flex-1 flex-col overflow-hidden ${padX} py-4`}>
            {leaveConfirmPane ?? (
              <MediaPane item={activeItem} forceBw={forceBw} structurePolicy={structurePolicy} />
            )}
            {showWatchCta && activeLink ? (
              <div className="mt-6">
                <ExternalLinkCta link={activeLink} onOpenLeaveConfirm={openLeaveConfirm} />
              </div>
            ) : null}
          </div>
        </div>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      ref={dialogRef}
      className="modal-launch fixed inset-0 z-[120] flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface-950"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-modal-title"
      tabIndex={-1}
    >
      <ModalHeader
        date={config.date}
        onClose={onClose}
        padX={padX}
        tools={tools}
        compactNav={{
          infoMode: showMobileContext,
          onToggleInfo: () => setShowMobileContext((open) => !open),
          collectionBack:
            path.length > 0
              ? { label: backLabel, onClick: exitCollection }
              : undefined,
        }}
      />

      {showEnterSplash && config.enterSplash ? (
        <CollectionEnterSplashGate
          splash={config.enterSplash}
          onContinue={() => setSplashDismissed(true)}
        />
      ) : (
      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.45fr)]">
        <div
          className={`min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain ${padX} py-2 sm:py-3 ${
            showMobileContext ? "flex" : "hidden lg:flex"
          }`}
        >
          <ContextColumn
            contextLabel={contextLabel}
            heading={heading}
            intro={intro}
            detailLead={detailLead}
            detail={detail}
          />
        </div>

        <div
          className={`min-h-0 flex-col overflow-hidden border-t border-white/10 bg-black lg:border-l lg:border-t-0 ${padX} py-2 sm:py-3 ${
            showMobileContext ? "hidden lg:flex" : "flex"
          }`}
        >
          {path.length > 0 ? (
            <div className="mb-2 hidden shrink-0 items-center justify-between gap-2 lg:flex">
              <p className="min-w-0 truncate text-xs text-surface-500">{backLabel}</p>
              <ModalCloseButton size="sm" onClick={exitCollection} ariaLabel={backLabel} />
            </div>
          ) : null}

          {leaveConfirmPane ?? (
            <MediaPane
              item={activeItem}
              onEnter={() => enterCollection(activeItem)}
              forceBw={forceBw}
              showFinalResult={finalPhotoId !== null && activeItem.id === finalPhotoId}
              onFinalResultGoBack={
                structurePolicy.finalResultBadgeExitsCollection && path.length > 0
                  ? exitCollection
                  : undefined
              }
              structurePolicy={structurePolicy}
            />
          )}

          {strip}

          {showWatchCta && activeLink ? (
            <div className="mt-auto shrink-0 pt-3">
              <ExternalLinkCta link={activeLink} onOpenLeaveConfirm={openLeaveConfirm} />
            </div>
          ) : null}
        </div>
      </div>
      )}
    </div>,
    document.body,
  );
}

