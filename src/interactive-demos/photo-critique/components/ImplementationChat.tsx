"use client";

import { useState } from "react";
import {
  implementationPhotoThreads,
  type ImplementationMessage,
  type ImplementationPhotoThread,
  type ImplementationThreadId,
  type ImplementationThreadSummary,
} from "../implementationScenario";
import { selfQaV1PlanMarkdown } from "../selfQaV1PlanMarkdown";
import { CritiqueContentHeader } from "./CritiqueContentHeader";
import { critiqueMutedClass } from "./photo-critique-layout";

function ThreadCard({
  thread,
  onOpen,
}: {
  thread: ImplementationPhotoThread;
  onOpen: (id: ImplementationThreadId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(thread.sampleId)}
      className="group flex flex-col overflow-hidden rounded-lg border border-white/10 text-left transition hover:border-white/30"
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
        <img
          src={thread.originalSrc}
          alt={thread.label}
          loading="lazy"
          className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:opacity-100"
        />
      </span>
      <span className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="text-xs font-semibold text-surface-200">{thread.label}</span>
        <span className="text-[10px] leading-snug text-surface-500">{thread.description}</span>
      </span>
    </button>
  );
}

function PlaceholderImage({ alt, className }: { alt: string; className?: string }) {
  return (
    <div
      className={`flex aspect-[4/5] max-w-[14rem] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/20 bg-gradient-to-br from-surface-800/80 via-surface-900/90 to-black px-4 py-6 text-center ${className ?? ""}`}
      role="img"
      aria-label={alt}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-surface-500">AI edit</span>
      <span className="text-xs leading-snug text-surface-300">{alt}</span>
      <span className="text-[10px] text-surface-600">Placeholder</span>
    </div>
  );
}

function ReplyChip({ label }: { label: string }) {
  return (
    <div className="mb-2 flex items-center justify-end gap-1.5 text-[10px] text-surface-500">
      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden="true">
        <path
          fill="currentColor"
          d="M10 3a7 7 0 0 0-5.6 11.2l-.9 3.4 3.5-.9A7 7 0 1 0 10 3Z"
        />
      </svg>
      <span>Replying to {label}</span>
    </div>
  );
}

function UserMessage({
  thread,
  message,
  collapsed,
  onToggle,
}: {
  thread: ImplementationPhotoThread;
  message: Extract<ImplementationMessage, { role: "user" }>;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const showImage = message.kind === "critique" && message.showOriginal !== false;

  return (
    <div className="flex flex-col items-end gap-2">
      {message.replyToLabel ? <ReplyChip label={message.replyToLabel} /> : null}
      {showImage ? (
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element -- static demo asset */}
          <img
            src={thread.originalSrc}
            alt={thread.label}
            className="max-h-48 max-w-[16rem] object-cover"
          />
        </div>
      ) : null}
      <div className="max-w-[85%] rounded-[22px] rounded-se-lg bg-accent-950/50 px-4 py-2.5 text-left text-[11px] leading-relaxed text-surface-200">
        {message.kind === "critique" ? (
          <>
            <pre
              className={`whitespace-pre-wrap break-words font-sans ${collapsed ? "max-h-32 overflow-hidden" : ""}`}
            >
              {message.markdown}
            </pre>
            <button
              type="button"
              onClick={onToggle}
              className="mt-2 text-[10px] font-semibold text-accent-400/90 hover:text-accent-300"
            >
              {collapsed ? "Show full critique" : "Collapse"}
            </button>
          </>
        ) : (
          <p className="whitespace-pre-wrap">{message.text}</p>
        )}
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: Extract<ImplementationMessage, { role: "assistant" }> }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {message.src ? (
        <div className="overflow-hidden rounded-3xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
          <img
            src={message.src}
            alt={message.alt}
            loading="lazy"
            className="max-h-72 max-w-[16rem] object-contain"
          />
        </div>
      ) : (
        <PlaceholderImage alt={message.alt} />
      )}
    </div>
  );
}

function ScorePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-surface-500">{label}</span>
      <span className="font-mono text-lg font-semibold text-surface-200">{value}</span>
    </div>
  );
}

function ThreadSummarySection({ summary }: { summary: ImplementationThreadSummary }) {
  const delta = summary.afterScore - summary.beforeScore;
  const deltaUp = delta > 0;
  const deltaTone = delta === 0 ? "text-surface-400" : deltaUp ? "text-emerald-400" : "text-rose-400";

  return (
    <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-surface-400">Summary</h3>
        <span className="text-[10px] uppercase tracking-widest text-surface-500">
          Markdown consumed by GPT Image 2
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <ScorePill label="Before" value={summary.beforeScore} />
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-surface-600" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
        <ScorePill label="After" value={summary.afterScore} />
        <span className={`font-mono text-sm font-semibold ${deltaTone}`}>
          {delta > 0 ? "+" : ""}
          {delta}
        </span>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-surface-400">{summary.description}</p>
    </div>
  );
}

type ImplementationThreadListProps = {
  onOpenThread: (id: ImplementationThreadId) => void;
};

export function ImplementationThreadList({ onOpenThread }: ImplementationThreadListProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className={`shrink-0 ${critiqueMutedClass}`}>
        Pick a thread to replay a real ChatGPT workflow — critique markdown pasted with the photo,
        then iterative refinements. AI outputs are placeholders.
      </p>
      <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {implementationPhotoThreads.map((thread) => (
            <ThreadCard key={thread.sampleId} thread={thread} onOpen={onOpenThread} />
          ))}
        </div>
        <pre className="whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-4 text-[11px] leading-relaxed text-surface-300">
          {selfQaV1PlanMarkdown}
        </pre>
      </div>
    </div>
  );
}

type ImplementationThreadViewProps = {
  threadId: ImplementationThreadId;
  onClose: () => void;
};

export function ImplementationThreadView({ threadId, onClose }: ImplementationThreadViewProps) {
  const thread = implementationPhotoThreads.find((t) => t.sampleId === threadId);
  const [collapsedByIndex, setCollapsedByIndex] = useState<Record<number, boolean>>(() =>
    thread
      ? Object.fromEntries(
          thread.messages.map((m, i) => [i, m.role === "user" && m.kind === "critique"]),
        )
      : {},
  );

  if (!thread) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        <CritiqueContentHeader label="Thread not found" onClose={onClose} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <CritiqueContentHeader
        label="Thread for"
        emphasis={thread.label}
        suffix="via GPT Image 2"
        onClose={onClose}
      />
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        {thread.messages.map((message, index) =>
          message.role === "user" ? (
            <UserMessage
              key={index}
              thread={thread}
              message={message}
              collapsed={collapsedByIndex[index] ?? true}
              onToggle={() =>
                setCollapsedByIndex((prev) => ({ ...prev, [index]: !prev[index] }))
              }
            />
          ) : (
            <AssistantMessage key={index} message={message} />
          ),
        )}
        {thread.summary ? <ThreadSummarySection summary={thread.summary} /> : null}
      </div>
    </div>
  );
}
