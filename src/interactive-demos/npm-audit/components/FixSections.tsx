"use client";

import { useCallback } from "react";
import {
  auditBannerClass,
  auditTableClass,
  auditTableHeadClass,
  auditTableWrapperClass,
  auditTdClass,
  auditThClass,
} from "./audit-layout";
import { ReportSection } from "./ReportSection";
import { SeverityBadge } from "./SeverityBadge";
import type { FixCard, ParsedAuditReport } from "../types";

type Props = {
  report: ParsedAuditReport;
};

function sevBreakdown(fixList: FixCard[], advisories: ParsedAuditReport["advisories"]) {
  const bySev: Record<string, number> = { critical: 0, high: 0, moderate: 0, low: 0, info: 0 };
  fixList.forEach((a) => {
    (a.resolves ?? []).forEach((r) => {
      const adv = advisories[String(r.id)];
      if (adv && bySev[adv.severity] !== undefined) bySev[adv.severity]++;
    });
  });
  return (["critical", "high", "moderate", "low", "info"] as const)
    .filter((s) => bySev[s] > 0)
    .map((s) => ({ sev: s, count: bySev[s] }));
}

function FixCardGrid({ cards }: { cards: FixCard[] }) {
  const copyCmd = useCallback((cmd: string) => {
    void navigator.clipboard.writeText(cmd);
  }, []);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {cards.map((a, i) => {
        const cmd =
          a.action === "update"
            ? `npm update ${a.module}`
            : a.action === "replace"
              ? `# Replace ${a.module} with ${a.target}`
              : `npm install ${a.module}@${a.target ?? "latest"}`;
        return (
          <div
            key={`${a.module}-${i}`}
            className="rounded-lg border border-white/10 bg-surface-900/40 px-5 py-4 pl-6"
          >
            <div className="font-mono text-sm font-semibold text-accent-100">
              {a.module}
              {a.isMajor ? (
                <span className="ml-2">
                  <SeverityBadge severity="major">Major</SeverityBadge>
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-surface-400">
              Upgrade to <strong className="text-surface-200">{a.target ?? "latest"}</strong>
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-surface-400">
              <span>
                Resolves <strong className="text-surface-200">{a.resolvesCount}</strong> vuln
                {a.resolvesCount !== 1 ? "s" : ""}
              </span>
              <SeverityBadge severity={a.action === "replace" ? "review" : a.action}>
                {a.action}
              </SeverityBadge>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {a.severities.map((s) => (
                <SeverityBadge key={s} severity={s} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 rounded bg-black/50 px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-[11px] text-accent-200/90">{cmd}</code>
              <button
                type="button"
                onClick={() => copyCmd(cmd)}
                className="shrink-0 rounded border border-white/15 px-2 py-0.5 text-[10px] text-surface-300 hover:border-accent-500/40 hover:text-white"
              >
                Copy
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FixSections({ report }: Props) {
  const { easyFixes, breakingFixes, lockfileFixes, lockfileParentGroups, advisories } = report;

  const sections = [];

  if (easyFixes.length > 0) {
    const breakdown = sevBreakdown(easyFixes, advisories);
    const totalResolves = easyFixes.reduce((s, a) => s + a.resolvesCount, 0);
    sections.push(
      <ReportSection
        key="easy"
        title={
          <>
            Easy Fixes — package.json ({easyFixes.length} packages, resolves {totalResolves}{" "}
            vulnerabilities)
            <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
              {breakdown.map((b) => (
                <SeverityBadge key={b.sev} severity={b.sev}>
                  {b.count} {b.sev}
                </SeverityBadge>
              ))}
            </span>
          </>
        }
      >
        <div className={auditBannerClass}>
          Direct dependencies in <strong className="text-accent-200">package.json</strong> that can be
          updated with non-breaking, minor/patch upgrades.
        </div>
        <div className="mt-4">
          <FixCardGrid cards={easyFixes} />
        </div>
      </ReportSection>,
    );
  }

  if (breakingFixes.length > 0) {
    const breakdown = sevBreakdown(breakingFixes, advisories);
    const totalResolves = breakingFixes.reduce((s, a) => s + a.resolvesCount, 0);
    sections.push(
      <ReportSection
        key="breaking"
        title={
          <>
            Breaking Fixes — package.json ({breakingFixes.length} packages, resolves {totalResolves}{" "}
            vulnerabilities)
            <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
              {breakdown.map((b) => (
                <SeverityBadge key={b.sev} severity={b.sev}>
                  {b.count} {b.sev}
                </SeverityBadge>
              ))}
            </span>
          </>
        }
      >
        <div className={`${auditBannerClass} border-orange-500/30 bg-orange-950/20`}>
          Direct dependencies requiring a <strong className="text-orange-200">major version upgrade</strong>.
          Review changelogs and test thoroughly.
        </div>
        <div className="mt-4">
          <FixCardGrid cards={breakingFixes} />
        </div>
      </ReportSection>,
    );
  }

  if (lockfileFixes.length > 0) {
    const breakdown = sevBreakdown(lockfileFixes, advisories);
    const totalResolves = lockfileFixes.reduce((s, a) => s + a.resolvesCount, 0);
    sections.push(
      <ReportSection
        key="lockfile"
        title={
          <>
            Lockfile Fixes — sub-dependencies ({lockfileFixes.length} updates, resolves {totalResolves}{" "}
            vulnerabilities)
            <span className="ml-2 inline-flex flex-wrap gap-1 align-middle">
              {breakdown.map((b) => (
                <SeverityBadge key={b.sev} severity={b.sev}>
                  {b.count} {b.sev}
                </SeverityBadge>
              ))}
            </span>
          </>
        }
      >
        <div className={`${auditBannerClass} border-accent-500/30`}>
          Transitive sub-dependencies fixed without changing package.json. Run{" "}
          <code className="text-accent-300">npm update</code> from project root.
        </div>
        <div className={`mt-4 ${auditTableWrapperClass}`}>
          <table className={auditTableClass}>
            <thead className={auditTableHeadClass}>
              <tr>
                <th className={auditThClass}>package.json Dependency</th>
                <th className={auditThClass}>Sub-dep Updates</th>
                <th className={auditThClass}>Vulnerabilities Resolved</th>
                <th className={auditThClass}>Command</th>
              </tr>
            </thead>
            <tbody>
              {lockfileParentGroups.map(({ parent, subUpdates, totalResolves: tr }) => {
                const subNames = Array.from(new Set(subUpdates.map((a) => a.module)));
                return (
                  <tr key={parent}>
                    <td className={auditTdClass}>
                      <strong className="text-surface-100">{parent}</strong>
                    </td>
                    <td className={`${auditTdClass} font-mono text-xs`}>
                      {subNames.map((n) => (
                        <code key={n} className="mr-1 text-accent-200/80">
                          {n}
                        </code>
                      ))}
                    </td>
                    <td className={auditTdClass}>{tr}</td>
                    <td className={`${auditTdClass} font-mono text-xs text-accent-200/80`}>
                      npm update {subNames.join(" ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ReportSection>,
    );
  }

  return <>{sections}</>;
}
