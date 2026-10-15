"use client";

import { useState } from "react";
import { CritiqueContentHeader } from "@/interactive-demos/photo-critique/components/CritiqueContentHeader";
import { getQaThread, type QaMessage, type QaThread, type QaThreadId } from "../qaScenarios";

function PlaceholderImage({ alt }: { alt: string }) {
  return (
    <div
      className="flex aspect-[4/5] max-w-[14rem] flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-white/20 bg-gradient-to-br from-surface-800/80 via-surface-900/90 to-black px-4 py-6 text-center"
      role="img"
      aria-label={alt}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-surface-500">
        AI edit
      </span>
      <span className="text-xs leading-snug text-surface-300">{alt}</span>
      <span className="text-[10px] text-surface-600">Placeholder</span>
    </div>
  );
}

function UserPrompt({
  thread,
  message,
  collapsed,
  onToggle,
}: {
  thread: QaThread;
  message: Extract<QaMessage, { role: "user" }>;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="overflow-hidden rounded-[1.75rem] border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element -- static demo asset */}
        <img src={thread.originalSrc} alt={thread.label} className="max-h-48 max-w-[16rem] object-cover" />
      </div>
      <div className="max-w-[85%] rounded-[22px] rounded-se-lg bg-accent-950/50 px-4 py-2.5 text-left text-[11px] leading-relaxed text-surface-200">
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
          {collapsed ? "Show full prompt" : "Collapse"}
        </button>
      </div>
    </div>
  );
}

function AssistantMessage({ message }: { message: Extract<QaMessage, { role: "assistant" }> }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {message.src ? (
        <div className="overflow-hidden rounded-3xl border border-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element -- static local demo asset */}
          <img src={message.src} alt={message.alt} loading="lazy" className="max-h-72 max-w-[16rem] object-contain" />
        </div>
      ) : (
        <PlaceholderImage alt={message.alt} />
      )}
    </div>
  );
}

export function RegionQaThread({ threadId, onClose }: { threadId: QaThreadId; onClose: () => void }) {
  const thread = getQaThread(threadId);
  const [collapsedByIndex, setCollapsedByIndex] = useState<Record<number, boolean>>(() =>
    thread
      ? Object.fromEntries(thread.messages.map((m, i) => [i, m.role === "user" && m.kind === "prompt"]))
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
        suffix="via region prompt"
        onClose={onClose}
      />
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain pr-1">
        {thread.messages.map((message, index) =>
          message.role === "user" ? (
            <UserPrompt
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
      </div>
    </div>
  );
}
