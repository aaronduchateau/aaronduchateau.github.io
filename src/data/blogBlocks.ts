/** Structured pieces a thesis can place between paragraphs. Charts and callouts stay data, not pasted HTML. */

export type BlogChartKind = "bars" | "split" | "stack" | "donut";

export type BlogChartPart = {
  label: string;
  value: number;
};

export type BlogChartItem = {
  label: string;
  value?: number;
  display?: string;
  text?: string;
  parts?: BlogChartPart[];
};

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "callout"; title?: string; text: string; tone?: "default" | "warning" }
  | { type: "columns"; items: { title: string; text: string }[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | { type: "steps"; items: string[] }
  | { type: "figure"; value: string; label?: string; note?: string }
  | {
      type: "chart";
      kind: BlogChartKind;
      title?: string;
      note?: string;
      max?: number;
      items: BlogChartItem[];
    };
