import { auditSubheadingClass, severityBarColors } from "./audit-layout";
import type { ParsedAuditReport } from "../types";

type Props = {
  report: ParsedAuditReport;
};

export function SeverityBar({ report }: Props) {
  const { vulns, totalVulns } = report;

  const segments = [
    { key: "critical", label: "Critical", count: vulns.critical },
    { key: "high", label: "High", count: vulns.high },
    { key: "moderate", label: "Moderate", count: vulns.moderate },
    { key: "low", label: "Low", count: vulns.low },
    { key: "info", label: "Info", count: vulns.info },
  ].filter((s) => s.count > 0);

  if (segments.length === 0) return null;

  return (
    <div>
      <h4 className={auditSubheadingClass}>Vulnerability Distribution</h4>
      <div className="mt-3 flex h-8 overflow-hidden rounded-md">
        {segments.map((s) => (
          <div
            key={s.key}
            className={`flex min-w-[2rem] items-center justify-center text-xs font-bold text-white ${severityBarColors[s.key]}`}
            style={{ flex: s.count }}
            title={`${s.label}: ${s.count}`}
          >
            {s.count}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-4 pl-2 text-xs text-surface-400">
        {segments.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${severityBarColors[s.key]}`} />
            {s.label}: {s.count} ({totalVulns > 0 ? ((s.count / totalVulns) * 100).toFixed(1) : 0}%)
          </span>
        ))}
      </div>
    </div>
  );
}
