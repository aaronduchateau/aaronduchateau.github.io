import type { ReactNode } from "react";
import { auditSectionClass, auditSectionTitleClass } from "./audit-layout";

type Props = {
  title: ReactNode;
  children: ReactNode;
  className?: string;
};

export function ReportSection({ title, children, className = "" }: Props) {
  return (
    <section className={`${auditSectionClass} ${className}`}>
      <h3 className={auditSectionTitleClass}>{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}
