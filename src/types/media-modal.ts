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

/**
 * A recipe is a cover in the normal strip (like a collection) with a
 * “View recipe” CTA. Entering it replaces the media column with a dedicated
 * recipe layout — no bottom thumbnail strip; extra photos live in thumbs on
 * the hero photo. Usable at the root of any MediaModal or nested in a collection.
 */
export type MediaModalRecipePhoto = {
  src: string;
  alt?: string;
};

export type MediaModalRecipeItem = MediaModalItemFlags & {
  type: "recipe";
  id: string;
  title: string;
  /**
   * Label after “View …” on the cover CTA.
   * Defaults to `"recipe"` → “View recipe”.
   */
  openLabel?: string;
  cover: { src: string; alt?: string };
  /** One sentence under the title in recipe mode. */
  subtitle: string;
  /** Longer copy beside the photo in recipe mode. */
  description: string;
  ingredients: string[];
  steps: string[];
  /** Gallery inside recipe mode (first photo is the default hero). */
  photos: MediaModalRecipePhoto[];
  contextLabel?: string;
  intro?: string;
  detail?: string;
  externalLink?: ExternalLink;
};

export type MediaModalItem =
  | MediaModalVideoItem
  | MediaModalPhotoItem
  | MediaModalSlideRevealItem
  | MediaModalTestimonialItem
  | MediaModalCollectionItem
  | MediaModalRecipeItem;

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
