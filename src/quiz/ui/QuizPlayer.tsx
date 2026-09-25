"use client";

import { useEffect, useState } from "react";
import { useActivity } from "@/activity/ActivityProvider";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { QuestStatusBadge } from "@/components/QuestBoardCard";
import { Button } from "@/components/ui";
import {
  encodeAnswerIds,
  getQuizDefinition,
  resolveQuiz,
  toQuizPublic,
} from "@/quiz";
import type { QuizDefinition, QuizGrade, QuizPublic, QuizPublicQuestion } from "@/quiz";
import { playBoundNavClick, playSkipTheFunClick } from "@/theme/sounds";
import { QuizConfetti } from "./QuizConfetti";

type QuizPlayerProps = {
  /** Full catalog JSON — parent looks up; this view does not. */
  quiz: QuizDefinition;
  alreadyUnlocked?: boolean;
  onBack: () => void;
};

export function QuizPlayer({ quiz: definition, alreadyUnlocked = false, onBack }: QuizPlayerProps) {
  const quiz = toQuizPublic(definition);

  return (
    <QuizPlayerReady
      quiz={quiz}
      definition={definition}
      alreadyUnlocked={alreadyUnlocked}
      onBack={onBack}
    />
  );
}

function QuizPlayerReady({
  quiz,
  definition,
  alreadyUnlocked,
  onBack,
}: {
  quiz: QuizPublic;
  definition: QuizDefinition;
  alreadyUnlocked: boolean;
  onBack: () => void;
}) {
  const { record } = useActivity();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState(false);
  const [shake, setShake] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [grade, setGrade] = useState<QuizGrade | null>(null);
  const [earnedUnlock, setEarnedUnlock] = useState(alreadyUnlocked);
  const [picked, setPicked] = useState<string[]>([]);
  const inLiveCatalog = getQuizDefinition(quiz.id) === definition;

  const question = quiz.questions[index];
  const showingResults = Boolean(grade?.complete);
  const isMulti = question?.type === "multi";

  useEffect(() => {
    if (alreadyUnlocked) setEarnedUnlock(true);
  }, [alreadyUnlocked]);

  useEffect(() => {
    if (!grade?.complete || !grade.passed || !inLiveCatalog) return;
    setEarnedUnlock(true);
    void record({
      type: "quiz.complete",
      contentId: quiz.id,
      label: quiz.title,
      meta: { wrongCount: grade.wrongCount, correctCount: grade.correctCount },
    });
  }, [grade, inLiveCatalog, quiz.id, quiz.title, record]);

  const pick = async (choiceId: string) => {
    if (locked || !question) return;
    setLocked(true);
    const nextAnswers = { ...answers, [question.id]: choiceId };
    setAnswers(nextAnswers);
    const result = await resolveQuiz(quiz.id, nextAnswers, definition);
    const row = result.questions.find((item) => item.id === question.id);
    const correct = row?.correct === true;

    if (correct) {
      playBoundNavClick();
      setConfettiKey((key) => key + 1);
    } else {
      playSkipTheFunClick();
      setShake(false);
      window.requestAnimationFrame(() => setShake(true));
    }

    window.setTimeout(() => {
      if (result.complete) {
        setGrade(result);
        setLocked(false);
        return;
      }
      setIndex((current) => current + 1);
      setPicked([]);
      setLocked(false);
      setShake(false);
    }, 720);
  };

  const retry = () => {
    playBoundNavClick();
    setIndex(0);
    setAnswers({});
    setLocked(false);
    setShake(false);
    setGrade(null);
    setConfettiKey(0);
    setPicked([]);
  };

  const togglePick = (choiceId: string) => {
    if (locked) return;
    playBoundNavClick();
    setPicked((current) =>
      current.includes(choiceId) ? current.filter((id) => id !== choiceId) : [...current, choiceId],
    );
  };

  const submitMulti = () => {
    if (picked.length === 0) return;
    void pick(encodeAnswerIds(picked));
  };

  return (
    <div className="theme-quiz theme-quest-drill">
      <div className="theme-quest-detail-bar">
        <h3 className="min-w-0 text-lg font-semibold text-surface-100">{quiz.title}</h3>
        <div className="flex shrink-0 items-center gap-2">
          {alreadyUnlocked ? <QuestStatusBadge status="complete" /> : null}
          <ModalCloseButton onClick={onBack} size="sm" ariaLabel="Close quiz" />
        </div>
      </div>
      <div className="theme-quest-board-scroll">
      <p className="theme-quiz__lede text-sm leading-relaxed text-surface-400">{quiz.description}</p>
      {alreadyUnlocked ? (
        <p className="mt-2 text-xs leading-relaxed text-surface-500">
          This card is already unlocked. You can still retake the quiz.
        </p>
      ) : null}

      {showingResults && grade ? (
        <QuizResults
          quiz={quiz}
          grade={grade}
          alreadyUnlocked={earnedUnlock}
          onRetry={retry}
          onBack={onBack}
        />
      ) : question ? (
        <div
          className={`theme-quiz__prompt mt-6 ${shake ? "theme-quiz__prompt--wrong" : ""}`}
          onAnimationEnd={() => setShake(false)}
        >
          <QuizConfetti burstKey={confettiKey} />
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            Question {index + 1} of {quiz.questions.length}
          </p>
          <h4 className="theme-quiz__question mt-2 text-base font-semibold text-surface-100">
            {question.title}
          </h4>
          {question.description && !isMulti ? (
            <p className="mt-1 text-sm text-surface-400">{question.description}</p>
          ) : null}
          {isMulti ? (
            <QuizMultiChoices
              question={question}
              picked={picked}
              locked={locked}
              onToggle={togglePick}
              onSubmit={submitMulti}
            />
          ) : (
            <ul className="mt-4 flex flex-col gap-2">
              {question.choices.map((choice) => (
                <li key={choice.id}>
                  <button
                    type="button"
                    disabled={locked}
                    onClick={() => void pick(choice.id)}
                    className="theme-quiz-choice"
                  >
                    {choice.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
      </div>
    </div>
  );
}

function QuizMultiChoices({
  question,
  picked,
  locked,
  onToggle,
  onSubmit,
}: {
  question: QuizPublicQuestion;
  picked: string[];
  locked: boolean;
  onToggle: (choiceId: string) => void;
  onSubmit: () => void;
}) {
  const tip = question.description ?? "Check all that apply.";
  return (
    <fieldset className="theme-quiz-fieldset mt-4">
      <legend className="theme-quiz-tip">{tip}</legend>
      <ul className="flex flex-col gap-2">
        {question.choices.map((choice) => {
          const checked = picked.includes(choice.id);
          return (
            <li key={choice.id}>
              <label
                className={`theme-quiz-choice theme-quiz-choice--multi ${
                  checked ? "theme-quiz-choice--checked" : ""
                }`}
              >
                <input
                  type="checkbox"
                  className="theme-quiz-choice__box"
                  checked={checked}
                  disabled={locked}
                  onChange={() => onToggle(choice.id)}
                />
                <span>{choice.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <Button
        role="primary"
        size="lg"
        className="theme-quiz-submit mt-4"
        disabled={locked || picked.length === 0}
        onClick={onSubmit}
      >
        Continue
      </Button>
    </fieldset>
  );
}

function missLimitCopy(maxWrong: number): string {
  const fewerThan = maxWrong + 1;
  if (fewerThan === 1) return "Need zero misses to unlock.";
  return `Need fewer than ${fewerThan} misses to unlock.`;
}

function QuizResults({
  quiz,
  grade,
  alreadyUnlocked,
  onRetry,
  onBack,
}: {
  quiz: QuizPublic;
  grade: QuizGrade;
  alreadyUnlocked: boolean;
  onRetry: () => void;
  onBack: () => void;
}) {
  const summary = grade.passed
    ? quiz.id === "quiz-caveman"
      ? "Passed — the caveman card is yours."
      : "Passed."
    : alreadyUnlocked
      ? `Missed ${grade.wrongCount} this run. Your card stays unlocked.`
      : `Missed ${grade.wrongCount}. ${missLimitCopy(quiz.maxWrong)}`;

  return (
    <div className="theme-quiz-results mt-6">
      <p className="text-sm font-semibold text-surface-100">{summary}</p>
      <ul className="mt-4 space-y-2">
        {grade.questions.map((row) => (
          <li
            key={row.id}
            className={`theme-quiz-result ${
              row.correct ? "theme-quiz-result--right" : "theme-quiz-result--wrong"
            }`}
          >
            <span className="min-w-0 flex-1">{row.title}</span>
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider">
              {row.correct ? "Right" : "Wrong"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex gap-2.5">
        <Button
          role="outline"
          size="lg"
          className="flex-1"
          onClick={() => {
            playBoundNavClick();
            onBack();
          }}
        >
          Go back
        </Button>
        <Button role="primary" size="lg" className="flex-1" onClick={onRetry}>
          Try again
        </Button>
      </div>
    </div>
  );
}
