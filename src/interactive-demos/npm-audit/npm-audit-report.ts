export type AuditSeverity = "critical" | "high" | "moderate" | "low" | "info";

export type AuditActionType = "install" | "update" | "review" | "replace";

export type NpmAuditCvss = {
  score?: number;
  vector?: string;
};

export type NpmAuditFinding = {
  version?: string;
  paths?: string[];
};

export type NpmAuditAdvisory = {
  id: number;
  module_name: string;
  severity: AuditSeverity;
  title: string;
  overview?: string;
  recommendation?: string;
  patched_versions?: string;
  url?: string;
  cves?: string[];
  cwe?: string[];
  cvss?: NpmAuditCvss;
  findings?: NpmAuditFinding[];
  references?: string;
};

export type NpmAuditResolve = {
  id: number;
  path: string;
  dev: boolean;
};

export type NpmAuditAction = {
  action: AuditActionType;
  module: string;
  target?: string;
  isMajor?: boolean;
  resolves?: NpmAuditResolve[];
};

export type NpmAuditMuted = {
  id: number;
  module: string;
  reason?: string;
  expires?: string;
};

export type NpmAuditVulnerabilities = {
  critical: number;
  high: number;
  moderate: number;
  low: number;
  info: number;
};

export type NpmAuditMetadata = {
  vulnerabilities: NpmAuditVulnerabilities;
  dependencies: number;
  devDependencies: number;
  optionalDependencies?: number;
  peerDependencies?: number;
  totalDependencies: number;
};

export type NpmAuditReport = {
  auditReportVersion?: number;
  runId?: string;
  metadata: NpmAuditMetadata;
  advisories: Record<string, NpmAuditAdvisory>;
  actions?: NpmAuditAction[];
  muted?: NpmAuditMuted[];
};
