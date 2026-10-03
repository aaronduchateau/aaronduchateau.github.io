"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CareerTimeline,
  CompareSlider,
  EducationCard,
  FullScreenQuote,
  MajorProjectCardBody,
  TestimonialCard,
  type CardCover,
  type CareerTimelineItem,
  type ColorSplash,
} from "@/components/ui";
import { LeaveSiteConfirm } from "@/components/LeaveSiteConfirm";
import { QuestBoardCard } from "@/components/QuestBoardCard";
import type { MilestoneCardPrize } from "@/activity/types";
import { LIBRARY_SAMPLE_QUIZ, isQuizDefinition, type QuizDefinition } from "@/quiz";
import { QuizPlayer } from "@/quiz/ui/QuizPlayer";
import { compileDemoHandler } from "../storyJson";

const DEFAULT_SPLASH: ColorSplash = { from: "#7c2d12", to: "#f97316" };

/** Catalog control value — `from|to`. EducationCard still takes `{ from, to }`. */
function parseColorSplash(raw: string | undefined): ColorSplash {
  if (!raw) return DEFAULT_SPLASH;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "from" in parsed && "to" in parsed) {
      const splash = parsed as ColorSplash;
      if (splash.from && splash.to) return splash;
    }
  } catch {
    /* from|to catalog leftover */
  }
  const [from, to] = raw.split("|").map((part) => part.trim());
  if (from && to) return { from, to };
  return DEFAULT_SPLASH;
}

function parseCardCover(raw: string | undefined): CardCover | null {
  if (!raw?.trim() || raw === "null" || raw === "none") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "kind" in parsed) {
      return parsed as CardCover;
    }
  } catch {
    if (raw.startsWith("/")) return { kind: "image", src: raw, alt: "" };
  }
  return null;
}

export function LibraryThemeCard({
  title,
  excerpt,
  cover,
  cta,
  date,
  onClick,
}: {
  title: string;
  excerpt: string;
  cover: string;
  cta: string;
  date?: string;
  onClick?: string;
}) {
  return (
    <div className="w-full min-w-full">
      <Card
        as="button"
        title={title}
        excerpt={excerpt}
        date={date}
        cta={cta}
        cover={parseCardCover(cover)}
        onClick={compileDemoHandler(onClick, "Theme card")}
        compactAtPhone
      />
    </div>
  );
}

export function LibraryEducationCard({
  years,
  degree,
  school,
  detail,
  splash,
}: {
  years: string;
  degree: string;
  school: string;
  detail: string;
  splash: string;
}) {
  return (
    <div className="w-full">
      <EducationCard
        years={years}
        degree={degree}
        school={school}
        detail={detail}
        splash={parseColorSplash(splash)}
      />
    </div>
  );
}

export function LibraryFullScreenQuote({
  quote,
  attribution,
  photo,
  photoAlt,
}: {
  quote: string;
  attribution: string;
  photo: string;
  photoAlt?: string;
}) {
  return (
    <div className="w-full min-w-full">
      <FullScreenQuote
        quote={quote}
        attribution={attribution}
        photo={photo}
        photoAlt={photoAlt}
      />
    </div>
  );
}

export function LibraryTestimonialCard({
  name,
  title,
  quote,
  photo,
  onClick,
}: {
  name: string;
  title: string;
  quote: string;
  photo: string;
  onClick?: string;
}) {
  return (
    <div className="w-full">
      <TestimonialCard
        name={name}
        title={title}
        quote={quote}
        photo={photo}
        onClick={compileDemoHandler(onClick, "Testimonial card")}
      />
    </div>
  );
}

function parseQuizProp(raw: string | undefined): QuizDefinition {
  if (!raw?.trim()) return LIBRARY_SAMPLE_QUIZ;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (isQuizDefinition(parsed)) return parsed;
  } catch {
    /* fall through */
  }
  return LIBRARY_SAMPLE_QUIZ;
}

export function LibraryQuizPlayer({
  quiz,
  alreadyUnlocked,
  onBack,
}: {
  quiz: string;
  alreadyUnlocked: string;
  onBack?: string;
}) {
  const [generation, setGeneration] = useState(0);
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
      <QuizPlayer
        key={generation}
        quiz={parseQuizProp(quiz)}
        alreadyUnlocked={alreadyUnlocked === "true"}
        onBack={() => {
          const source = onBack?.trim();
          if (source && source !== "() => {}") {
            compileDemoHandler(onBack, "Quiz back")();
          }
          setGeneration((n) => n + 1);
        }}
      />
    </div>
  );
}

export function LibraryQuestBoardCard({
  title,
  bounty,
  complete,
  unlockItems,
  card,
  onClick,
}: {
  title: string;
  bounty: string;
  complete: string;
  unlockItems: string;
  card: string;
  onClick?: string;
}) {
  return (
    <div className="w-full min-w-0">
      <ul className="theme-quest-round">
        <li>
          <QuestBoardCard
            title={title}
            bounty={bounty}
            complete={complete === "true"}
            unlockItems={parseUnlockItems(unlockItems)}
            card={parseLibraryCard(card)}
            onOpen={() => compileDemoHandler(onClick, "Quest card")()}
          />
        </li>
      </ul>
    </div>
  );
}

function parseUnlockItems(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return raw.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function parseLibraryCard(raw: string | undefined): MilestoneCardPrize | null {
  if (!raw?.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed && typeof parsed === "object" && "imageSrc" in parsed) {
      const row = parsed as MilestoneCardPrize;
      if (typeof row.imageSrc === "string" && row.imageSrc) return row;
    }
  } catch {
    if (raw.startsWith("/")) {
      return {
        kind: "card",
        cardId: "library-preview",
        title: "",
        animalName: "",
        imageSrc: raw,
      };
    }
  }
  return null;
}

function isTimelineItem(value: unknown): value is CareerTimelineItem {
  if (!value || typeof value !== "object") return false;
  const row = value as CareerTimelineItem;
  return Boolean(row.id && row.role && row.employer && row.period && row.summary && row.mark);
}

function parseTimelineItems(raw: string | undefined): CareerTimelineItem[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTimelineItem);
  } catch {
    return [];
  }
}

export function LibraryCompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel,
  afterLabel,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel: string;
  afterLabel: string;
}) {
  return (
    <div className="w-full min-w-0 max-w-xl">
      <CompareSlider
        aspectRatio={4 / 3}
        beforeLabel={beforeLabel}
        afterLabel={afterLabel}
        sliderLabel={`Compare ${beforeLabel} and ${afterLabel}`}
        before={
          // eslint-disable-next-line @next/next/no-img-element -- catalog sample URLs
          <img
            src={beforeSrc}
            alt={beforeLabel}
            className="h-full w-full bg-black object-contain"
            draggable={false}
          />
        }
        after={
          // eslint-disable-next-line @next/next/no-img-element -- catalog sample URLs
          <img
            src={afterSrc}
            alt={afterLabel}
            className="h-full w-full bg-black object-contain"
            draggable={false}
          />
        }
      />
    </div>
  );
}

export function LibraryCareerTimeline({
  items,
  activeIndex,
  paused,
}: {
  items: string;
  activeIndex: string;
  paused: string;
}) {
  const roster = parseTimelineItems(items);
  const fromProps = Math.min(Math.max(0, Number(activeIndex) || 0), Math.max(0, roster.length - 1));
  const [index, setIndex] = useState(fromProps);
  const timerPaused = paused !== "false";

  useEffect(() => {
    setIndex(fromProps);
  }, [fromProps]);

  useEffect(() => {
    if (timerPaused || roster.length === 0) return;
    const id = window.setTimeout(() => {
      setIndex((prev) => (prev + 1) % roster.length);
    }, 8000);
    return () => window.clearTimeout(id);
  }, [timerPaused, index, roster.length]);

  return (
    <div className="w-full min-w-full">
      <CareerTimeline
        items={roster}
        activeIndex={index}
        timerPaused={timerPaused}
        timerActive={!timerPaused}
        timerEpoch={index}
        reducedMotion={false}
        onSelect={setIndex}
        onNewer={() => setIndex((prev) => Math.max(0, prev - 1))}
        onOlder={() => setIndex((prev) => Math.min(roster.length - 1, prev + 1))}
      />
    </div>
  );
}

export function LibraryLeaveSiteConfirm({
  company,
  location,
  window: projectWindow,
  role,
  bullets,
  photo,
  href,
  armed,
}: {
  company: string;
  location: string;
  window: string;
  role: string;
  bullets: string;
  photo: string;
  href: string;
  armed: string;
}) {
  const fromProps = armed === "true" ? 2 : 1;
  const [phase, setPhase] = useState<1 | 2>(fromProps);

  useEffect(() => {
    setPhase(fromProps);
  }, [fromProps]);

  return (
    <div className="w-full min-w-full">
      <article className="group flex w-full overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40">
        <LeaveSiteConfirm
          phase={phase}
          title={company}
          subtitle={location}
          href={href || "#"}
          paddleLabel={company}
          onTogglePhase={() => setPhase((current) => (current === 1 ? 2 : 1))}
        >
          <MajorProjectCardBody
            company={company}
            location={location}
            window={projectWindow}
            role={role}
            bullets={parseUnlockItems(bullets)}
            photo={photo}
            revealPhotoOnHover
            showDecorativeMedia
          />
        </LeaveSiteConfirm>
      </article>
    </div>
  );
}
