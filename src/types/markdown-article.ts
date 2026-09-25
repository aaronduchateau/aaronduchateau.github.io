export type MarkdownArticleModalConfig = {
  title: string;
  date: string;
  contextLabel: string;
  /** Short lead under the title (plain text). */
  intro: string;
  /** Full process write-up (markdown). */
  markdown: string;
};

export type MarkdownArticleCard = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  modal: MarkdownArticleModalConfig;
};

export type MarkdownArticleSectionConfig = {
  id?: string;
  eyebrow: string;
  title: string;
  description: string;
  cards: readonly MarkdownArticleCard[];
};
