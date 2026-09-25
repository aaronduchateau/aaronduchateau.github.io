import type {
  AuditActionType,
  AuditSeverity,
  NpmAuditAction,
  NpmAuditAdvisory,
  NpmAuditReport,
} from "./npm-audit-report";

export type AuditInputMode = "upload" | "paste" | "demo";

export type ModuleEntry = {
  name: string;
  count: number;
  severities: AuditSeverity[];
  highestSev: number;
  highestSevName: AuditSeverity;
  advisories: NpmAuditAdvisory[];
};

export type FixCard = NpmAuditAction & {
  severities: AuditSeverity[];
  resolvesCount: number;
};

export type LockfileParentGroup = {
  parent: string;
  subUpdates: NpmAuditAction[];
  totalResolves: number;
};

export type DepHealthEntry = {
  name: string;
  advisoryCount: number;
  worstSev: number;
  worstSevName: AuditSeverity;
  isDev: boolean;
  advisoryIds: Set<number>;
};

export type ActionGroupKey = "install" | "update" | "review";

export type ParsedAuditReport = {
  raw: NpmAuditReport;
  runId: string;
  meta: NpmAuditReport["metadata"];
  vulns: NpmAuditReport["metadata"]["vulnerabilities"];
  advisories: Record<string, NpmAuditAdvisory>;
  advisoryList: NpmAuditAdvisory[];
  actions: NpmAuditAction[];
  totalVulns: number;
  riskLevel: string;
  riskColor: AuditSeverity | "low";
  devVulnIds: Set<number>;
  prodVulnIds: Set<number>;
  moduleList: ModuleEntry[];
  easyFixes: FixCard[];
  breakingFixes: FixCard[];
  lockfileFixes: FixCard[];
  lockfileParentGroups: LockfileParentGroup[];
  depHealthList: DepHealthEntry[];
  actionGroups: Record<ActionGroupKey, FixCard[]>;
  mutedCount: number;
  isModuleDevOnly: (mod: string) => boolean;
  isAdvisoryDevOnly: (adv: NpmAuditAdvisory) => boolean;
};

export type { AuditActionType, AuditSeverity, NpmAuditAction, NpmAuditAdvisory, NpmAuditReport };
