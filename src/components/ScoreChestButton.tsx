"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useActivity } from "@/activity/ActivityProvider";
import { useCelebrationQueue } from "@/activity/CelebrationQueueProvider";
import { EasterEggBoardHost } from "@/components/EasterEggBoardModal";
import { useTheme } from "@/theme/ThemeProvider";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";

import { TreasureChestIcon } from "@/components/ui";

const SCORE_SPIN_DELAY_MS = 1000;
const TOAST_FLY_SPIN_DELAY_MS = 80;
const DIGIT_SPIN_MS = 900;
const EXTRA_REVOLUTIONS = 2;

function DigitReel({
  digit,
  spinToken,
  animate,
}: {
  digit: number;
  /** Bumps when a new spin should run toward `digit`. */
  spinToken: number;
  animate: boolean;
}) {
  const stripRef = useRef<HTMLSpanElement>(null);
  const prevDigitRef = useRef(digit);
  const [offset, setOffset] = useState(digit);
  const [transition, setTransition] = useState(false);

  useLayoutEffect(() => {
    if (!animate || spinToken === 0) {
      prevDigitRef.current = digit;
      setTransition(false);
      setOffset(digit);
      return;
    }

    const from = prevDigitRef.current;
    const to = digit;
    // Land after EXTRA_REVOLUTIONS full turns past the previous digit.
    const delta = ((to - from) % 10 + 10) % 10 || (from === to ? 0 : 10);
    const nextOffset = from + EXTRA_REVOLUTIONS * 10 + (delta === 0 && from !== to ? 10 : delta);

    setTransition(false);
    setOffset(from);
    let frame2 = 0;
    const frame1 = requestAnimationFrame(() => {
      frame2 = requestAnimationFrame(() => {
        setTransition(true);
        setOffset(nextOffset);
        prevDigitRef.current = to;
      });
    });

    return () => {
      cancelAnimationFrame(frame1);
      cancelAnimationFrame(frame2);
    };
  }, [digit, spinToken, animate]);

  // After the CSS transition ends, normalize offset into 0–9 range without a visual jump.
  useEffect(() => {
    const node = stripRef.current;
    if (!node || !transition) return;
    const onEnd = () => {
      setTransition(false);
      setOffset(digit);
    };
    node.addEventListener("transitionend", onEnd);
    return () => node.removeEventListener("transitionend", onEnd);
  }, [transition, digit]);

  const stripDigits = Array.from({ length: 50 }, (_, i) => i % 10);

  return (
    <span className="score-digit-window relative inline-block h-[1.05em] w-[0.65em] overflow-hidden align-baseline">
      <span
        ref={stripRef}
        className="score-digit-strip absolute left-0 top-0 flex w-full flex-col items-center"
        style={{
          transform: `translateY(${-offset}em)`,
          transition: transition
            ? `transform ${DIGIT_SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.18, 1)`
            : "none",
        }}
        aria-hidden
      >
        {stripDigits.map((n, i) => (
          <span key={i} className="flex h-[1em] w-full items-center justify-center leading-none">
            {n}
          </span>
        ))}
      </span>
      <span className="sr-only">{digit}</span>
    </span>
  );
}

function SlotScore({ value, spinToken, animate }: { value: number; spinToken: number; animate: boolean }) {
  const digits = String(Math.max(0, Math.floor(value))).split("").map((c) => Number(c));
  return (
    <span
      className="inline-flex items-center font-mono text-xs font-semibold tabular-nums tracking-tight text-current"
      aria-hidden
    >
      {digits.map((d, i) => (
        <DigitReel
          key={`d-${digits.length}-${i}`}
          digit={d}
          spinToken={spinToken}
          animate={animate}
        />
      ))}
    </span>
  );
}

/**
 * Nav treasure-chest score — opens the easter-egg board overlay on the main site.
 * After a scored action, waits ~1s then slot-spins the displayed total.
 */
export function ScoreChestButton() {
  const { store, hydrated } = useActivity();
  const { scoreBlocked, snapshot } = useCelebrationQueue();
  const { playNavClick } = useTheme();
  const targetScore = store.totalScore;

  const [displayScore, setDisplayScore] = useState(0);
  const [spinToken, setSpinToken] = useState(0);
  const [animateSpin, setAnimateSpin] = useState(false);
  const snappedHydrateRef = useRef(false);
  const pendingTargetRef = useRef<number | null>(null);
  const displayScoreRef = useRef(0);
  displayScoreRef.current = displayScore;

  // Snap once localStorage hydrate lands. Later totals wait if a modal is open
  // or a prize toast has not yet flown into the chest.
  useEffect(() => {
    if (!hydrated) return;

    if (!snappedHydrateRef.current) {
      snappedHydrateRef.current = true;
      setDisplayScore(targetScore);
      pendingTargetRef.current = targetScore;
      return;
    }

    if (scoreBlocked) {
      pendingTargetRef.current = targetScore;
      return;
    }

    if (targetScore === displayScoreRef.current) {
      pendingTargetRef.current = targetScore;
      return;
    }
    pendingTargetRef.current = targetScore;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setAnimateSpin(false);
      setDisplayScore(targetScore);
      return;
    }

    const delay =
      snapshot.releaseReason === "toast-fly" ? TOAST_FLY_SPIN_DELAY_MS : SCORE_SPIN_DELAY_MS;

    const timer = window.setTimeout(() => {
      setAnimateSpin(true);
      setDisplayScore(targetScore);
      setSpinToken((n) => n + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [hydrated, targetScore, scoreBlocked, snapshot.version, snapshot.releaseReason]);

  return (
    <>
      <button
        type="button"
        data-score-chest-anchor=""
        data-track-ignore=""
        aria-label={`Activity score ${displayScore}. Open easter egg board.`}
        title="Easter egg board"
        aria-haspopup="dialog"
        onClick={() => {
          playNavClick();
          requestEasterEggBoard();
        }}
        className="theme-nav-control theme-btn-shape inline-flex h-9 min-w-9 items-center gap-1.5 px-2 text-xs font-semibold transition"
      >
        <TreasureChestIcon className="h-5 w-5 shrink-0" />
        <SlotScore value={displayScore} spinToken={spinToken} animate={animateSpin} />
      </button>
      <EasterEggBoardHost />
    </>
  );
}
