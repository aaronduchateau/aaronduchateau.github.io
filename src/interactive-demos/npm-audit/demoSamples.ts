import type { NpmAuditReport } from "./npm-audit-report";
import criticalPlatformAudit from "./samples/critical-platform.json";
import { enterpriseMonolithAudit } from "./samples/enterprise-monolith";
import { fintechStackAudit } from "./samples/fintech-stack";

export type DemoSampleId = "criticalPlatform" | "enterpriseMonolith" | "fintechStack";

export type DemoSample = {
  id: DemoSampleId;
  label: string;
  description: string;
  report: NpmAuditReport;
};

/** Three user-provided example audit.json reports for the Demo tab */
export const demoSamples: DemoSample[] = [
  {
    id: "criticalPlatform",
    label: "Critical platform",
    description: "6 critical, 13 high — multi-service platform with SSRF, sandbox escape, and lockfile fixes.",
    report: criticalPlatformAudit as NpmAuditReport,
  },
  {
    id: "enterpriseMonolith",
    label: "Enterprise monolith",
    description: "5,166 dependencies — JWT, tar, deprecated request, and muted advisories.",
    report: enterpriseMonolithAudit,
  },
  {
    id: "fintechStack",
    label: "Fintech stack",
    description: "Payment API focus — stripe, pg, helmet, and crypto-js in production paths.",
    report: fintechStackAudit,
  },
];

export const defaultDemoSampleId: DemoSampleId = "criticalPlatform";

export function getDemoSample(id: DemoSampleId): DemoSample {
  const sample = demoSamples.find((s) => s.id === id);
  if (!sample) throw new Error(`Unknown demo sample: ${id}`);
  return sample;
}

export function demoSampleJson(id: DemoSampleId): string {
  return JSON.stringify(getDemoSample(id).report, null, 2);
}
