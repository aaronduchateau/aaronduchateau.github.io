"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useTheme } from "@/theme/ThemeProvider";

function readCssRgb(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  if (!raw) return fallback;
  const parts = raw.split(/\s+/).map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return fallback;
  return `#${parts
    .slice(0, 3)
    .map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0"))
    .join("")}`;
}

function readCssColor(varName: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return raw || fallback;
}

/** Cap so the full chart stays in one glance next to the article copy. */
const DIAGRAM_MAX_HEIGHT_PX = 200;

/**
 * Scale an SVG to fit the host width and a modest height budget.
 * CSS max-height alone often clips Mermaid output; explicit sizing keeps the whole flow visible.
 */
function fitSvgToHost(svgEl: SVGSVGElement, host: HTMLElement) {
  const viewBox = svgEl.getAttribute("viewBox")?.trim().split(/[\s,]+/).map(Number);
  const vbW = viewBox && viewBox.length === 4 ? viewBox[2] : svgEl.width.baseVal.value || 0;
  const vbH = viewBox && viewBox.length === 4 ? viewBox[3] : svgEl.height.baseVal.value || 0;
  if (!vbW || !vbH) return;

  const maxW = Math.max(host.clientWidth - 8, 120);
  const maxH = DIAGRAM_MAX_HEIGHT_PX;
  const scale = Math.min(maxW / vbW, maxH / vbH, 1);
  const w = Math.max(1, Math.round(vbW * scale));
  const h = Math.max(1, Math.round(vbH * scale));

  svgEl.setAttribute("width", String(w));
  svgEl.setAttribute("height", String(h));
  svgEl.style.width = `${w}px`;
  svgEl.style.height = `${h}px`;
  svgEl.style.maxWidth = "100%";
  svgEl.style.maxHeight = `${DIAGRAM_MAX_HEIGHT_PX}px`;
}

type Props = {
  /** Mermaid source (flowchart / sequence / etc.). */
  source: string;
  /** Short label for screen readers. */
  title?: string;
};

/**
 * Client-side Mermaid diagram painted with live theme tokens
 * (`--accent-*`, `--surface-*`, `--heading`) so charts restyle with Options.
 * Sized to keep the full flow readable in one glance (compact spacing + fit-to-box).
 */
export function ThemedMermaidDiagram({ source, title = "Diagram" }: Props) {
  const hostId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const { themeId } = useTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setFailed(false);
      try {
        const mermaid = (await import("mermaid")).default;
        const primary = readCssRgb("--accent-400", "#22d3ee");
        const secondary = readCssRgb("--accent-300", "#67e8f9");
        const line = readCssRgb("--surface-400", "#94a3b8");
        const text = readCssColor("--heading", "#ffffff");
        const mainBkg = readCssRgb("--surface-900", "#0f172a");
        const clusterBkg = readCssRgb("--surface-950", "#020617");

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: {
            darkMode: true,
            background: clusterBkg,
            primaryColor: mainBkg,
            primaryTextColor: text,
            primaryBorderColor: primary,
            secondaryColor: clusterBkg,
            secondaryTextColor: text,
            secondaryBorderColor: secondary,
            tertiaryColor: mainBkg,
            tertiaryTextColor: text,
            tertiaryBorderColor: line,
            lineColor: line,
            textColor: text,
            mainBkg,
            nodeBorder: primary,
            clusterBkg,
            titleColor: text,
            edgeLabelBackground: clusterBkg,
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: "11px",
          },
          flowchart: {
            curve: "basis",
            padding: 4,
            htmlLabels: false,
            nodeSpacing: 16,
            rankSpacing: 18,
            wrappingWidth: 96,
            useMaxWidth: true,
          },
        });

        const renderId = `mermaid-${hostId}-${Date.now()}`;
        const { svg } = await mermaid.render(renderId, source.trim());
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = svg;
        const svgEl = containerRef.current.querySelector("svg");
        if (svgEl) {
          svgEl.setAttribute("role", "img");
          svgEl.setAttribute("aria-label", title);
          svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
          svgEl.classList.add("theme-mermaid-diagram__svg");
          fitSvgToHost(svgEl, containerRef.current);
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hostId, source, themeId, title]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    const onResize = () => {
      const svgEl = host.querySelector("svg");
      if (svgEl) fitSvgToHost(svgEl, host);
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    ro?.observe(host);
    window.addEventListener("resize", onResize);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [themeId, source]);

  if (failed) {
    return (
      <pre className="theme-code-sample overflow-x-auto p-3 font-mono text-[11px] text-surface-300">
        {source.trim()}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className="theme-mermaid-diagram my-1 flex items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-surface-950/80 px-2 py-1.5 sm:px-3 sm:py-2"
    />
  );
}
