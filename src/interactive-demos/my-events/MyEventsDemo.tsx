"use client";

import { useMemo, useState } from "react";
import {
  ACTIVITY_STORAGE_KEY,
  MILESTONE_SCHEDULE,
  POINT_SCHEDULE,
  useActivity,
  type ActivityEventType,
} from "@/activity";
import {
  auditKpiCardClass,
  auditKpiGridClass,
  auditMutedTextClass,
  auditPanelClass,
  auditSectionClass,
  auditSectionTitleClass,
  auditTableClass,
  auditTableHeadClass,
  auditTableWrapperClass,
  auditTdClass,
  auditThClass,
} from "@/interactive-demos/npm-audit/components/audit-layout";

const TYPE_FILTERS: Array<{ id: "all" | ActivityEventType; label: string }> = [
  { id: "all", label: "All" },
  { id: "milestone.unlock", label: "Milestones" },
  { id: "modal.open", label: "Opens" },
  { id: "modal.close", label: "Closes" },
  { id: "timeline.select", label: "Timeline" },
  { id: "timeline.pause", label: "Pause" },
  { id: "project.leavePreview", label: "Leave preview" },
  { id: "project.visitSite", label: "Visit site" },
  { id: "theme.change", label: "Themes" },
  { id: "photo.view", label: "Photos" },
  { id: "button.click", label: "Clicks" },
  { id: "video.complete", label: "Videos" },
  { id: "sound.zeepEnable", label: "Zeep" },
  { id: "demo.photoCritique", label: "Critique" },
  { id: "quiz.complete", label: "Quiz" },
];

function formatTs(ts: number): string {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts);
  }
}

export function MyEventsDemo() {
  const { store, reset } = useActivity();
  const [filter, setFilter] = useState<"all" | ActivityEventType>("all");
  const [rawExpanded, setRawExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const rawJson = useMemo(() => JSON.stringify(store, null, 2), [store]);

  const countsByType = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of store.log) {
      counts[entry.type] = (counts[entry.type] ?? 0) + 1;
    }
    return counts;
  }, [store.log]);

  const awardedList = useMemo(
    () =>
      Object.values(store.awarded).sort((a, b) => b.firstAwardedAt - a.firstAwardedAt),
    [store.awarded],
  );

  const filteredLog = useMemo(() => {
    const list = [...store.log].reverse();
    if (filter === "all") return list;
    return list.filter((e) => e.type === filter);
  }, [store.log, filter]);

  const copyRaw = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(rawJson);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = rawJson;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    reset();
    setConfirmReset(false);
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain p-4 sm:p-6"
      data-track-ignore=""
    >
      <div className={`${auditPanelClass} px-5 py-4`}>
        <p className="text-sm leading-relaxed text-surface-300">
          Local activity scoreboard for this browser. Points award once per unique action;
          the chronological log keeps every occurrence.
        </p>
        <p className={`${auditMutedTextClass} mt-2`}>
          Storage key: <code className="text-accent-300/80">{ACTIVITY_STORAGE_KEY}</code>
        </p>
      </div>

      <section className={auditSectionClass}>
        <h3 className={auditSectionTitleClass}>Point legend</h3>
        <div className={`${auditTableWrapperClass} mt-4`}>
          <table className={auditTableClass}>
            <thead className={auditTableHeadClass}>
              <tr>
                <th className={auditThClass}>Action</th>
                <th className={auditThClass}>Points</th>
                <th className={auditThClass}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {POINT_SCHEDULE.filter((row) => row.type !== "milestone.unlock").map((row) => (
                <tr key={row.type}>
                  <td className={auditTdClass}>{row.label}</td>
                  <td className={`${auditTdClass} font-mono text-accent-300`}>{row.points}</td>
                  <td className={auditTdClass}>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={auditSectionClass}>
        <h3 className={auditSectionTitleClass}>Milestone legend</h3>
        <p className={`${auditMutedTextClass} mt-2`}>
          Combination unlocks and score-tier titles from the milestone rules engine (easter board).
        </p>
        <div className={`${auditTableWrapperClass} mt-4`}>
          <table className={auditTableClass}>
            <thead className={auditTableHeadClass}>
              <tr>
                <th className={auditThClass}>Milestone</th>
                <th className={auditThClass}>Points</th>
                <th className={auditThClass}>How to unlock</th>
              </tr>
            </thead>
            <tbody>
              {MILESTONE_SCHEDULE.map((row) => (
                <tr key={row.id}>
                  <td className={auditTdClass}>{row.title}</td>
                  <td className={`${auditTdClass} font-mono text-accent-300`}>
                    {typeof row.scoreThreshold === "number"
                      ? `≥${row.scoreThreshold}`
                      : row.points}
                  </td>
                  <td className={auditTdClass}>{row.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={auditKpiGridClass}>
        <div className={auditKpiCardClass}>
          <p className="text-[11px] uppercase tracking-wide text-surface-500">Total score</p>
          <p className="mt-2 text-2xl font-semibold text-accent-200">{store.totalScore}</p>
        </div>
        <div className={auditKpiCardClass}>
          <p className="text-[11px] uppercase tracking-wide text-surface-500">Awarded</p>
          <p className="mt-2 text-2xl font-semibold text-accent-200">{awardedList.length}</p>
        </div>
        <div className={auditKpiCardClass}>
          <p className="text-[11px] uppercase tracking-wide text-surface-500">Events</p>
          <p className="mt-2 text-2xl font-semibold text-accent-200">{store.log.length}</p>
        </div>
        <div className={auditKpiCardClass}>
          <p className="text-[11px] uppercase tracking-wide text-surface-500">Milestones</p>
          <p className="mt-2 text-2xl font-semibold text-accent-200">
            {countsByType["milestone.unlock"] ?? 0}
          </p>
        </div>
      </div>

      <section className={auditSectionClass}>
        <h3 className={auditSectionTitleClass}>Awarded actions</h3>
        {awardedList.length === 0 ? (
          <p className={`${auditMutedTextClass} mt-4`}>No scored actions yet — explore the site.</p>
        ) : (
          <div className={`${auditTableWrapperClass} mt-4`}>
            <table className={auditTableClass}>
              <thead className={auditTableHeadClass}>
                <tr>
                  <th className={auditThClass}>Action</th>
                  <th className={auditThClass}>Key</th>
                  <th className={auditThClass}>Pts</th>
                  <th className={auditThClass}>First awarded</th>
                </tr>
              </thead>
              <tbody>
                {awardedList.map((row) => (
                  <tr key={row.eventKey}>
                    <td className={auditTdClass}>{row.label}</td>
                    <td className={`${auditTdClass} font-mono text-[11px] text-surface-400`}>
                      {row.eventKey}
                    </td>
                    <td className={`${auditTdClass} font-mono text-accent-300`}>{row.points}</td>
                    <td className={auditTdClass}>{formatTs(row.firstAwardedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={auditSectionClass}>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <h3 className="pl-2 text-base font-semibold text-accent-100">Chronological log</h3>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter log">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                  filter === f.id
                    ? "border-accent-500/50 bg-accent-950/40 text-accent-200"
                    : "border-white/15 text-surface-400 hover:border-white/30 hover:text-surface-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {filteredLog.length === 0 ? (
          <p className={`${auditMutedTextClass} mt-4`}>No events in this filter.</p>
        ) : (
          <div className={`${auditTableWrapperClass} mt-4 max-h-72 overflow-y-auto`}>
            <table className={auditTableClass}>
              <thead className={`${auditTableHeadClass} sticky top-0`}>
                <tr>
                  <th className={auditThClass}>When</th>
                  <th className={auditThClass}>Type</th>
                  <th className={auditThClass}>Label</th>
                  <th className={auditThClass}>Pts</th>
                </tr>
              </thead>
              <tbody>
                {filteredLog.map((entry) => (
                  <tr key={entry.id}>
                    <td className={`${auditTdClass} whitespace-nowrap text-[11px]`}>
                      {formatTs(entry.ts)}
                    </td>
                    <td className={`${auditTdClass} font-mono text-[11px]`}>{entry.type}</td>
                    <td className={auditTdClass}>{entry.label}</td>
                    <td className={`${auditTdClass} font-mono`}>
                      {entry.pointsAwarded > 0 ? (
                        <span className="text-accent-300">+{entry.pointsAwarded}</span>
                      ) : (
                        <span className="text-surface-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={`${auditPanelClass} px-4 py-3`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className={auditSectionTitleClass}>Raw store JSON</h3>
          <button
            type="button"
            onClick={() => void copyRaw()}
            aria-live="polite"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-500/40 bg-accent-500/10 px-3 py-1 text-[11px] font-semibold text-accent-100 transition-colors hover:border-accent-400/60 hover:bg-accent-500/20"
          >
            {copied ? "Copied!" : "Copy JSON"}
          </button>
        </div>
        <div className="relative mt-3">
          <pre
            className={`whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/50 p-3 text-[11px] leading-relaxed text-surface-300 ${
              rawExpanded ? "" : "max-h-40 overflow-hidden"
            }`}
          >
            {rawJson}
          </pre>
          {!rawExpanded ? (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16 rounded-b-lg bg-gradient-to-t from-black/95 via-black/70 to-transparent"
              aria-hidden
            />
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setRawExpanded((v) => !v)}
          className="mt-2 text-xs font-semibold text-accent-300 underline decoration-accent-500/50 underline-offset-2 transition hover:text-accent-200 hover:decoration-accent-300"
        >
          {rawExpanded ? "Hide full JSON" : "Show full JSON"}
        </button>
      </section>

      <div className="flex flex-wrap items-center gap-3 pb-2">
        <button
          type="button"
          onClick={handleReset}
          className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
            confirmReset
              ? "border-red-500/50 bg-red-950/40 text-red-200 hover:bg-red-900/50"
              : "border-white/15 text-surface-300 hover:border-white/30 hover:text-white"
          }`}
        >
          {confirmReset ? "Confirm reset activity log" : "Reset activity log"}
        </button>
        {confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(false)}
            className="text-xs font-medium text-surface-500 hover:text-surface-300"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </div>
  );
}
