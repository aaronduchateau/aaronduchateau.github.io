import type { ReactNode } from "react";

/** Minimal markdown → React for article modals (no extra deps). */
export function SimpleMarkdown({ source }: { source: string }) {
  const blocks = source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);

  return (
    <div className="simple-md space-y-4 text-sm leading-relaxed text-surface-400">
      {blocks.map((block, i) => (
        <MarkdownBlock key={i} block={block.trim()} />
      ))}
    </div>
  );
}

function inline(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith("**")) {
      parts.push(
        <strong key={key++} className="font-semibold text-surface-200">
          {token.slice(2, -2)}
        </strong>,
      );
    } else {
      parts.push(
        <code
          key={key++}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-accent-200/90"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownBlock({ block }: { block: string }) {
  if (/^```/.test(block)) {
    const body = block.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, "");
    return (
      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/50 p-3 font-mono text-[12px] text-accent-100/90">
        <code>{body}</code>
      </pre>
    );
  }
  if (/^###\s+/.test(block)) {
    return (
      <h4 className="text-base font-semibold text-surface-100">{inline(block.replace(/^###\s+/, ""))}</h4>
    );
  }
  if (/^##\s+/.test(block)) {
    return (
      <h3 className="text-lg font-semibold text-white">{inline(block.replace(/^##\s+/, ""))}</h3>
    );
  }
  if (/^#\s+/.test(block)) {
    return (
      <h2 className="text-xl font-semibold text-white">{inline(block.replace(/^#\s+/, ""))}</h2>
    );
  }

  const lines = block.split("\n");
  if (lines.every((line) => /^[-*]\s+/.test(line))) {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {lines.map((line, i) => (
          <li key={i}>{inline(line.replace(/^[-*]\s+/, ""))}</li>
        ))}
      </ul>
    );
  }
  if (lines.every((line) => /^\d+\.\s+/.test(line))) {
    return (
      <ol className="list-decimal space-y-2 pl-5">
        {lines.map((line, i) => (
          <li key={i}>{inline(line.replace(/^\d+\.\s+/, ""))}</li>
        ))}
      </ol>
    );
  }

  return <p className="whitespace-pre-line">{inline(lines.join("\n"))}</p>;
}
