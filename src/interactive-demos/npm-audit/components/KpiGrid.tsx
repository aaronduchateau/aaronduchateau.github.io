import { auditKpiCardClass, auditKpiGridClass, severityTextColors } from "./audit-layout";
import type { ParsedAuditReport } from "../types";

type Props = {
  report: ParsedAuditReport;
};

export function KpiGrid({ report }: Props) {
  const { vulns, advisoryList, meta, riskLevel, riskColor } = report;

  const items = [
    { label: "Critical", value: vulns.critical, color: severityTextColors.critical },
    { label: "High", value: vulns.high, color: severityTextColors.high },
    { label: "Moderate", value: vulns.moderate, color: severityTextColors.moderate },
    { label: "Low", value: vulns.low, color: severityTextColors.low },
    { label: "Total Vulnerabilities", value: report.totalVulns, color: "text-surface-100" },
    { label: "Unique Advisories", value: advisoryList.length, color: "text-surface-100" },
    {
      label: "Total Dependencies",
      value: meta.totalDependencies?.toLocaleString() ?? "—",
      color: "text-surface-100",
    },
    { label: "Overall Risk", value: riskLevel, color: severityTextColors[riskColor] ?? "text-surface-100" },
  ];

  return (
    <div className={auditKpiGridClass}>
      {items.map((item) => (
        <div key={item.label} className={auditKpiCardClass}>
          <div className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-wide text-surface-500">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
