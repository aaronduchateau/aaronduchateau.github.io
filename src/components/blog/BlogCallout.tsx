import { BlogInline } from "@/components/blog/BlogBody";

const TONE = {
  default: "border-accent-400/70 bg-white/5",
  warning: "border-surface-300/80 bg-white/5",
} as const;

/** A short boxed point. The border follows the theme accent, not a one-off color. */
export function BlogCallout({
  title,
  text,
  tone = "default",
}: {
  title?: string;
  text: string;
  tone?: keyof typeof TONE;
}) {
  return (
    <aside className={`border-l-2 px-4 py-3 ${TONE[tone]}`}>
      {title ? <h3 className="text-base font-semibold text-white">{title}</h3> : null}
      <p className={`${title ? "mt-2" : ""} text-surface-100`}>
        <BlogInline text={text} />
      </p>
    </aside>
  );
}
