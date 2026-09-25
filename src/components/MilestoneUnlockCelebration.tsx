"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { useCelebrationQueue } from "@/activity/CelebrationQueueProvider";
import { type MilestoneUnlockCelebrationDetail } from "@/activity/milestoneCelebration";
import { milestoneDisplayCopy } from "@/activity/milestones";
import { cardPrizeForMilestone } from "@/activity/milestonePrizes";
import { PRIZE_ANIMATIONS_CHANGE_EVENT } from "@/activity/prizeAnimationsPref";
import type { MilestoneCardPrize } from "@/activity/types";
import { ModalCloseButton } from "@/components/ModalCloseButton";

/** Read time; dismiss covers WCAG 2.2.2 past 5s. */
const HOLD_MS = 6000;
const REDUCE_HOLD_MS = 5500;
const FLY_MS = 1200;
const BETWEEN_MS = 360;
const SCORE_CHEST_SELECTOR = "[data-score-chest-anchor]";
const BADGE_EDGE_PAD_PX = 16;
const BADGE_MAX_WIDTH_PX = 340;
const BADGE_EST_HEIGHT_PX = 250;

const CARD_VB = { w: 380, h: 236 };

/** Shared by the photo slot and the SVG outline so the tilt stays one shape. */
const TOAST_FRAME = { l: 8, t: 64, r: 312, b: 228 };
const CARD_SLOT = {
  leftPct: 66.3,
  topPct: 3.4,
  widthPct: 29.5,
  heightPct: 66,
  originX: 0.5,
  originY: 0.7,
  tiltDeg: -8,
} as const;

type Phase = "hold" | "fly";
type Pt = { x: number; y: number };

type ActiveCelebration = MilestoneUnlockCelebrationDetail & {
  key: string;
  phase: Phase;
  holdMs: number;
  reduceMotion: boolean;
  card: MilestoneCardPrize | null;
  style: React.CSSProperties;
};

function n(value: number) {
  return Number(value.toFixed(2));
}

function rotatePoint(x: number, y: number, ox: number, oy: number, deg: number): Pt {
  const th = (deg * Math.PI) / 180;
  const cos = Math.cos(th);
  const sin = Math.sin(th);
  const dx = x - ox;
  const dy = y - oy;
  return { x: ox + dx * cos - dy * sin, y: oy + dx * sin + dy * cos };
}

function cardSlotInViewBox() {
  const l = (CARD_SLOT.leftPct / 100) * CARD_VB.w;
  const t = (CARD_SLOT.topPct / 100) * CARD_VB.h;
  const w = (CARD_SLOT.widthPct / 100) * CARD_VB.w;
  const h = (CARD_SLOT.heightPct / 100) * CARD_VB.h;
  const ox = l + w * CARD_SLOT.originX;
  const oy = t + h * CARD_SLOT.originY;
  return { l, t, w, h, ox, oy, tiltDeg: CARD_SLOT.tiltDeg };
}

function tiltedCardCorners() {
  const slot = cardSlotInViewBox();
  const rot = (x: number, y: number) => rotatePoint(x, y, slot.ox, slot.oy, slot.tiltDeg);
  return {
    tl: rot(slot.l, slot.t),
    tr: rot(slot.l + slot.w, slot.t),
    br: rot(slot.l + slot.w, slot.t + slot.h),
    bl: rot(slot.l, slot.t + slot.h),
    slot,
  };
}

function segmentIntersect(a: Pt, b: Pt, c: Pt, d: Pt): Pt | null {
  const den = (a.x - b.x) * (c.y - d.y) - (a.y - b.y) * (c.x - d.x);
  if (Math.abs(den) < 1e-8) return null;
  const t = ((a.x - c.x) * (c.y - d.y) - (a.y - c.y) * (c.x - d.x)) / den;
  const u = ((a.x - c.x) * (a.y - b.y) - (a.y - c.y) * (a.x - b.x)) / den;
  if (t < -1e-6 || t > 1 + 1e-6 || u < -1e-6 || u > 1 + 1e-6) return null;
  return { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
}

/**
 * Outer silhouette: toast rectangle ∪ tilted card.
 * Starts at bottom-center so the chase reads as a base bar first.
 */
function overlappingCardPath(): string {
  const { tl, tr, br, bl } = tiltedCardCorners();
  const toast = TOAST_FRAME;
  const toastRight = { x: toast.r, y: toast.t };
  const toastRightB = { x: toast.r, y: toast.b };
  const toastTopL = { x: toast.l, y: toast.t };
  const toastTopR = { x: toast.r, y: toast.t };
  const hitRight = segmentIntersect(br, bl, toastRight, toastRightB);
  const hitTop = segmentIntersect(bl, tl, toastTopL, toastTopR);
  if (!hitRight || !hitTop) {
    throw new Error("Prize toast outline: tilted card no longer intersects the frame.");
  }
  const midX = n((toast.l + toast.r) / 2);
  return [
    `M${midX} ${toast.b}`,
    `L${toast.r} ${toast.b}`,
    `L${n(hitRight.x)} ${n(hitRight.y)}`,
    `L${n(br.x)} ${n(br.y)}`,
    `L${n(tr.x)} ${n(tr.y)}`,
    `L${n(tl.x)} ${n(tl.y)}`,
    `L${n(hitTop.x)} ${n(hitTop.y)}`,
    `L${toast.l} ${toast.t}`,
    `L${toast.l} ${toast.b}`,
    `L${midX} ${toast.b}`,
    "Z",
  ].join(" ");
}

const CARD_PATH = overlappingCardPath();
const CARD_SLOT_STYLE: CSSProperties = {
  left: `${CARD_SLOT.leftPct}%`,
  top: `${CARD_SLOT.topPct}%`,
  width: `${CARD_SLOT.widthPct}%`,
  height: `${CARD_SLOT.heightPct}%`,
  transform: `rotate(${CARD_SLOT.tiltDeg}deg)`,
  transformOrigin: `${CARD_SLOT.originX * 100}% ${CARD_SLOT.originY * 100}%`,
};

function chestTargetStyle(): React.CSSProperties {
  const el = document.querySelector(SCORE_CHEST_SELECTOR);
  if (!el) {
    return {
      left: "calc(100% - 3rem)",
      top: "1.75rem",
      transform: "translate(-50%, -50%) scale(0.25)",
      opacity: 0,
    };
  }
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left + rect.width / 2,
    top: rect.top + rect.height / 2,
    transform: "translate(-50%, -50%) scale(0.18)",
    opacity: 0.12,
  };
}

function holdStyle(): React.CSSProperties {
  if (typeof window === "undefined") {
    return { left: 0, top: 0, transform: "scale(1)", opacity: 1 };
  }
  const badgeWidth = Math.min(window.innerWidth * 0.92, BADGE_MAX_WIDTH_PX);
  return {
    left: window.innerWidth - BADGE_EDGE_PAD_PX - badgeWidth,
    top: window.innerHeight - BADGE_EDGE_PAD_PX - BADGE_EST_HEIGHT_PX,
    transform: "translate(0, 0) scale(1)",
    opacity: 1,
  };
}

function PrizeChaseOutline({
  pathD,
  viewBox,
  holdMs,
  chasing,
}: {
  pathD: string;
  viewBox: string;
  holdMs: number;
  chasing: boolean;
}) {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);

  useLayoutEffect(() => {
    setLen(pathRef.current?.getTotalLength() ?? 0);
  }, [pathD]);

  const chaseReady = chasing && len > 0;

  const slot = cardSlotInViewBox();

  return (
    <svg className="theme-prize-toast__svg" viewBox={viewBox} aria-hidden>
      <rect
        className="theme-prize-toast__fill"
        x={TOAST_FRAME.l}
        y={TOAST_FRAME.t}
        width={TOAST_FRAME.r - TOAST_FRAME.l}
        height={TOAST_FRAME.b - TOAST_FRAME.t}
      />
      <rect
        className="theme-prize-toast__fill"
        x={slot.l}
        y={slot.t}
        width={slot.w}
        height={slot.h}
        transform={`rotate(${slot.tiltDeg} ${slot.ox} ${slot.oy})`}
      />
      <path className="theme-prize-toast__track" d={pathD} />
      <path
        ref={pathRef}
        className={`theme-prize-toast__chase${
          chaseReady ? " theme-prize-toast__chase--run" : len > 0 ? " theme-prize-toast__chase--done" : ""
        }`}
        d={pathD}
        style={
          {
            "--prize-path-length": `${len}`,
            "--prize-hold-ms": `${holdMs}ms`,
          } as CSSProperties
        }
      />
    </svg>
  );
}

/**
 * Bottom-right card award on the main site.
 * Copy is the unlock (what happened). Card photo and outline share one tilt.
 * Dismiss hides the toast (WCAG 2.2.2).
 */
export function MilestoneUnlockCelebration() {
  const { playingUnlock, playNonce, markFlewToChest, markFinished } = useCelebrationQueue();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<ActiveCelebration | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = useCallback(() => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  }, []);

  const finishCurrent = useCallback(() => {
    const nonce = playNonce;
    clearTimers();
    setActive(null);
    const id = window.setTimeout(() => markFinished(nonce), BETWEEN_MS);
    timersRef.current.push(id);
  }, [clearTimers, markFinished, playNonce]);

  const playUnlock = useCallback(
    (unlock: MilestoneUnlockCelebrationDetail) => {
      const reduceMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      clearTimers();
      const holdMs = reduceMotion ? REDUCE_HOLD_MS : HOLD_MS;
      const key = `${unlock.milestoneId}-${playNonce}`;
      setActive({
        ...unlock,
        key,
        phase: "hold",
        holdMs,
        reduceMotion,
        card: cardPrizeForMilestone(unlock.milestoneId),
        style: holdStyle(),
      });

      if (reduceMotion) {
        markFlewToChest();
        timersRef.current.push(window.setTimeout(finishCurrent, holdMs));
        return;
      }

      timersRef.current.push(
        window.setTimeout(() => {
          markFlewToChest();
          setActive((prev) =>
            prev && prev.key === key ? { ...prev, phase: "fly", style: chestTargetStyle() } : prev,
          );
        }, holdMs),
      );
      timersRef.current.push(window.setTimeout(finishCurrent, holdMs + FLY_MS));
    },
    [clearTimers, finishCurrent, markFlewToChest, playNonce],
  );

  useEffect(() => {
    setMounted(true);
    return () => clearTimers();
  }, [clearTimers]);

  useEffect(() => {
    if (!playingUnlock) {
      clearTimers();
      setActive(null);
      return;
    }
    playUnlock(playingUnlock);
  }, [playingUnlock, playNonce, playUnlock, clearTimers]);

  useEffect(() => {
    const onPrefChange = (event: Event) => {
      const enabled = (event as CustomEvent<boolean>).detail;
      if (enabled) return;
      clearTimers();
      setActive(null);
    };
    window.addEventListener(PRIZE_ANIMATIONS_CHANGE_EVENT, onPrefChange);
    return () => window.removeEventListener(PRIZE_ANIMATIONS_CHANGE_EVENT, onPrefChange);
  }, [clearTimers]);

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      finishCurrent();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [active, finishCurrent]);

  if (!mounted || !active) return null;

  const copy = milestoneDisplayCopy(active.milestoneId);
  const title = copy?.title ?? active.title;
  const blurb = copy?.description ?? "Reward details coming soon.";

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[140]">
      <div
        className="absolute w-[min(92vw,21.25rem)] overflow-visible transition-all ease-in-out"
        style={{
          ...active.style,
          transitionDuration: active.phase === "fly" ? `${FLY_MS}ms` : "320ms",
        }}
      >
        <div className="theme-prize-toast theme-prize-toast--card pointer-events-auto">
          <PrizeChaseOutline
            pathD={CARD_PATH}
            viewBox={`0 0 ${CARD_VB.w} ${CARD_VB.h}`}
            holdMs={active.holdMs}
            chasing={active.phase === "hold" && !active.reduceMotion}
          />
          {active.card ? (
            <div className="theme-prize-toast__card" style={CARD_SLOT_STYLE}>
              <Image
                src={active.card.imageSrc}
                alt=""
                fill
                className="object-cover"
                sizes="112px"
              />
            </div>
          ) : null}
          <div className="theme-prize-toast__content" aria-live="polite" aria-atomic="true">
            <div className="theme-prize-toast__copy">
              <p className="theme-prize-toast__kicker">Unlocked</p>
              <p className="theme-prize-toast__title">{title}</p>
              <p className="theme-prize-toast__blurb">{blurb}</p>
              {active.points > 0 ? (
                <p className="theme-prize-toast__pts">+{active.points} pts</p>
              ) : null}
            </div>
            <span className="theme-prize-toast__dismiss">
              <ModalCloseButton size="sm" ariaLabel="Dismiss unlock" onClick={finishCurrent} />
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
