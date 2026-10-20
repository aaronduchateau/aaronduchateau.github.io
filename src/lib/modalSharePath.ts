import { PORTFOLIO_PATH } from "@/lib/routes";

/** Production origin. Open Graph images and URLs must be absolute for Facebook. */
export const SITE_ORIGIN = "https://aaronduchateau.github.io";

/** Static path prefix for a route modal. One HTML file per modal view. */
export const MODAL_SHARE_PREFIX = "/portfolio-launched/open/";

const LEGACY_PATH_SEP = "~";

export type ModalLocation = {
  namespace: string;
  key: string;
  /** Collection / recipe drill-down ids. */
  path: string[];
  /** Selected strip item, when the address bar includes one. */
  item: string | null;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function youtubeSectionNamespace(section: { id?: string; title: string }): string {
  return `yt-${section.id ?? slugify(section.title)}`;
}

export function projectSectionNamespace(section: { id?: string; title: string }): string {
  return `proj-${section.id ?? slugify(section.title)}`;
}

export function markdownSectionNamespace(section: { id?: string }): string {
  return section.id ? `md-${section.id}` : "md-article";
}

export function modalShareSegments(loc: ModalLocation): string[] {
  const segments = [loc.namespace, loc.key];
  if (loc.path.length > 0) segments.push("view", ...loc.path);
  if (loc.item) segments.push("item", loc.item);
  return segments;
}

/** Trailing-slash path Facebook can fetch as its own HTML file. */
export function modalSharePath(loc: ModalLocation): string {
  const encoded = modalShareSegments(loc).map((segment) => encodeURIComponent(segment));
  return `${MODAL_SHARE_PREFIX}${encoded.join("/")}/`;
}

export function absoluteAssetUrl(src: string | null | undefined, fallbackPath: string): string {
  const value = src && src.trim() ? src.trim() : fallbackPath;
  if (value.startsWith("https://") || value.startsWith("http://")) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${SITE_ORIGIN}${path}`;
}

export function youtubeThumb(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/** One-line plain text for `og:description` / the document description. */
export function summarize(text: string | null | undefined, max = 200): string {
  const plain = (text ?? "")
    .replace(/[`*_#]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function parseModalSharePath(pathname: string): ModalLocation | null {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  if (!normalized.startsWith(MODAL_SHARE_PREFIX)) return null;
  const rest = normalized.slice(MODAL_SHARE_PREFIX.length).replace(/\/$/, "");
  if (!rest) return null;
  const parts = rest.split("/").map(decodeSegment);
  if (parts.length < 2 || !parts[0] || !parts[1]) return null;

  const namespace = parts[0];
  const key = parts[1];
  const tail = parts.slice(2);
  const viewAt = tail.indexOf("view");
  const itemAt = tail.indexOf("item");
  const path =
    viewAt >= 0
      ? tail.slice(viewAt + 1, itemAt > viewAt ? itemAt : tail.length).filter(Boolean)
      : [];
  const item = itemAt >= 0 && tail[itemAt + 1] ? tail[itemAt + 1] : null;
  return { namespace, key, path, item };
}

export function parseLegacyModalSearch(params: URLSearchParams): ModalLocation | null {
  const modal = params.get("modal");
  if (!modal) return null;
  const splitAt = modal.indexOf(":");
  if (splitAt <= 0) return null;
  const pathValue = params.get("path");
  return {
    namespace: modal.slice(0, splitAt),
    key: modal.slice(splitAt + 1),
    path: pathValue ? pathValue.split(LEGACY_PATH_SEP).filter(Boolean) : [],
    item: params.get("item"),
  };
}

export function parseModalLocation(href: string): (ModalLocation & { play: boolean }) | null {
  const url = new URL(href, SITE_ORIGIN);
  const play = url.searchParams.get("play") === "1" || url.searchParams.get("play") === "true";
  const fromPath = parseModalSharePath(url.pathname);
  if (fromPath) return { ...fromPath, play };
  const legacy = parseLegacyModalSearch(url.searchParams);
  if (!legacy) return null;
  return { ...legacy, play };
}

export function portfolioHomePath(): string {
  return PORTFOLIO_PATH;
}
