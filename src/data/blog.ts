import raw from "../../public/blog/posts.json";
import aiDoc from "../../public/blog/documents/ai-infrastructure-misallocation.json";
import emDoc from "../../public/blog/documents/emerging-markets-rotation.json";
import type { BlogBlock, BlogChartKind } from "@/data/blogBlocks";
import { BLOG_PATH } from "@/lib/routes";

/**
 * Blog content lives in `public/blog/posts.json`.
 * Long pieces can point at a document in `public/blog/documents/`.
 * Images live in `public/blog/images/`.
 *
 * A post URL is `/blog/<category>/YYYY/MM/DD/<slug>/`.
 * `titleImage` is optional. Omit it, or set it to null, when a post has no title photo.
 * `youtubeId` is optional. When set, the post embeds that video. With no title photo, the
 * index card and the share image use the video thumbnail.
 * Author name, date, and author portrait render on every post.
 * A thesis ends with the shared human / entertainment note.
 */

const documents: Record<string, { blocks: unknown[] }> = {
  "ai-infrastructure-misallocation": aiDoc as { blocks: unknown[] },
  "emerging-markets-rotation": emDoc as { blocks: unknown[] },
};

export type BlogAuthor = {
  name: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export type BlogShareImage = {
  url: string;
  alt: string;
  width: number;
  height: number;
};

export type BlogReference = {
  label: string;
  href: string;
};

export type BlogPost = {
  title: string;
  slug: string;
  /** URL segment, lowercase. Example: `investing`. */
  category: string;
  /** Calendar date, `YYYY-MM-DD`. This is the date segment of the URL. */
  date: string;
  description: string;
  titleImage: string | null;
  titleImageAlt: string;
  titleImageWidth: number;
  titleImageHeight: number;
  body: string;
  blocks: BlogBlock[];
  /** Theses get the shared human / entertainment close. */
  thesis: boolean;
  /** Optional links shown under a small "References and Resources" label. */
  references: BlogReference[];
  /** YouTube video id, when the post’s main media is a video. */
  youtubeId: string | null;
};

type RawFile = {
  author: BlogAuthor;
  posts: Array<{
    title: string;
    slug: string;
    category: string;
    date: string;
    description: string;
    document?: string | null;
    thesis?: boolean;
    titleImage?: string | null;
    titleImageAlt?: string;
    titleImageWidth?: number;
    titleImageHeight?: number;
    body?: string;
    references?: Array<{ label?: string; href?: string }> | null;
    youtubeId?: string | null;
  }>;
};

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CHART_KINDS = new Set<BlogChartKind>(["bars", "split", "stack", "donut"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`public/blog/posts.json: ${message}`);
}

function textField(value: unknown, where: string): string {
  assert(typeof value === "string" && value.trim(), `${where} is required`);
  return value.trim();
}

function optionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberField(value: unknown, where: string): number {
  assert(typeof value === "number" && Number.isFinite(value), `${where} must be a number`);
  return value;
}

function parseBlocks(value: unknown, where: string): BlogBlock[] {
  assert(Array.isArray(value) && value.length > 0, `${where} must be a non-empty array`);
  return value.map((entry, index) => {
    const at = `${where}[${index}]`;
    assert(entry && typeof entry === "object", `${at} must be an object`);
    const block = entry as Record<string, unknown>;
    const type = block.type;
    if (type === "p" || type === "h2" || type === "h3" || type === "quote") {
      return { type, text: textField(block.text, `${at} text`) };
    }
    if (type === "callout") {
      const tone = block.tone === "warning" ? "warning" : "default";
      return { type, title: optionalText(block.title), text: textField(block.text, `${at} text`), tone };
    }
    if (type === "columns") {
      assert(Array.isArray(block.items) && block.items.length > 0, `${at} items are required`);
      return {
        type,
        items: block.items.map((item, itemIndex) => {
          const row = item as Record<string, unknown>;
          return {
            title: textField(row.title, `${at} items[${itemIndex}] title`),
            text: textField(row.text, `${at} items[${itemIndex}] text`),
          };
        }),
      };
    }
    if (type === "table") {
      assert(Array.isArray(block.headers) && block.headers.length > 0, `${at} headers are required`);
      assert(Array.isArray(block.rows) && block.rows.length > 0, `${at} rows are required`);
      const headers = block.headers.map((header, headerIndex) =>
        textField(header, `${at} headers[${headerIndex}]`),
      );
      return {
        type,
        caption: optionalText(block.caption),
        headers,
        rows: block.rows.map((row, rowIndex) => {
          assert(Array.isArray(row) && row.length === headers.length, `${at} rows[${rowIndex}] width`);
          return row.map((cell, cellIndex) => textField(cell, `${at} rows[${rowIndex}][${cellIndex}]`));
        }),
      };
    }
    if (type === "steps") {
      assert(Array.isArray(block.items) && block.items.length > 0, `${at} items are required`);
      return { type, items: block.items.map((item, itemIndex) => textField(item, `${at} items[${itemIndex}]`)) };
    }
    if (type === "figure") {
      return {
        type,
        value: textField(block.value, `${at} value`),
        label: optionalText(block.label),
        note: optionalText(block.note),
      };
    }
    if (type === "chart") {
      assert(typeof block.kind === "string" && CHART_KINDS.has(block.kind as BlogChartKind), `${at} kind`);
      assert(Array.isArray(block.items) && block.items.length > 0, `${at} items are required`);
      return {
        type,
        kind: block.kind as BlogChartKind,
        title: optionalText(block.title),
        note: optionalText(block.note),
        max: block.max === undefined ? undefined : numberField(block.max, `${at} max`),
        items: block.items.map((item, itemIndex) => {
          const row = item as Record<string, unknown>;
          const parts = Array.isArray(row.parts)
            ? row.parts.map((part, partIndex) => {
                const piece = part as Record<string, unknown>;
                return {
                  label: textField(piece.label, `${at} items[${itemIndex}] parts[${partIndex}] label`),
                  value: numberField(piece.value, `${at} items[${itemIndex}] parts[${partIndex}] value`),
                };
              })
            : undefined;
          return {
            label: textField(row.label, `${at} items[${itemIndex}] label`),
            value: row.value === undefined ? undefined : numberField(row.value, `${at} items[${itemIndex}] value`),
            display: optionalText(row.display),
            text: optionalText(row.text),
            parts,
          };
        }),
      };
    }
    throw new Error(`public/blog/posts.json: ${at} has an unknown type`);
  });
}

function loadBlog(file: RawFile): { author: BlogAuthor; posts: BlogPost[] } {
  assert(file.author?.name?.trim(), "author.name is required");
  assert(file.author.image?.startsWith("/"), "author.image must be a site path");
  assert(file.author.imageWidth > 0 && file.author.imageHeight > 0, "author image dimensions are required");

  const seen = new Set<string>();
  const posts = file.posts.map((post, index) => {
    const where = `posts[${index}]`;
    assert(post.title?.trim(), `${where} title is required`);
    assert(SLUG_RE.test(post.slug ?? ""), `${where} slug must be lowercase words separated by hyphens`);
    assert(SLUG_RE.test(post.category ?? ""), `${where} category must be lowercase words separated by hyphens`);
    assert(DATE_RE.test(post.date ?? ""), `${where} date must be YYYY-MM-DD`);
    const [year, month, day] = post.date.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    assert(
      parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day,
      `${where} date is not a real calendar day`,
    );
    assert(post.description?.trim(), `${where} description is required`);
    const body = post.body?.trim() ?? "";
    const documentId = post.document?.trim() || null;
    const blocks = documentId ? parseBlocks(documents[documentId]?.blocks, `${where} document ${documentId}`) : [];
    assert(body || blocks.length > 0, `${where} needs a body or a document`);

    const titleImage = post.titleImage?.trim() ? post.titleImage.trim() : null;
    if (titleImage) {
      assert(titleImage.startsWith("/"), `${where} titleImage must be a site path`);
      assert(
        (post.titleImageWidth ?? 0) > 0 && (post.titleImageHeight ?? 0) > 0,
        `${where} titleImageWidth and titleImageHeight are required when titleImage is set`,
      );
    }

    const youtubeId = post.youtubeId?.trim() ? post.youtubeId.trim() : null;
    if (youtubeId) {
      assert(YOUTUBE_ID_RE.test(youtubeId), `${where} youtubeId must be an 11-character YouTube id`);
    }

    const references = (post.references ?? []).map((item, refIndex) => {
      const label = item.label?.trim() ?? "";
      const href = item.href?.trim() ?? "";
      assert(label, `${where} references[${refIndex}] label is required`);
      assert(/^https?:\/\//.test(href), `${where} references[${refIndex}] href must be an http(s) URL`);
      return { label, href };
    });

    const path = `${post.category}/${post.date}/${post.slug}`;
    assert(!seen.has(path), `${where} repeats ${path}`);
    seen.add(path);

    return {
      title: post.title.trim(),
      slug: post.slug,
      category: post.category,
      date: post.date,
      description: post.description.trim(),
      titleImage,
      titleImageAlt: post.titleImageAlt?.trim() || post.title.trim(),
      titleImageWidth: titleImage ? post.titleImageWidth! : 0,
      titleImageHeight: titleImage ? post.titleImageHeight! : 0,
      body,
      blocks,
      thesis: post.thesis === true,
      references,
      youtubeId,
    } satisfies BlogPost;
  });

  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return { author: file.author, posts };
}

const loaded = loadBlog(raw as RawFile);

export const blogAuthor: BlogAuthor = loaded.author;
export const blogPosts: readonly BlogPost[] = loaded.posts;

export function formatBlogDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatBlogCategory(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** `/blog/<category>/YYYY/MM/DD/<slug>/` */
export function blogPostPath(post: Pick<BlogPost, "category" | "date" | "slug">): string {
  const [year, month, day] = post.date.split("-");
  return `${BLOG_PATH}${post.category}/${year}/${month}/${day}/${post.slug}/`;
}

export function findBlogPost(parts: {
  category: string;
  year: string;
  month: string;
  day: string;
  slug: string;
}): BlogPost | null {
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return (
    blogPosts.find(
      (post) => post.category === parts.category && post.date === date && post.slug === parts.slug,
    ) ?? null
  );
}

/** Public thumbnail for a YouTube id. `hqdefault` exists even when a max-res still does not. */
export function youtubeThumbnail(videoId: string, alt: string): BlogShareImage {
  return {
    url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    alt,
    width: 480,
    height: 360,
  };
}

/** Title photo when the post has one. A video post without one uses the thumbnail. Otherwise the author portrait. */
export function blogShareImage(post: BlogPost): BlogShareImage {
  if (post.titleImage) {
    return {
      url: post.titleImage,
      alt: post.titleImageAlt,
      width: post.titleImageWidth,
      height: post.titleImageHeight,
    };
  }
  if (post.youtubeId) return youtubeThumbnail(post.youtubeId, post.title);
  return {
    url: blogAuthor.image,
    alt: blogAuthor.imageAlt,
    width: blogAuthor.imageWidth,
    height: blogAuthor.imageHeight,
  };
}
