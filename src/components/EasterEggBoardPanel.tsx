"use client";

import { useState } from "react";
import { cardPrizeForMilestone, prizesForMilestone } from "@/activity/milestonePrizes";
import { navigateToUnlockedContent } from "@/activity/unlockRoutes";
import type { UnlockedContentTarget } from "@/activity/unlockFeatures";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button } from "@/components/ui";
import { SoundLockIcon } from "@/components/SoundLockIcon";
import {
  QuestCardFace,
  QuestRoundList,
  QuestStatusBadge,
  questBountyLine,
} from "@/components/QuestBoardCard";
import {
  prizeRowsFromPrizes,
  type PrizeRowDisplay,
} from "@/components/questBoardModel";
import type { IntroSideQuest, IntroSideQuestCategory } from "@/data/introScreen";
import { getQuizDefinition } from "@/quiz";
import { QuizPlayer } from "@/quiz/ui/QuizPlayer";
import { playBoundNavClick } from "@/theme/sounds";
import type { MilestoneCardPrize } from "@/activity/types";

function questCategory(quest: IntroSideQuest): IntroSideQuestCategory {
  if (quest.category) return quest.category;
  if (quest.id.startsWith("score-")) return "score";
  if (quest.id.startsWith("quiz-")) return "quiz";
  return "action";
}

export function EasterEggBoardScore({ score, id }: { score: number; id?: string }) {
  return (
    <p id={id} className="theme-quest-board-score">
      <span className="theme-quest-board-score__label">Current score</span>
      <span className="theme-quest-board-score__value">{score}</span>
    </p>
  );
}

/** Shared easter-board quest list (intro + main-site overlay). */
export function EasterEggBoardPanel({ quests }: { quests: IntroSideQuest[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quizId, setQuizId] = useState<string | null>(null);
  const actionQuests = quests.filter((q) => questCategory(q) === "action");
  const openingActQuests = actionQuests.filter((q) => q.id === "intro-video-end");
  const sideQuests = actionQuests.filter((q) => q.id !== "intro-video-end");
  const quizQuests = quests.filter((q) => questCategory(q) === "quiz");
  const scoreQuests = quests.filter((q) => questCategory(q) === "score");
  const selected = selectedId ? quests.find((q) => q.id === selectedId) ?? null : null;

  const openQuest = (id: string) => {
    const quest = quests.find((row) => row.id === id);
    if (quest && questCategory(quest) === "quiz" && quest.status !== "complete") {
      setQuizId(id);
      return;
    }
    setSelectedId(id);
  };

  if (quizId) {
    const quizQuest = quests.find((row) => row.id === quizId);
    const definition = getQuizDefinition(quizId);
    if (!definition) {
      return (
        <div className="theme-quiz">
          <p className="text-sm text-surface-400">This quiz is missing from the catalog.</p>
          <Button role="outline" className="mt-4" onClick={() => setQuizId(null)}>
            Go back
          </Button>
        </div>
      );
    }
    return (
      <QuizPlayer
        key={quizId}
        quiz={definition}
        alreadyUnlocked={quizQuest?.status === "complete"}
        onBack={() => setQuizId(null)}
      />
    );
  }

  if (selected) {
    return (
      <QuestPrizeDetail
        key={selected.id}
        title={selected.title}
        bounty={questBountyLine(selected)}
        status={selected.status}
        complete={selected.status === "complete"}
        featureRows={prizeRowsFromPrizes(
          prizesForMilestone(selected.id),
          selected.status === "complete",
        )}
        cardPrize={cardPrizeForMilestone(selected.id)}
        onBack={() => setSelectedId(null)}
        onRetakeQuiz={
          questCategory(selected) === "quiz" && selected.status === "complete"
            ? () => {
                playBoundNavClick();
                setQuizId(selected.id);
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="theme-quest-board-scroll flex flex-col gap-6">
      {quizQuests.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-surface-500">
            Quiz Power
          </h3>
          <QuestRoundList quests={quizQuests} onOpenQuest={openQuest} />
        </div>
      ) : null}
      {openingActQuests.length > 0 ? (
        <QuestRoundList quests={openingActQuests} onOpenQuest={openQuest} />
      ) : null}
      {sideQuests.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-surface-500">
            Side quests
          </h3>
          <QuestRoundList quests={sideQuests} onOpenQuest={openQuest} />
        </div>
      ) : null}
      {scoreQuests.length > 0 ? (
        <div className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-surface-500">
            Score tiers
          </h3>
          <QuestRoundList quests={scoreQuests} onOpenQuest={openQuest} />
        </div>
      ) : null}
    </div>
  );
}

function cardDownloadName(card: { imageSrc: string; animalName: string }): string {
  const fromPath = card.imageSrc.split("/").pop();
  if (fromPath && fromPath.length > 0) return fromPath;
  const stem = card.animalName.toLowerCase().replace(/\s+/g, "_");
  return `Aaron_DuChateau_${stem}_reward_card.png`;
}

function QuestPrizeDetail({
  title,
  bounty,
  status,
  complete,
  featureRows,
  cardPrize,
  onBack,
  onRetakeQuiz,
}: {
  title: string;
  bounty: string;
  status: IntroSideQuest["status"];
  complete: boolean;
  featureRows: readonly PrizeRowDisplay[];
  cardPrize: MilestoneCardPrize | null;
  onBack: () => void;
  onRetakeQuiz?: () => void;
}) {
  const [unlockHinted, setUnlockHinted] = useState(false);
  const [wiggle, setWiggle] = useState(false);
  const [downloadWiggle, setDownloadWiggle] = useState(false);

  const jiggleCard = () => {
    setWiggle(false);
    window.requestAnimationFrame(() => setWiggle(true));
  };

  const jiggleDownload = () => {
    setDownloadWiggle(false);
    window.requestAnimationFrame(() => setDownloadWiggle(true));
  };

  return (
    <div className="theme-quest-drill">
      <div className="theme-quest-detail-bar">
        <h3 className="min-w-0 text-lg font-semibold text-surface-100">{title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          <QuestStatusBadge status={status} />
          <ModalCloseButton onClick={onBack} size="sm" ariaLabel="Close quest details" />
        </div>
      </div>
      <div className="theme-quest-board-scroll">
      <div
        className={`theme-quest-mission ${unlockHinted ? "theme-quest-mission--lined" : ""}`}
      >
        <p className="text-sm leading-relaxed text-surface-400">{bounty}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
        <section>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            Feature You Get
          </h4>
          <FeaturePrizeList
            rows={featureRows}
            complete={complete}
            questTitle={title}
          />
        </section>
        <section>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            Card you get
          </h4>
          <div className="mt-3 flex items-start gap-4 overflow-visible py-4 pr-2">
            <div
              className={wiggle ? "animate-wiggle" : undefined}
              onAnimationEnd={() => setWiggle(false)}
            >
              <QuestCardFace
                card={cardPrize}
                revealed={complete}
                size="detail"
                hinted={unlockHinted}
                onHint={() => {
                  playBoundNavClick();
                  setUnlockHinted(true);
                  jiggleCard();
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-100">
                {complete && cardPrize ? cardPrize.title : "Trading card"}
              </p>
              <p className="mt-0.5 text-xs text-surface-400">
                {complete && cardPrize
                  ? cardPrize.animalName
                  : "Animal card — revealed when this quest is complete"}
              </p>
              <div className="mt-3 flex flex-col items-start gap-2">
                {cardPrize && complete ? (
                  <a
                    className="theme-quest-card-download inline-block whitespace-nowrap text-xs font-semibold"
                    href={cardPrize.imageSrc}
                    download={cardDownloadName(cardPrize)}
                    data-track-ignore=""
                    onClick={() => playBoundNavClick()}
                  >
                    Download
                  </a>
                ) : cardPrize ? (
                  <button
                    type="button"
                    className={`theme-quest-card-download theme-quest-card-download--locked inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                      downloadWiggle ? "animate-wiggle" : ""
                    }`}
                    aria-label="Download (locked)"
                    data-track-ignore=""
                    onClick={() => {
                      playBoundNavClick();
                      jiggleDownload();
                    }}
                    onAnimationEnd={() => setDownloadWiggle(false)}
                  >
                    <SoundLockIcon className="theme-quest-card-download__lock" />
                    Download
                  </button>
                ) : null}
                {onRetakeQuiz ? (
                  <button
                    type="button"
                    className="theme-quest-quiz-retake text-xs font-semibold"
                    onClick={onRetakeQuiz}
                  >
                    Retake quiz
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}

function FeaturePrizeList({
  rows,
  complete,
  questTitle,
}: {
  rows: readonly PrizeRowDisplay[];
  complete: boolean;
  questTitle: string;
}) {
  if (rows.length === 0) {
    return (
      <p className="mt-2 text-sm text-surface-300">
        {complete
          ? `The “${questTitle}” score-tier title.`
          : `The “${questTitle}” score-tier title when you reach this threshold.`}
      </p>
    );
  }

  return (
    <ul className="mt-3 space-y-4">
      {rows.map((row) => (
        <li key={row.key}>
          <PrizeRow row={row} complete={complete} />
        </li>
      ))}
    </ul>
  );
}

function PrizeRow({ row, complete }: { row: PrizeRowDisplay; complete: boolean }) {
  return (
    <div>
      <p className="text-sm font-semibold text-surface-100">{row.title}</p>
      <p className="mt-0.5 text-xs text-surface-500">{row.hint}</p>
      {row.labels.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {row.labels.map((label) => (
            <li
              key={label}
              className="border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-surface-300"
              style={{ borderRadius: "var(--radius-control)" }}
            >
              {label}
            </li>
          ))}
        </ul>
      ) : null}
      <ViewUnlockedContentButton target={row.unlockTarget} complete={complete} />
    </div>
  );
}

function ViewUnlockedContentButton({
  target,
  complete,
}: {
  target: UnlockedContentTarget | null;
  complete: boolean;
}) {
  if (!complete || !target) return null;
  return (
    <button
      type="button"
      className="theme-quest-view-unlock"
      onClick={() => {
        playBoundNavClick();
        navigateToUnlockedContent(target);
      }}
    >
      View unlocked content
    </button>
  );
}
