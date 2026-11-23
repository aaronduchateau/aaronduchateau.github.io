import type { AppIconComponent } from "@/components/ui";

type FeatureCalloutProps = {
  title: string;
  description: string;
  icon: AppIconComponent;
  onClick: () => void;
};

const CTA =
  "theme-card-cta theme-card__cta mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold";

/** Small action card: icon, title, description, and an Open feature cue. */
export function FeatureCallout({ title, description, icon: Icon, onClick }: FeatureCalloutProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="theme-card group flex h-full w-full min-w-0 flex-col p-4 text-left sm:p-5"
      aria-label={`Open feature: ${title}`}
    >
      <span className="flex min-w-0 items-start gap-3">
        <Icon className="mt-0.5 h-8 w-8 shrink-0 text-[color:var(--heading)]" />
        <span className="min-w-0">
          <span className="card-display-heading text-base sm:text-lg">{title}</span>
          <span className="theme-muted mt-1 block text-sm leading-relaxed">{description}</span>
        </span>
      </span>
      <span className={CTA}>
        Open feature
        <span aria-hidden>→</span>
      </span>
    </button>
  );
}
