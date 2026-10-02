"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { SoundLockIcon } from "@/components/SoundLockIcon";
import type { IntroSideQuest } from "@/data/introScreen";
import { playBoundNavClick } from "@/theme/sounds";
import type { MilestoneCardPrize } from "@/activity/types";
import { questBoardCardPropsFromQuest } from "@/components/questBoardModel";

export { questBoardCardPropsFromQuest, questBountyLine, unlockSummaries } from "@/components/questBoardModel";

export function QuestStatusBadge({
  status,
  className = "",
  variant = "pill",
}: {
  status: IntroSideQuest["status"];
  className?: string;
  variant?: "pill" | "bar";
}) {
  const label =
    status === "complete" ? "Complete" : status === "available" ? "Available" : "Locked";

  if (variant === "bar") {
    return (
      <span className={`theme-quest-row__status theme-quest-row__status--${status} ${className}`}>
        {label}
      </span>
    );
  }

  const styles =
    status === "complete"
      ? "theme-success-badge"
      : status === "available"
        ? "bg-accent-500/20 text-accent-200"
        : "bg-white/5 text-surface-500";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles} ${className}`}
    >
      {label}
    </span>
  );
}

/** Ignore hover-at-mount; straighten only after an organic pointer move or a later enter. */
function useOrganicHoverStraighten(enabled: boolean) {
  const [straight, setStraight] = useState(false);
  const mountMs = useRef(0);
  const armed = useRef(false);

  useLayoutEffect(() => {
    if (!enabled) {
      setStraight(false);
      return;
    }
    mountMs.current = performance.now();
    armed.current = false;
    setStraight(false);
  }, [enabled]);

  if (!enabled) {
    return { straight: false, pointerProps: {} };
  }

  const armStraight = () => {
    armed.current = true;
    setStraight(true);
  };

  return {
    straight,
    pointerProps: {
      onPointerEnter: () => {
        if (performance.now() - mountMs.current < 80) return;
        armStraight();
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (armed.current) return;
        if (event.movementX === 0 && event.movementY === 0) return;
        armStraight();
      },
      onPointerLeave: () => {
        armed.current = true;
        setStraight(false);
      },
    },
  };
}

export function QuestCardFace({
  card,
  revealed,
  size,
  hinted = false,
  onHint,
}: {
  card: MilestoneCardPrize | null;
  revealed: boolean;
  size: "thumb" | "detail";
  hinted?: boolean;
  onHint?: () => void;
}) {
  const { straight, pointerProps } = useOrganicHoverStraighten(size === "detail");
  const sizeClass = size === "detail" ? "theme-quest-card--detail" : "theme-quest-card--peek";
  const hoverClass = straight ? " theme-quest-card--straight" : "";
  const faceClassName = `${sizeClass}${hoverClass}`;
  const sizes = size === "detail" ? "240px" : "104px";
  const hintable = size === "detail" && !revealed && Boolean(onHint);
  const mark = hinted ? (
    <span className="theme-quest-card__mark theme-quest-card__mark--lock">
      <SoundLockIcon className="theme-quest-card__lock" />
      <span className="theme-quest-card__lock-hint">
        complete the task above to unlock the content
      </span>
    </span>
  ) : (
    <span className="theme-quest-card__mark" aria-hidden>
      ?
    </span>
  );

  let face: ReactNode;
  if (!card) {
    face = (
      <div
        className={`theme-quest-card theme-quest-card--mystery ${faceClassName}`}
        aria-hidden
        {...pointerProps}
      >
        {mark}
      </div>
    );
  } else if (!revealed) {
    const faceClass = [
      "theme-quest-card",
      "theme-quest-card--mystery",
      "theme-quest-card--veiled",
      faceClassName,
      hintable ? "theme-quest-card--hintable" : "",
      hinted ? "theme-quest-card--hinted" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const media = (
      <>
        <Image
          src={card.imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes={sizes}
          unoptimized
        />
        {mark}
      </>
    );
    face = hintable ? (
      <button
        type="button"
        className={faceClass}
        title="Hidden prize card"
        aria-label={
          hinted
            ? "complete the task above to unlock the content"
            : "Show how to unlock this card"
        }
        onClick={onHint}
        {...pointerProps}
      >
        {media}
      </button>
    ) : (
      <div className={faceClass} title="Hidden prize card" {...pointerProps}>
        {media}
      </div>
    );
  } else {
    face = (
      <div
        className={`theme-quest-card theme-quest-card--revealed ${faceClassName}`}
        title={`${card.title} · ${card.animalName}`}
        {...pointerProps}
      >
        <Image
          src={card.imageSrc}
          alt={`${card.title} card, ${card.animalName}`}
          fill
          className="object-cover"
          sizes={sizes}
          unoptimized
        />
      </div>
    );
  }

  return face;
}

export function QuestBoardCard({
  title,
  bounty,
  complete,
  locked = false,
  unlockItems = [],
  card,
  onOpen,
}: {
  title: string;
  bounty: string;
  complete: boolean;
  locked?: boolean;
  unlockItems?: readonly string[];
  card: MilestoneCardPrize | null;
  onOpen: () => void;
}) {
  const status: IntroSideQuest["status"] = complete
    ? "complete"
    : locked
      ? "locked"
      : "available";

  return (
    <button
      type="button"
      onClick={() => {
        playBoundNavClick();
        onOpen();
      }}
      data-status={status}
      className="theme-quest-row relative w-full border border-white/10 bg-surface-950/45 text-left hover:border-accent-500/35 hover:bg-surface-950/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300"
      style={{ borderRadius: "var(--radius-media)" }}
    >
      <span className="theme-quest-row__glow-clip" aria-hidden>
        <span className="theme-quest-row__glow theme-decorative" />
      </span>
      <QuestStatusBadge status={status} variant="bar" />
      <div className="theme-quest-row__body">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-surface-100">{title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-surface-500">{bounty}</p>
          {unlockItems.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {unlockItems.map((item) => (
                <li
                  key={item}
                  className="border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-surface-300"
                  style={{ borderRadius: "var(--radius-control)" }}
                >
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <QuestCardFace card={card} revealed={complete} size="thumb" />
      </div>
    </button>
  );
}

/** Controller: resolve quest id → row props, then mount the presentational card. */
export function QuestRoundList({
  quests,
  onOpenQuest,
  columns = "one",
}: {
  quests: IntroSideQuest[];
  onOpenQuest: (id: string) => void;
  /**
   * `two` — from `sm`, grid of two equal columns (a lone card stays half-width).
   * Default `one` keeps the intro board stack unchanged.
   */
  columns?: "one" | "two";
}) {
  return (
    <ul
      className={
        columns === "two" ? "theme-quest-round theme-quest-round--columns" : "theme-quest-round"
      }
    >
      {quests.map((quest) => (
        <li key={quest.id}>
          <QuestBoardCard
            {...questBoardCardPropsFromQuest(quest)}
            onOpen={() => onOpenQuest(quest.id)}
          />
        </li>
      ))}
    </ul>
  );
}
