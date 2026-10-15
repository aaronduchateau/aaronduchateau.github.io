"use client";

import { critiqueMutedClass } from "@/interactive-demos/photo-critique/components/photo-critique-layout";
import { qaThreads, type QaThread, type QaThreadId } from "../qaScenarios";
import { selfQaV1PlanMarkdown } from "../selfQaV1PlanMarkdown";

function ThreadCard({
  thread,
  onOpen,
}: {
  thread: QaThread;
  onOpen: (id: QaThreadId) => void;
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

type Props = {
  onOpenThread: (id: QaThreadId) => void;
};

export function RegionQaList({ onOpenThread }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className={`shrink-0 ${critiqueMutedClass}`}>
        Pick a thread to replay a stubbed workflow — original photo plus the region markdown that
        would be sent to an image model. AI outputs are placeholders.
      </p>
      <div className="mt-4 min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {qaThreads.map((thread) => (
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
