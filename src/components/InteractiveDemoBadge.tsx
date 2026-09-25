type InteractiveDemoBadgeProps = {
  /** `list` is the compact graphic used by the mobile content list. */
  size?: "card" | "list";
  kicker?: string;
  label?: string;
};

/** Shared plate — demo cards, article cards, and the mobile list graphic. */
export function InteractiveDemoBadge({
  size = "card",
  kicker = "Interactive",
  label = "Try the demo",
}: InteractiveDemoBadgeProps) {
  const list = size === "list";
  return (
    <div
      className={list ? "theme-demo-badge theme-demo-badge--list" : "theme-demo-badge theme-demo-badge--card"}
      aria-hidden
    >
      <p className="theme-demo-badge__kicker">{kicker}</p>
      <p className="theme-demo-badge__label">{label}</p>
    </div>
  );
}
