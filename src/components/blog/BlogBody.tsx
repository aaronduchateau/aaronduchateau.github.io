import type { ReactNode } from "react";

type Block = { type: "p"; text: string } | { type: "quote"; text: string };

/** Paragraphs, `> quote` blocks, `**bold**`, and `[label](https://…)` links. */
function parseBlogBody(source: string): Block[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith(">")) {
        quote.push((lines[i] ?? "").replace(/^>\s?/, "").trim());
        i += 1;
      }
      blocks.push({ type: "quote", text: quote.join(" ") });
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && (lines[i] ?? "").trim() && !(lines[i] ?? "").startsWith(">")) {
      para.push((lines[i] ?? "").trim());
      i += 1;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }

  return blocks;
}

export function BlogInline({ text }: { text: string }) {
  return <>{inline(text)}</>;
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token);
      const href = link?.[2] ?? "";
      const label = link?.[1] ?? token;
      if (link && /^https?:\/\//.test(href)) {
        parts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words text-accent-400 underline decoration-accent-400/40 underline-offset-2 hover:text-white"
          >
            {label}
          </a>,
        );
      } else {
        parts.push(token);
      }
    }
    last = match.index + token.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

export function BlogBody({ source }: { source: string }) {
  const blocks = parseBlogBody(source);
  return (
    <div className="space-y-6 text-base leading-relaxed text-surface-200">
      {blocks.map((block, index) =>
        block.type === "quote" ? (
          <blockquote
            key={index}
            className="border-l-2 border-accent-400/70 pl-4 text-surface-100"
          >
            <BlogInline text={block.text} />
          </blockquote>
        ) : (
          <p key={index}>
            <BlogInline text={block.text} />
          </p>
        ),
      )}
    </div>
  );
}
