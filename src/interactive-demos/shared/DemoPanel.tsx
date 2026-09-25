import type { ReactNode } from "react";

type Props = {
  title?: string;
  /** Right-aligned header control (e.g. catalog theme dropdown). */
  actions?: ReactNode;
  children: ReactNode;
};

/** Shared shell for interactive demo panels inside the modal */
export function DemoPanel({ title, actions, children }: Props) {
  const showHeader = Boolean(title || actions);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {showHeader ? (
        <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
          {title ? (
            <p className="min-w-0 font-mono text-[10px] uppercase tracking-[0.18em] text-accent-300/70">
              {title}
            </p>
          ) : (
            <span />
          )}
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
      ) : null}
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
