import { BlogInline } from "@/components/blog/BlogBody";
import { BlogCallout } from "@/components/blog/BlogCallout";
import { BlogChart, BlogFigure } from "@/components/blog/BlogChart";
import type { BlogBlock } from "@/data/blogBlocks";

function Columns({ items }: { items: { title: string; text: string }[] }) {
  const wide = items.length > 2 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2";
  return (
    <div className={`grid gap-3 ${wide}`}>
      {items.map((item) => (
        <section key={item.title} className="theme-radius-card border theme-hairline p-4">
          <h3 className="text-base font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-surface-300">
            <BlogInline text={item.text} />
          </p>
        </section>
      ))}
    </div>
  );
}

function Table({
  caption,
  headers,
  rows,
}: {
  caption?: string;
  headers: string[];
  rows: string[][];
}) {
  return (
    <figure>
      {caption ? <figcaption className="mb-2 text-sm text-surface-400">{caption}</figcaption> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header} className="border-b theme-hairline px-3 py-2 font-semibold text-white">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border-b theme-hairline px-3 py-2 align-top text-surface-200">
                    <BlogInline text={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item, index) => (
        <li key={index} className="grid grid-cols-[2rem_1fr] gap-3 text-surface-200">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent-400/15 text-sm font-semibold text-accent-400">
            {index + 1}
          </span>
          <span className="pt-1">
            <BlogInline text={item} />
          </span>
        </li>
      ))}
    </ol>
  );
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "h2") {
    return <h2 className="pt-4 text-2xl font-semibold text-white">{block.text}</h2>;
  }
  if (block.type === "h3") {
    return <h3 className="text-lg font-semibold text-white">{block.text}</h3>;
  }
  if (block.type === "quote") {
    return (
      <blockquote className="border-l-2 border-accent-400/70 pl-4 text-lg text-surface-100">
        <BlogInline text={block.text} />
      </blockquote>
    );
  }
  if (block.type === "callout") {
    return <BlogCallout title={block.title} text={block.text} tone={block.tone} />;
  }
  if (block.type === "columns") return <Columns items={block.items} />;
  if (block.type === "table") {
    return <Table caption={block.caption} headers={block.headers} rows={block.rows} />;
  }
  if (block.type === "steps") return <Steps items={block.items} />;
  if (block.type === "figure") {
    return <BlogFigure value={block.value} label={block.label} note={block.note} />;
  }
  if (block.type === "chart") {
    return (
      <BlogChart
        kind={block.kind}
        title={block.title}
        note={block.note}
        max={block.max}
        items={block.items}
      />
    );
  }
  return (
    <p>
      <BlogInline text={block.text} />
    </p>
  );
}

export function BlogBlocks({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="space-y-6 text-base leading-relaxed text-surface-200">
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  );
}
