import { auditRiskBannerClass, auditSectionClass, auditTableClass, auditTableHeadClass, auditTableWrapperClass, auditTdClass, auditThClass } from "./audit-layout";
import { AdvisoryTable } from "./AdvisoryTable";
import { AuditCharts } from "./AuditCharts";
import { FixSections } from "./FixSections";
import { KpiGrid } from "./KpiGrid";
import { ReportSection } from "./ReportSection";
import { SeverityBadge } from "./SeverityBadge";
import { SeverityBar } from "./SeverityBar";
import type { ParsedAuditReport } from "../types";

type Props = {
  report: ParsedAuditReport;
};

const ACTION_LABELS = {
  install: {
    icon: "↓",
    title: "Install (Major Upgrades)",
    desc: "These require a major version bump and may include breaking changes.",
  },
  update: {
    icon: "↻",
    title: "Update (Compatible Upgrades)",
    desc: "These can be applied with minimal risk of breaking changes.",
  },
  review: {
    icon: "⚠",
    title: "Review (Manual Intervention)",
    desc: "These cannot be auto-fixed and require manual review or alternative solutions.",
  },
} as const;

export function NpmAuditDashboard({ report }: Props) {
  const { vulns, advisoryList, meta, totalVulns, prodVulnIds, moduleList, depHealthList, actionGroups, mutedCount, isModuleDevOnly, runId } =
    report;

  const reportDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-5 text-surface-200">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4 pl-2">
        <div>
          <h2 className="text-lg font-bold text-accent-100">NPM Audit Dashboard</h2>
          <p className="text-xs text-surface-500">Security Vulnerability Report</p>
        </div>
        <div className="text-right text-xs text-surface-500">
          <div>Generated: {reportDate}</div>
          <div className="font-mono">Run ID: {runId}</div>
        </div>
      </header>

      <div className={auditRiskBannerClass}>
        <strong className="text-red-300">Risk Assessment:</strong> This project has{" "}
        <strong className="text-red-200">{totalVulns} known vulnerabilities</strong> across{" "}
        <strong className="text-red-200">{advisoryList.length} unique advisories</strong> affecting its{" "}
        {meta.totalDependencies?.toLocaleString() ?? "—"} dependencies.{" "}
        <strong className="text-red-200">
          {vulns.critical} critical
        </strong> and <strong className="text-red-200">{vulns.high} high</strong> severity issues require
        immediate attention.
        {prodVulnIds.size > 0 ? (
          <>
            <br />
            <strong className="text-orange-200">
              {prodVulnIds.size} vulnerabilities affect production dependencies
            </strong>{" "}
            and pose a direct risk to deployed applications.
          </>
        ) : (
          <>
            <br />
            All identified vulnerabilities are in development dependencies and do not directly affect
            production builds.
          </>
        )}
      </div>

      <KpiGrid report={report} />

      <div className={auditSectionClass}>
        <SeverityBar report={report} />
      </div>

      <FixSections report={report} />

      <AuditCharts report={report} />

      {moduleList.length > 0 ? (
        <ReportSection title="Most Affected Modules (Top 20)">
          <div className={auditTableWrapperClass}>
            <table className={auditTableClass}>
              <thead className={auditTableHeadClass}>
                <tr>
                  <th className={auditThClass}>#</th>
                  <th className={auditThClass}>Module</th>
                  <th className={auditThClass}>Advisories</th>
                  <th className={auditThClass}>Highest Severity</th>
                  <th className={auditThClass}>Scope</th>
                </tr>
              </thead>
              <tbody>
                {moduleList.slice(0, 20).map((m, i) => {
                  const devOnly = isModuleDevOnly(m.name);
                  return (
                    <tr key={m.name} className="hover:bg-white/[0.02]">
                      <td className={auditTdClass}>{i + 1}</td>
                      <td className={auditTdClass}>
                        <strong className="text-surface-100">{m.name}</strong>
                      </td>
                      <td className={auditTdClass}>{m.count}</td>
                      <td className={auditTdClass}>
                        <SeverityBadge severity={m.highestSevName} />
                      </td>
                      <td className={auditTdClass}>
                        <SeverityBadge severity={devOnly ? "dev" : "prod"}>{devOnly ? "Dev" : "Prod"}</SeverityBadge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ReportSection>
      ) : null}

      {depHealthList.length > 0 ? (
        <ReportSection title={`Dependency Health (${depHealthList.length} affected packages)`}>
          <p className="mb-4 pl-2 text-xs text-surface-500">
            Direct dependencies colored by worst vulnerability severity. Only packages with known issues
            are shown.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {depHealthList.map((d) => (
              <div
                key={d.name}
                className="rounded-lg border border-white/10 bg-surface-900/40 px-5 py-3 pl-6"
              >
                <div className="font-mono text-sm font-semibold text-accent-100">{d.name}</div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-surface-400">
                  <SeverityBadge severity={d.worstSevName} />
                  <span>
                    {d.advisoryCount} advisor{d.advisoryCount !== 1 ? "ies" : "y"}
                  </span>
                  <SeverityBadge severity={d.isDev ? "dev" : "prod"}>{d.isDev ? "Dev" : "Prod"}</SeverityBadge>
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      ) : null}

      <AdvisoryTable report={report} />

      <ReportSection title="Remediation Actions">
        {(Object.entries(actionGroups) as [keyof typeof actionGroups, typeof actionGroups.install][]).map(
          ([type, acts]) => {
            if (acts.length === 0) return null;
            const info = ACTION_LABELS[type];
            return (
              <div key={type} className="mb-6 last:mb-0">
                <h4 className="pl-2 text-sm font-semibold text-surface-200">
                  <SeverityBadge severity={type}>{info.icon} {type.toUpperCase()}</SeverityBadge>
                  <span className="ml-2">{info.title} ({acts.length})</span>
                </h4>
                <p className="mt-1 pl-2 text-xs text-surface-500">{info.desc}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {acts.map((a, i) => {
                    const resolvesCount = a.resolvesCount;
                    const devResolves = (a.resolves ?? []).filter((r) => r.dev).length;
                    const prodResolves = resolvesCount - devResolves;
                    return (
                      <div
                        key={`${a.module}-${i}`}
                        className="rounded-lg border border-white/10 bg-surface-900/30 px-5 py-3 pl-6"
                      >
                        <div className="font-mono text-sm text-accent-100">{a.module}</div>
                        <div className="mt-1 text-xs text-surface-400">
                          Target: <strong className="text-surface-200">{a.target ?? "N/A"}</strong>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1 text-xs">
                          <span className="text-surface-500">
                            Resolves: <strong className="text-surface-300">{resolvesCount}</strong>
                          </span>
                          {a.isMajor ? <SeverityBadge severity="major">Major</SeverityBadge> : null}
                          {prodResolves > 0 ? (
                            <SeverityBadge severity="prod">{prodResolves} Prod</SeverityBadge>
                          ) : null}
                          {devResolves > 0 ? (
                            <SeverityBadge severity="dev">{devResolves} Dev</SeverityBadge>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          },
        )}
        <p className="pl-2 text-xs text-surface-600">
          {mutedCount > 0 ? `${mutedCount} muted advisory(s) not shown.` : "No muted advisories."}
        </p>
      </ReportSection>

      <footer className="border-t border-white/10 pt-4 pl-2 text-center text-[11px] text-surface-600">
        NPM Audit Dashboard — Auto-generated from <code className="text-accent-700">npm audit --json</code> output
      </footer>
    </div>
  );
}
