"use client";

import { Fragment, useMemo, useState } from "react";
import {
  auditTableClass,
  auditTableHeadClass,
  auditTableWrapperClass,
  auditTdClass,
  auditThClass,
} from "./audit-layout";
import { ReportSection } from "./ReportSection";
import { SeverityBadge } from "./SeverityBadge";
import type { NpmAuditAdvisory, ParsedAuditReport } from "../types";

type Props = {
  report: ParsedAuditReport;
};

type SortKey = "severity" | "module" | "title" | "cvss" | "recommendation";

const SEV_ORDER: Record<string, number> = {
  critical: 4,
  high: 3,
  moderate: 2,
  low: 1,
  info: 0,
};

export function AdvisoryTable({ report }: Props) {
  const { advisoryList, isAdvisoryDevOnly } = report;
  const [sevFilter, setSevFilter] = useState("");
  const [search, setSearch] = useState("");
  const [devOnly, setDevOnly] = useState(false);
  const [prodOnly, setProdOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [sortDir, setSortDir] = useState(-1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let list = advisoryList.filter((adv) => {
      if (sevFilter && adv.severity !== sevFilter) return false;
      if (search) {
        const haystack = [adv.module_name, adv.title, ...(adv.cves ?? []), ...(adv.cwe ?? [])]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(search.toLowerCase())) return false;
      }
      if (devOnly && !isAdvisoryDevOnly(adv)) return false;
      if (prodOnly && isAdvisoryDevOnly(adv)) return false;
      return true;
    });

    list = [...list].sort((a, b) => {
      let va: string | number;
      let vb: string | number;
      switch (sortKey) {
        case "severity":
          va = SEV_ORDER[a.severity] ?? 0;
          vb = SEV_ORDER[b.severity] ?? 0;
          break;
        case "module":
          va = a.module_name.toLowerCase();
          vb = b.module_name.toLowerCase();
          break;
        case "title":
          va = a.title.toLowerCase();
          vb = b.title.toLowerCase();
          break;
        case "cvss":
          va = a.cvss?.score ?? 0;
          vb = b.cvss?.score ?? 0;
          break;
        case "recommendation":
          va = (a.recommendation ?? "").toLowerCase();
          vb = (b.recommendation ?? "").toLowerCase();
          break;
        default:
          va = 0;
          vb = 0;
      }
      if (va < vb) return -1 * sortDir;
      if (va > vb) return 1 * sortDir;
      return 0;
    });

    return list;
  }, [advisoryList, devOnly, isAdvisoryDevOnly, prodOnly, search, sevFilter, sortDir, sortKey]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => d * -1);
    else {
      setSortKey(key);
      setSortDir(-1);
    }
  };

  const renderRow = (adv: NpmAuditAdvisory) => {
    const cvss = adv.cvss?.score;
    const cves = (adv.cves ?? []).join(", ") || "N/A";
    const cwes = (adv.cwe ?? []).join(", ") || "N/A";
    const paths = (adv.findings ?? []).flatMap((f) => f.paths ?? []);
    const versions = (adv.findings ?? []).map((f) => f.version).filter(Boolean);
    const expanded = expandedId === adv.id;

    return (
      <Fragment key={adv.id}>
        <tr className="hover:bg-white/[0.02]">
          <td className={auditTdClass}>
            <SeverityBadge severity={adv.severity} />
          </td>
          <td className={auditTdClass}>
            <strong className="text-surface-100">{adv.module_name}</strong>
            {versions.length ? (
              <div className="text-[11px] text-surface-500">v{versions.join(", v")}</div>
            ) : null}
          </td>
          <td className={auditTdClass}>{adv.title}</td>
          <td className={auditTdClass}>
            {typeof cvss === "number" && cvss > 0 ? (
              <strong className={cvss >= 9 ? "text-red-400" : cvss >= 7 ? "text-orange-400" : "text-amber-400"}>
                {cvss}
              </strong>
            ) : (
              <span className="text-surface-600">N/A</span>
            )}
          </td>
          <td className={`${auditTdClass} font-mono text-xs`}>{cves}</td>
          <td className={`${auditTdClass} text-xs`}>{cwes}</td>
          <td className={`${auditTdClass} text-xs`}>{adv.recommendation ?? "N/A"}</td>
          <td className={`${auditTdClass} font-mono text-xs`}>{adv.patched_versions ?? "N/A"}</td>
          <td className={auditTdClass}>
            {adv.url ? (
              <a href={adv.url} target="_blank" rel="noopener noreferrer" className="text-accent-400 hover:underline">
                View
              </a>
            ) : null}
          </td>
          <td className={auditTdClass}>
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : adv.id)}
              className="text-surface-400 hover:text-accent-300"
              aria-label={expanded ? "Collapse" : "Expand"}
            >
              {expanded ? "▲" : "▼"}
            </button>
          </td>
        </tr>
        {expanded ? (
          <tr>
            <td colSpan={10} className="border-b border-white/10 bg-black/40 px-5 py-4 pl-8">
              <h5 className="text-xs font-semibold uppercase tracking-wide text-accent-300/80">Overview</h5>
              <p className="mt-2 text-sm text-surface-300">{adv.overview ?? "No description available."}</p>
              <h5 className="mt-4 text-xs font-semibold uppercase tracking-wide text-accent-300/80">
                Affected Dependency Paths ({paths.length})
              </h5>
              <div className="mt-2 font-mono text-xs leading-relaxed text-surface-400">
                {paths.length ? paths.map((p) => <div key={p}>{p}</div>) : "N/A"}
              </div>
            </td>
          </tr>
        ) : null}
      </Fragment>
    );
  };

  return (
    <ReportSection title="Detailed Advisories">
      <div className="mb-4 flex flex-wrap items-center gap-3 pl-2">
        <select
          value={sevFilter}
          onChange={(e) => setSevFilter(e.target.value)}
          className="rounded border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-surface-200"
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="moderate">Moderate</option>
          <option value="low">Low</option>
          <option value="info">Info</option>
        </select>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search module, title, CVE..."
          className="min-w-[180px] flex-1 rounded border border-white/15 bg-black/50 px-3 py-1.5 text-xs text-surface-200 placeholder:text-surface-600"
        />
        <label className="flex items-center gap-1.5 text-xs text-surface-400">
          <input
            type="checkbox"
            checked={devOnly}
            onChange={(e) => {
              setDevOnly(e.target.checked);
              if (e.target.checked) setProdOnly(false);
            }}
          />
          Dev-only
        </label>
        <label className="flex items-center gap-1.5 text-xs text-surface-400">
          <input
            type="checkbox"
            checked={prodOnly}
            onChange={(e) => {
              setProdOnly(e.target.checked);
              if (e.target.checked) setDevOnly(false);
            }}
          />
          Prod-only
        </label>
        <span className="ml-auto text-xs text-surface-500">
          Showing {filtered.length} of {advisoryList.length} advisories
        </span>
      </div>
      <div className={auditTableWrapperClass}>
        <table className={auditTableClass}>
          <thead className={auditTableHeadClass}>
            <tr>
              <th className={`${auditThClass} cursor-pointer`} onClick={() => toggleSort("severity")}>
                Severity
              </th>
              <th className={`${auditThClass} cursor-pointer`} onClick={() => toggleSort("module")}>
                Module
              </th>
              <th className={`${auditThClass} cursor-pointer`} onClick={() => toggleSort("title")}>
                Title
              </th>
              <th className={`${auditThClass} cursor-pointer`} onClick={() => toggleSort("cvss")}>
                CVSS
              </th>
              <th className={auditThClass}>CVEs</th>
              <th className={auditThClass}>CWE</th>
              <th className={`${auditThClass} cursor-pointer`} onClick={() => toggleSort("recommendation")}>
                Recommendation
              </th>
              <th className={auditThClass}>Patched</th>
              <th className={auditThClass}>Link</th>
              <th className={auditThClass} />
            </tr>
          </thead>
          <tbody>{filtered.map((adv) => renderRow(adv))}</tbody>
        </table>
      </div>
    </ReportSection>
  );
}
