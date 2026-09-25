/** Plain-text note shown in a small explainer modal (no media column). */
export type SimpleNoteModal = {
  id: string;
  eyebrow: string;
  title: string;
  /** Why this exists — first paragraph. */
  intro: string;
  /** What the thing is for (and what it is not). */
  intent: string;
  featuredHeading: string;
  featuredBody: string;
  quote: string;
};
