import { ModalCloseButton } from "@/components/ModalCloseButton";
import { MODAL_CHROME_PAD_X } from "@/lib/modalLayout";
import { NpmAuditDashboard } from "./NpmAuditDashboard";
import type { ParsedAuditReport } from "../types";

type Props = {
  report: ParsedAuditReport;
  onClose: () => void;
};

/** Top bar matches photo-critique: context left, circular close right (modal shell keeps its left X). */
export function AuditResults({ report, onClose }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className={`mb-3 flex shrink-0 items-center justify-between gap-3 ${MODAL_CHROME_PAD_X}`}>
        <p className="min-w-0 truncate text-xs text-surface-500">
          Showing analysis for <span className="font-mono text-accent-400/80">{report.runId}</span>
        </p>
        <ModalCloseButton size="sm" onClick={onClose} />
      </div>
      <div className={`min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1 ${MODAL_CHROME_PAD_X}`}>
        <NpmAuditDashboard report={report} />
      </div>
    </div>
  );
}
