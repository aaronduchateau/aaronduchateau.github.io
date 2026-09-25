type ExternalLink = { href: string; label: string };

/** Shared optional fields on every modal media item (JSON / content config). */
type MediaModalItemFlags = {
  /**
   * When true: item stays selectable, the photo is veiled (`.theme-media-locked`),
   * video playback is blocked, and external links (e.g. Watch on YouTube) are disabled.
   * Prefer `gatedByFeature` so a milestone prize can unlock it.
   */
  locked?: boolean;
  /** Prize `featureId` — locked until `resolveGrantedPrizes().featureIds` contains this id. */
  gatedByFeature?: string;
};

export type MediaModalVideoItem = MediaModalItemFlags & {
  type: "video";
  id: string;
  youtubeId: string;
  startSeconds?: number;
  intro?: string;
  detail?: string;
  externalLink?: ExternalLink;
};

export type MediaModalPhotoItem = MediaModalItemFlags & {
  type: "photo";
  id: string;
  src: string;
  alt: string;
  intro?: string;
  detail?: string;
  externalLink?: ExternalLink;
};

export type MediaModalSlideRevealItem = MediaModalItemFlags & {
  type: "slideReveal";
  id: string;
  before: { src: string; alt: string };
  after: { src: string; alt: string };
  intro: string;
  detail?: string;
  externalLink?: ExternalLink;
};

export type MediaModalTestimonialItem = MediaModalItemFlags & {
  type: "testimonial";
  id: string;
  quote: string;
  attribution: string;
  org?: string;
  photoSrc?: string;
  intro?: string;
  detail?: string;
  externalLink?: ExternalLink;
};

/**
 * A collection groups other items (of any type, including nested collections)
 * behind a single primary graphic in the normal modal flow. Selecting it in the
 * strip only focuses the cover; the Open control drills into nested items.
 */
export type MediaModalCollectionItem = MediaModalItemFlags & {
  type: "collection";
  id: string;
  title: string;
  /**
   * Label after “Open …” on the collection cover CTA.
   * Defaults to `title` when omitted.
   */
  openLabel?: string;
  /**
   * Fallback cover when the modal-structure policy does not derive cover from
   * the final photo (see `src/modal-structure`).
   */
  cover: { src: string; alt?: string };
  contextLabel?: string;
  intro?: string;
  detail?: string;
  items: MediaModalItem[];
  externalLink?: ExternalLink;
};

export type MediaModalItem =
  | MediaModalVideoItem
  | MediaModalPhotoItem
  | MediaModalSlideRevealItem
  | MediaModalTestimonialItem
  | MediaModalCollectionItem;

export type MediaModalEnterSplash = {
  message: string;
  /** Defaults to "Continue". */
  continueLabel?: string;
};

export type MediaModalConfig = {
  title: string;
  date: string;
  intro: string;
  detail?: string;
  /** Bold lead above the long explanation (e.g. a framing note). */
  detailLead?: string;
  contextLabel: string;
  media: MediaModalItem[];
  externalLink?: ExternalLink;
  /** Optional gate before modal content (archive disclaimers, etc.) — content-driven. */
  enterSplash?: MediaModalEnterSplash;
  /**
   * Modal-structure fact for json-rules-engine (`src/modal-structure`).
   * e.g. `"repairs"` enables final-photo cover + badge + first-slide entry.
   */
  structureId?: string;
};
