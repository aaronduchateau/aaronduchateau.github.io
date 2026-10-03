export type LibraryControlOption = {
  value: string;
  label: string;
};

export type LibraryControl = {
  key: string;
  label: string;
  type: "radio" | "select";
  options: readonly LibraryControlOption[];
  defaultValue: string;
};

export type LibraryKind = "simple" | "advanced";

export type LibraryStoryId =
  | "primary-cta"
  | "ghost-button"
  | "outline-button"
  | "nav-control"
  | "theme-card"
  | "education-card"
  | "testimonial-card"
  | "full-screen-quote"
  | "compare-slider"
  | "career-timeline"
  | "leave-site-confirm"
  | "quiz-player"
  | "quest-board-card"
  | "modal-close"
  | "section-heading"
  | "page-section"
  | "modal-frame"
  | "demo-badge"
  | "preview"
  | "icons";

export type LibraryStory = {
  id: LibraryStoryId;
  kind: LibraryKind;
  name: string;
  summary: string;
  controls: readonly LibraryControl[];
};

export const LIBRARY_KINDS: readonly {
  id: LibraryKind;
  label: "Simple" | "Advanced";
  blurb: string;
}[] = [
  {
    id: "advanced",
    label: "Advanced",
    blurb: "Composed surfaces — cards, quizzes, and board rows that assemble the same modules the site uses.",
  },
  {
    id: "simple",
    label: "Simple",
    blurb: "Presentational pieces — a button, heading, badge, or icon that takes props and paints itself.",
  },
];

export type LibraryPropMap = Record<string, string>;
