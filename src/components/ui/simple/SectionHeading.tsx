import type { ReactNode } from "react";

type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  titleClassName?: string;
  descriptionClassName?: string;
  size?: "lg" | "md";
};

const TITLE_SIZE = {
  lg: "text-3xl sm:text-4xl",
  md: "text-2xl sm:text-3xl",
};

/** Homepage strip heading — optional eyebrow + display title. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  actions,
  titleClassName,
  descriptionClassName,
  size = "lg",
}: Props) {
  const heading = (
    <h2
      className={`section-display-heading ${TITLE_SIZE[size]} ${titleClassName ?? ""}`.trim()}
    >
      <span className="block overflow-visible">{title}</span>
    </h2>
  );

  return (
    <header>
      {eyebrow ? (
        <p
          id={id}
          className="theme-section-anchor font-mono text-xs uppercase tracking-[0.25em]"
        >
          {eyebrow}
        </p>
      ) : id ? (
        <span id={id} className="sr-only">
          {title}
        </span>
      ) : null}
      {actions ? (
        <div className={`${eyebrow ? "mt-3" : ""} flex items-center justify-between gap-4`}>
          {heading}
          {actions}
        </div>
      ) : (
        <div className={eyebrow ? "mt-3" : undefined}>{heading}</div>
      )}
      {description ? (
        <p className={`theme-muted mt-3 max-w-2xl ${descriptionClassName ?? ""}`.trim()}>
          {description}
        </p>
      ) : null}
    </header>
  );
}
