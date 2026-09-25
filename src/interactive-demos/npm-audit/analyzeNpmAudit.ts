import type { AuditSeverity, NpmAuditAction, NpmAuditAdvisory, NpmAuditReport } from "./npm-audit-report";
import type {
  DepHealthEntry,
  FixCard,
  LockfileParentGroup,
  ModuleEntry,
  ParsedAuditReport,
} from "./types";

const SEV_ORDER: Record<AuditSeverity, number> = {
  info: 0,
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

const SEV_NAMES: AuditSeverity[] = ["info", "low", "moderate", "high", "critical"];

/** Fixes common paste typos like `"id": 2200112",` → `"id": 2200112,` */
export function repairAuditJsonText(text: string): string {
  return text
    .replace(/"id"\s*:\s*(\d+)",/g, '"id": $1,')
    .trim();
}

export function parseNpmAuditText(text: string): NpmAuditReport {
  const repaired = repairAuditJsonText(text);
  const parsed = JSON.parse(repaired) as unknown;

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Audit JSON must be an object.");
  }

  const report = parsed as NpmAuditReport;

  if (!report.metadata?.vulnerabilities || !report.advisories) {
    throw new Error("Invalid npm audit JSON: expected metadata.vulnerabilities and advisories.");
  }

  const meta = report.metadata;
  if (meta.totalDependencies == null) {
    meta.totalDependencies =
      (meta.dependencies ?? 0) +
      (meta.devDependencies ?? 0) +
      (meta.optionalDependencies ?? 0) +
      (meta.peerDependencies ?? 0);
  }

  return report;
}

function normalizeActionType(action: NpmAuditAction["action"]): "install" | "update" | "review" {
  if (action === "replace") return "review";
  if (action === "install" || action === "update") return action;
  return "review";
}

function buildFixCards(fixList: NpmAuditAction[], advisories: Record<string, NpmAuditAdvisory>): FixCard[] {
  return fixList.map((a) => {
    const resolves = a.resolves ?? [];
    const sevSet = new Set<AuditSeverity>();
    resolves.forEach((r) => {
      const adv = advisories[String(r.id)];
      if (adv) sevSet.add(adv.severity);
    });
    return { ...a, severities: Array.from(sevSet), resolvesCount: resolves.length };
  });
}

function isDirectUpdate(a: NpmAuditAction): boolean {
  return (a.resolves ?? []).some((r) => !r.path.includes(">"));
}

export function analyzeNpmAudit(data: NpmAuditReport): ParsedAuditReport {
  const meta = data.metadata;
  const vulns = meta.vulnerabilities;
  const advisories = data.advisories;
  const actions = data.actions ?? [];
  const advisoryList = Object.values(advisories);
  const totalVulns = vulns.info + vulns.low + vulns.moderate + vulns.high + vulns.critical;

  let riskLevel = "Low";
  let riskColor: AuditSeverity | "low" = "low";
  if (vulns.critical > 0) {
    riskLevel = "Critical";
    riskColor = "critical";
  } else if (vulns.high > 0) {
    riskLevel = "High";
    riskColor = "high";
  } else if (vulns.moderate > 0) {
    riskLevel = "Moderate";
    riskColor = "moderate";
  }

  const devVulnIds = new Set<number>();
  const prodVulnIds = new Set<number>();
  actions.forEach((a) => {
    (a.resolves ?? []).forEach((r) => {
      if (r.dev) devVulnIds.add(r.id);
      else prodVulnIds.add(r.id);
    });
  });

  const moduleMap: Record<
    string,
    { count: number; severities: AuditSeverity[]; highestSev: number; advisories: NpmAuditAdvisory[] }
  > = {};

  advisoryList.forEach((adv) => {
    const mod = adv.module_name;
    if (!moduleMap[mod]) {
      moduleMap[mod] = { count: 0, severities: [], highestSev: 0, advisories: [] };
    }
    moduleMap[mod].count++;
    moduleMap[mod].severities.push(adv.severity);
    moduleMap[mod].advisories.push(adv);
    moduleMap[mod].highestSev = Math.max(moduleMap[mod].highestSev, SEV_ORDER[adv.severity] ?? 0);
  });

  const moduleList: ModuleEntry[] = Object.entries(moduleMap)
    .map(([name, info]) => ({
      name,
      ...info,
      highestSevName: SEV_NAMES[info.highestSev] ?? "info",
    }))
    .sort((a, b) => b.highestSev - a.highestSev || b.count - a.count);

  const isAdvisoryDevOnly = (adv: NpmAuditAdvisory): boolean => {
    for (const a of actions) {
      for (const r of a.resolves ?? []) {
        if (r.id === adv.id && !r.dev) return false;
      }
    }
    return true;
  };

  const isModuleDevOnly = (mod: string): boolean => {
    const advs = moduleMap[mod]?.advisories ?? [];
    for (const adv of advs) {
      for (const a of actions) {
        for (const r of a.resolves ?? []) {
          if (r.id === adv.id && !r.dev) return false;
        }
      }
    }
    return true;
  };

  const easyFixes = buildFixCards(
    actions.filter(
      (a) => (a.action === "install" && !a.isMajor) || (a.action === "update" && isDirectUpdate(a)),
    ),
    advisories,
  );

  const breakingFixes = buildFixCards(
    actions.filter((a) => a.action === "install" && a.isMajor),
    advisories,
  );

  const lockfileFixes = buildFixCards(
    actions.filter((a) => a.action === "update" && !isDirectUpdate(a)),
    advisories,
  );

  const parentGroups: Record<string, { subUpdates: NpmAuditAction[]; totalResolves: number }> = {};
  lockfileFixes.forEach((a) => {
    const parents = new Set<string>();
    (a.resolves ?? []).forEach((r) => {
      const root = r.path.split(">")[0]?.trim();
      if (root) parents.add(root);
    });
    parents.forEach((p) => {
      if (!parentGroups[p]) parentGroups[p] = { subUpdates: [], totalResolves: 0 };
      parentGroups[p].subUpdates.push(a);
      parentGroups[p].totalResolves += (a.resolves ?? []).length;
    });
  });

  const lockfileParentGroups: LockfileParentGroup[] = Object.entries(parentGroups)
    .map(([parent, info]) => ({ parent, ...info }))
    .sort((a, b) => b.totalResolves - a.totalResolves);

  const depHealth: Record<string, DepHealthEntry> = {};
  advisoryList.forEach((adv) => {
    (adv.findings ?? []).forEach((f) => {
      (f.paths ?? []).forEach((p) => {
        const topPkg = p.split(">")[0]?.trim();
        if (!topPkg) return;
        if (!depHealth[topPkg]) {
          depHealth[topPkg] = {
            name: topPkg,
            advisoryCount: 0,
            worstSev: 0,
            worstSevName: "info",
            isDev: true,
            advisoryIds: new Set<number>(),
          };
        }
        if (!depHealth[topPkg].advisoryIds.has(adv.id)) {
          depHealth[topPkg].advisoryIds.add(adv.id);
          depHealth[topPkg].advisoryCount++;
        }
        const sevVal = SEV_ORDER[adv.severity] ?? 0;
        if (sevVal > depHealth[topPkg].worstSev) {
          depHealth[topPkg].worstSev = sevVal;
          depHealth[topPkg].worstSevName = adv.severity;
        }
      });
    });
  });

  actions.forEach((a) => {
    (a.resolves ?? []).forEach((r) => {
      if (!r.dev) {
        const topPkg = (r.path ?? "").split(">")[0]?.trim();
        if (topPkg && depHealth[topPkg]) depHealth[topPkg].isDev = false;
      }
    });
  });

  const depHealthList = Object.values(depHealth).sort(
    (a, b) => b.worstSev - a.worstSev || b.advisoryCount - a.advisoryCount,
  );

  const actionGroups: ParsedAuditReport["actionGroups"] = { install: [], update: [], review: [] };
  actions.forEach((a) => {
    const type = normalizeActionType(a.action);
    const cards = buildFixCards([a], advisories);
    actionGroups[type].push(...cards);
  });

  return {
    raw: data,
    runId: data.runId ?? "N/A",
    meta,
    vulns,
    advisories,
    advisoryList,
    actions,
    totalVulns,
    riskLevel,
    riskColor,
    devVulnIds,
    prodVulnIds,
    moduleList,
    easyFixes,
    breakingFixes,
    lockfileFixes,
    lockfileParentGroups,
    depHealthList,
    actionGroups,
    mutedCount: data.muted?.length ?? 0,
    isModuleDevOnly,
    isAdvisoryDevOnly,
  };
}

export function parseAndAnalyzeAuditText(text: string): ParsedAuditReport {
  return analyzeNpmAudit(parseNpmAuditText(text));
}
