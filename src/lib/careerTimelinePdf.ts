import { jsPDF } from "jspdf";
import { person, workHistory } from "@/data/content";

const MARGIN_X = 54; // ~0.75"
const MARGIN_TOP = 54;
const MARGIN_BOTTOM = 54;
const PAGE_WIDTH = 612; // US Letter pt
const PAGE_HEIGHT = 792;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;

function wrapLines(doc: jsPDF, text: string, fontSize: number, maxWidth: number): string[] {
  doc.setFontSize(fontSize);
  return doc.splitTextToSize(text, maxWidth) as string[];
}

/**
 * Build a clean black-and-white career timeline PDF from the same
 * `workHistory` content shown in the expand modal (client-side only).
 */
export function buildCareerTimelinePdf(): jsPDF {
  const doc = new jsPDF({
    unit: "pt",
    format: "letter",
    compress: true,
  });

  let y = MARGIN_TOP;

  const ensureSpace = (needed: number) => {
    if (y + needed <= PAGE_HEIGHT - MARGIN_BOTTOM) return;
    doc.addPage();
    y = MARGIN_TOP;
  };

  // Header
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(person.name, MARGIN_X, y);
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(person.title, MARGIN_X, y);
  y += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Career timeline", MARGIN_X, y);
  y += 8;

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.75);
  doc.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
  y += 18;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text("Newest roles first. Generated from portfolio work history.", MARGIN_X, y);
  y += 22;

  workHistory.forEach((item, index) => {
    const roleLines = wrapLines(doc, item.role, 12, CONTENT_WIDTH);
    const employerLines = wrapLines(doc, item.employer, 10, CONTENT_WIDTH);
    const summaryLines = wrapLines(doc, item.summary, 10, CONTENT_WIDTH);
    const blockHeight =
      roleLines.length * 14 + 12 + employerLines.length * 12 + 6 + summaryLines.length * 13 + 20;

    ensureSpace(blockHeight);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(roleLines, MARGIN_X, y);
    y += roleLines.length * 14;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(70, 70, 70);
    doc.text(item.period, MARGIN_X, y);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(20, 20, 20);
    doc.text(employerLines, MARGIN_X, y);
    y += employerLines.length * 12 + 4;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(summaryLines, MARGIN_X, y);
    y += summaryLines.length * 13 + 10;

    if (index < workHistory.length - 1) {
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.4);
      doc.line(MARGIN_X, y, PAGE_WIDTH - MARGIN_X, y);
      y += 14;
    }
  });

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `${person.name} · Career timeline · ${i} / ${pageCount}`,
      MARGIN_X,
      PAGE_HEIGHT - 28,
    );
  }

  return doc;
}

export function downloadCareerTimelinePdf(): void {
  const doc = buildCareerTimelinePdf();
  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`aaron-duchateau-career-timeline-${stamp}.pdf`);
}

/** Print the generated B&W PDF via a hidden iframe — never triggers a file download. */
export function printCareerTimelinePdf(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const doc = buildCareerTimelinePdf();
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Career timeline print");
  iframe.style.cssText =
    "position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;";
  iframe.src = url;
  document.body.appendChild(iframe);

  let cleaned = false;
  let printed = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    iframe.remove();
    URL.revokeObjectURL(url);
  };

  const triggerPrint = () => {
    if (printed) return;
    printed = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      /* print UI unavailable — do not fall back to download */
    }
    // Delay cleanup so the print dialog can finish loading the PDF.
    window.setTimeout(cleanup, 60_000);
  };

  iframe.addEventListener("load", () => {
    window.setTimeout(triggerPrint, 250);
  });

  // Fallback if `load` never fires for application/pdf iframes.
  window.setTimeout(triggerPrint, 1_200);
}
