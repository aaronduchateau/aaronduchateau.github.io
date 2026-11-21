import raw from "../../public/blog/posts.json";
import { BLOG_PATH } from "@/lib/routes";

/**
 * Blog content lives in `public/blog/posts.json`.
 * Images live in `public/blog/images/`.
 *
 * A post URL is `/blog/YYYY/MM/DD/<slug>/`.
 * `titleImage` is optional. Omit it, or set it to null, when a post has no title photo.
 * `youtubeId` is optional. When set, the post embeds that video. With no title photo, the
 * index card and the share image use the video thumbnail.
 * Author name, date, and author portrait render on every post.
 */

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
  /** Calendar date, `YYYY-MM-DD`. This is the date segment of the URL. */
  date: string;
  description: string;
  titleImage: string | null;
  titleImageAlt: string;
  titleImageWidth: number;
  titleImageHeight: number;
  body: string;
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
    date: string;
    description: string;
    titleImage?: string | null;
    titleImageAlt?: string;
    titleImageWidth?: number;
    titleImageHeight?: number;
    body: string;
    references?: Array<{ label?: string; href?: string }> | null;
    youtubeId?: string | null;
  }>;
};

const YOUTUBE_ID_RE = /^[A-Za-z0-9_-]{11}$/;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`public/blog/posts.json: ${message}`);
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
    assert(DATE_RE.test(post.date ?? ""), `${where} date must be YYYY-MM-DD`);
    const [year, month, day] = post.date.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    assert(
      parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day,
      `${where} date is not a real calendar day`,
    );
    assert(post.description?.trim(), `${where} description is required`);
    assert(post.body?.trim(), `${where} body is required`);

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

    const path = `${post.date}/${post.slug}`;
    assert(!seen.has(path), `${where} repeats ${path}`);
    seen.add(path);

    return {
      title: post.title.trim(),
      slug: post.slug,
      date: post.date,
      description: post.description.trim(),
      titleImage,
      titleImageAlt: post.titleImageAlt?.trim() || post.title.trim(),
      titleImageWidth: titleImage ? post.titleImageWidth! : 0,
      titleImageHeight: titleImage ? post.titleImageHeight! : 0,
      body: post.body.trim(),
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

/** `/blog/YYYY/MM/DD/<slug>/` */
export function blogPostPath(post: Pick<BlogPost, "date" | "slug">): string {
  const [year, month, day] = post.date.split("-");
  return `${BLOG_PATH}${year}/${month}/${day}/${post.slug}/`;
}

export function findBlogPost(parts: {
  year: string;
  month: string;
  day: string;
  slug: string;
}): BlogPost | null {
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  return blogPosts.find((post) => post.date === date && post.slug === parts.slug) ?? null;
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
