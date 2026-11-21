import type { ReactNode } from "react";
import { BlogInline } from "@/components/blog/BlogBody";
import type { BlogChartItem, BlogChartKind } from "@/data/blogBlocks";

/** Theme tokens only, so a chart does not invent a second palette. */
const SWATCH = [
  "rgb(var(--accent-400))",
  "rgb(var(--surface-300))",
  "rgb(var(--surface-500))",
  "rgb(var(--accent-200))",
  "rgb(var(--accent-700))",
];

function swatch(index: number): string {
  return SWATCH[index % SWATCH.length] ?? SWATCH[0];
}

function signed(item: BlogChartItem): string {
  if (item.display) return item.display;
  const value = item.value ?? 0;
  const digits = Number.isInteger(value) ? 0 : 1;
  const body = `${Math.abs(value).toFixed(digits)}%`;
  if (value > 0) return `+${body}`;
  if (value < 0) return `-${body}`;
  return body;
}

function ChartFrame({
  title,
  note,
  children,
}: {
  title?: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <figure className="theme-radius-card border theme-hairline px-4 py-4 sm:px-5">
      {title ? (
        <figcaption className="text-sm font-semibold text-white">{title}</figcaption>
      ) : null}
      <div className={title ? "mt-4" : ""}>{children}</div>
      {note ? (
        <p className="mt-3 text-xs leading-relaxed text-surface-400">
          <BlogInline text={note} />
        </p>
      ) : null}
    </figure>
  );
}

function Bars({ items, max }: { items: BlogChartItem[]; max?: number }) {
  const peak =
    max ??
    Math.max(...items.map((item) => Math.abs(item.value ?? 0)), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const value = item.value ?? 0;
        const width = Math.max((Math.abs(value) / peak) * 100, value === 0 ? 0 : 1.5);
        return (
          <div key={item.label} className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-sm">
            <span className="text-surface-200">{item.label}</span>
            <span className="h-3 overflow-hidden rounded-sm bg-white/10">
              <span
                className="block h-full"
                style={{
                  width: `${width}%`,
                  background: value < 0 ? "rgb(var(--surface-300))" : "rgb(var(--accent-400))",
                }}
              />
            </span>
            <span className="text-right font-medium tabular-nums text-white">{signed(item)}</span>
          </div>
        );
      })}
    </div>
  );
}

function Split({ items }: { items: BlogChartItem[] }) {
  const names = items[0]?.parts?.map((part) => part.label) ?? [];
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="font-medium text-white">{item.label}</span>
            {item.display ? <span className="text-xs text-surface-400">{item.display}</span> : null}
          </div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-sm bg-white/10">
            {(item.parts ?? []).map((part, index) => (
              <span
                key={part.label}
                className="block h-full"
                style={{ width: `${part.value}%`, background: swatch(index) }}
              />
            ))}
          </div>
          {item.text ? (
            <p className="mt-2 text-sm text-surface-300">
              <BlogInline text={item.text} />
            </p>
          ) : null}
        </div>
      ))}
      {names.length > 0 ? <Legend names={names} /> : null}
    </div>
  );
}

function Stack({ items }: { items: BlogChartItem[] }) {
  const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0) || 1;
  return (
    <div>
      <div className="flex h-4 overflow-hidden rounded-sm">
        {items.map((item, index) => (
          <span
            key={item.label}
            className="block h-full"
            style={{ width: `${((item.value ?? 0) / total) * 100}%`, background: swatch(index) }}
            title={`${item.label} ${item.display ?? `${item.value ?? 0}%`}`}
          />
        ))}
      </div>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-surface-200">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 align-middle"
                style={{ background: swatch(index) }}
              />
              {item.label}
            </span>
            <span className="font-medium tabular-nums text-white">
              {item.display ?? `${item.value ?? 0}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Donut({ items }: { items: BlogChartItem[] }) {
  const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0) || 1;
  let cursor = 0;
  const stops = items.map((item, index) => {
    const start = cursor;
    cursor += ((item.value ?? 0) / total) * 100;
    return `${swatch(index)} ${start}% ${cursor}%`;
  });
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div
        className="grid h-40 w-40 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${stops.join(", ")})` }}
        role="img"
        aria-label={items.map((item) => `${item.label} ${item.display ?? item.value}`).join(", ")}
      >
        <span className="grid h-24 w-24 place-items-center rounded-full bg-surface-950 text-xs font-medium text-surface-300">
          Sketch
        </span>
      </div>
      <ul className="w-full space-y-2">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-surface-200">
              <span
                className="mr-2 inline-block h-2.5 w-2.5 align-middle"
                style={{ background: swatch(index) }}
              />
              {item.label}
            </span>
            <span className="font-medium tabular-nums text-white">
              {item.display ?? `${item.value ?? 0}%`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Legend({ names }: { names: string[] }) {
  return (
    <ul className="flex flex-wrap gap-4 text-xs text-surface-400">
      {names.map((name, index) => (
        <li key={name}>
          <span
            className="mr-1.5 inline-block h-2.5 w-2.5 align-middle"
            style={{ background: swatch(index) }}
          />
          {name}
        </li>
      ))}
    </ul>
  );
}

export function BlogChart({
  kind,
  title,
  note,
  max,
  items,
}: {
  kind: BlogChartKind;
  title?: string;
  note?: string;
  max?: number;
  items: BlogChartItem[];
}) {
  return (
    <ChartFrame title={title} note={note}>
      {kind === "bars" ? <Bars items={items} max={max} /> : null}
      {kind === "split" ? <Split items={items} /> : null}
      {kind === "stack" ? <Stack items={items} /> : null}
      {kind === "donut" ? <Donut items={items} /> : null}
    </ChartFrame>
  );
}

export function BlogFigure({
  value,
  label,
  note,
}: {
  value: string;
  label?: string;
  note?: string;
}) {
  return (
    <figure className="theme-radius-card border theme-hairline px-4 py-4 sm:px-5">
      {label ? <p className="text-xs font-medium uppercase tracking-[0.14em] text-surface-400">{label}</p> : null}
      <p className="font-display text-4xl text-white sm:text-5xl">{value}</p>
      {note ? (
        <figcaption className="mt-2 text-sm text-surface-300">
          <BlogInline text={note} />
        </figcaption>
      ) : null}
    </figure>
  );
}
