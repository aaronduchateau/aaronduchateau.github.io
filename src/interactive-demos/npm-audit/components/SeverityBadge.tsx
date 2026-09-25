import { severityColors } from "./audit-layout";

type Props = {
  severity: string;
  children?: React.ReactNode;
  className?: string;
};

export function SeverityBadge({ severity, children, className = "" }: Props) {
  const label = children ?? severity;
  const colorClass = severityColors[severity] ?? "bg-surface-600 text-white";

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colorClass} ${className}`}
    >
      {label}
    </span>
  );
}
