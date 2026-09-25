import type { ReactNode } from "react";

export type PageSectionDivider = "top" | "bottom" | "none";
export type PageSectionPadding = "lg" | "md";

export type PageSectionProps = {
  divider?: PageSectionDivider;
  padding?: PageSectionPadding;
  children: ReactNode;
  /** Portals / hosts that must sit in the section but outside the inner width. */
  after?: ReactNode;
  className?: string;
};

const DIVIDER_CLASS: Record<PageSectionDivider, string> = {
  top: "theme-page-section theme-page-section--top",
  bottom: "theme-page-section theme-page-section--bottom",
  none: "theme-page-section",
};

/** Homepage strip chrome — inner max-width, padding, hairline divider. */
export function PageSection({
  divider = "bottom",
  padding = "lg",
  children,
  after,
  className,
}: PageSectionProps) {
  const pad = padding === "md" ? "py-14" : "py-20";
  return (
    <section className={`${DIVIDER_CLASS[divider]} bg-surface-950 ${pad} ${className ?? ""}`.trim()}>
      <div className="theme-page-section__inner">{children}</div>
      {after}
    </section>
  );
}
