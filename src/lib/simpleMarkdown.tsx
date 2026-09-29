"use client";

import type { ReactNode } from "react";
import { ThemedMermaidDiagram } from "@/components/ThemedMermaidDiagram";

type MdBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "code"; lang: string; path: string | null; body: string }
  | { type: "mermaid"; body: string; caption: string | null };

/** Parse light markdown into blocks (fences may contain blank lines). */
export function parseSimpleMarkdown(source: string): MdBlock[] {
  const lines = source.replace(/\r\n/g, "\n").trim().split("\n");
  const blocks: MdBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const meta = line.slice(3).trim();
      const fenceLines: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        fenceLines.push(lines[i] ?? "");
        i += 1;
      }
      if (i < lines.length) i += 1;
      const body = fenceLines.join("\n");
      const langMatch = /^([a-zA-Z0-9_+-]+)?/.exec(meta);
      const lang = (langMatch?.[1] ?? "").toLowerCase();
      const pathMatch = /\bpath=([^\s]+)/.exec(meta) || /\s((?:src|public)\/[^\s]+)/.exec(meta);
      const path = pathMatch?.[1] ?? null;
      const captionMatch = /\bcaption="([^"]+)"/.exec(meta);
      if (lang === "mermaid") {
        blocks.push({ type: "mermaid", body, caption: captionMatch?.[1] ?? null });
      } else {
        blocks.push({ type: "code", lang, path, body });
      }
      continue;
    }

    if (/^###\s+/.test(line)) {
      blocks.push({ type: "heading", level: 3, text: line.replace(/^###\s+/, "") });
      i += 1;
      continue;
    }
    if (/^##\s+/.test(line)) {
      blocks.push({ type: "heading", level: 2, text: line.replace(/^##\s+/, "") });
      i += 1;
      continue;
    }
    if (/^#\s+/.test(line)) {
      blocks.push({ type: "heading", level: 1, text: line.replace(/^#\s+/, "") });
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^[-*]\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\d+\.\s+/, ""));
        i += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const para: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(```|#|[-*] |\d+\. )/.test(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push({ type: "paragraph", text: para.join("\n") });
  }

  return blocks;
}

/** Minimal markdown → React for article modals (fences, Mermaid, path-labeled code). */
export function SimpleMarkdown({ source }: { source: string }) {
  const blocks = parseSimpleMarkdown(source);

  return (
    <div className="simple-md space-y-5 text-sm leading-relaxed text-surface-400">
      {blocks.map((block, i) => (
        <MarkdownBlock key={i} block={block} />
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
        <code key={key++} className="theme-code-inline">
          {token.slice(1, -1)}
        </code>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function MarkdownBlock({ block }: { block: MdBlock }) {
  if (block.type === "mermaid") {
    return (
      <figure className="space-y-2">
        <ThemedMermaidDiagram
          source={block.body}
          title={block.caption ?? "Theme system flowchart"}
        />
        {block.caption ? (
          <figcaption className="px-1 text-center text-[11px] text-surface-500">
            {block.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "code") {
    return (
      <div className="theme-code-sample">
        {block.path ? (
          <div className="theme-code-sample__path">
            <span className="theme-code-sample__path-label">file</span>
            <code>{block.path}</code>
          </div>
        ) : null}
        <pre className="theme-code-sample__body">
          <code>{block.body}</code>
        </pre>
      </div>
    );
  }

  if (block.type === "heading") {
    if (block.level === 1) {
      return <h2 className="text-xl font-semibold text-white">{inline(block.text)}</h2>;
    }
    if (block.level === 2) {
      return <h3 className="text-lg font-semibold text-white">{inline(block.text)}</h3>;
    }
    return <h4 className="text-base font-semibold text-surface-100">{inline(block.text)}</h4>;
  }

  if (block.type === "ul") {
    return (
      <ul className="list-disc space-y-2 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ul>
    );
  }

  if (block.type === "ol") {
    return (
      <ol className="list-decimal space-y-2.5 pl-5">
        {block.items.map((item, i) => (
          <li key={i}>{inline(item)}</li>
        ))}
      </ol>
    );
  }

  return <p className="whitespace-pre-line">{inline(block.text)}</p>;
}
