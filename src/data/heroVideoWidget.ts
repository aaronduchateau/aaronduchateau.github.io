import {
  HERO_LEARN_MODAL_NAMESPACE,
  HERO_LEARN_PLACEHOLDER_KEY,
  TESTIMONIALS_MODAL_NAMESPACE,
} from "@/data/content";

/** Hero right-rail video widget — YouTube + time-triggered CTA cues. */

export type HeroLearnMoreTarget =
  | { kind: "modal"; namespace: string; key: string }
  /** Scroll to #work, select a career timeline employer, pause auto-advance. */
  | { kind: "career-timeline"; workHistoryId: string };

export type HeroVideoCue = {
  /** Video time (seconds) when this cue becomes active. */
  triggerTime: number;
  title: string;
  description: string;
  /**
   * Learn more destination.
   * First/last cues and non-interactive mode force Brunson Moody in the widget.
   */
  learnMore: HeroLearnMoreTarget;
};

export type HeroVideoVariantId = "interactive" | "nonInteractive";

export const HERO_INTRO_VIDEO_ACTIVITY_PREFIX = "hero-intro:";

/** Activity `contentId` for a completed hero intro cut (rules-engine fact source). */
export function heroIntroVideoContentId(variantId: HeroVideoVariantId): string {
  return `${HERO_INTRO_VIDEO_ACTIVITY_PREFIX}${variantId}`;
}

export function isHeroIntroVideoContentId(contentId: string): boolean {
  return contentId.startsWith(HERO_INTRO_VIDEO_ACTIVITY_PREFIX);
}

export type HeroVideoVariant = {
  id: HeroVideoVariantId;
  youtubeId: string;
  label: string;
  description: string;
};

const brunsonMoodyModal = {
  kind: "modal" as const,
  namespace: TESTIMONIALS_MODAL_NAMESPACE,
  key: "brunson-moody",
};

const heroLearn = (key: string): HeroLearnMoreTarget => ({
  kind: "modal",
  namespace: HERO_LEARN_MODAL_NAMESPACE,
  key,
});

const routeModal = (namespace: string, key: string): HeroLearnMoreTarget => ({
  kind: "modal",
  namespace,
  key,
});

const placeholderModal = heroLearn(HERO_LEARN_PLACEHOLDER_KEY);

/** Hackathons section → Nearcon contribution modal. */
const nearconModal = routeModal("proj-hackathons", "nearcon-core-prototype-engineer");

/** Older Video Showcase → ShareFile order portal. */
const shareFilePortalModal = routeModal("yt-older-videos", "8atginpr5ps");

/** Career timeline → Palo Alto Software (LivePlan / Outpost). */
const paloAltoTimeline: HeroLearnMoreTarget = {
  kind: "career-timeline",
  workHistoryId: "4",
};

const testimonialsCue = {
  title: "Testimonials",
  description: "Some buddies from my professional network that gave me a thumbs up",
  learnMore: brunsonMoodyModal,
} as const;

export const heroVideoWidget = {
  /** Crest poster behind the play / chooser overlays. */
  posterSrc: "/photos/Aaron_DuChateau_hero-video-poster.png",
  /** Inline paused (not fullscreen, not mode chooser) — 16:9 still under the play button. */
  pausedPosterSrc: "/archive/v1/img/outpost.png",
  /** Scrubbing earlier than this returns the selection overlay. */
  introHiddenSeconds: 4,
  /** Loading cover begins fading out at this playhead time (video + audio keep running). */
  coverFadeStartSeconds: 4.1,
  /** Seconds from fade start until the cover is fully gone. */
  coverFadeDurationSeconds: 0.75,
  variants: [
    {
      id: "interactive",
      youtubeId: "HhmoD29vUgg",
      label: "Interactive",
      description: "An experience you can interact with",
    },
    {
      id: "nonInteractive",
      youtubeId: "EKVIPiDmhN8",
      label: "Non-interactive",
      description: "The straight cut of the portfolio trailer",
    },
  ] satisfies HeroVideoVariant[],
  /** Sorted by `triggerTime` ascending — widget picks the latest cue at or before playhead. */
  cues: [
    {
      triggerTime: 0,
      ...testimonialsCue,
    },
    {
      triggerTime: 14.18,
      title: "LotHoppers",
      description:
        "A dealership platform focused on inventory management and vehicle merchandising. Built with an emphasis on performance and a streamlined user experience.",
      // Featured work: Advanced search & mapping (LotHoppers)
      learnMore: heroLearn("work-vvxlxbaitge"),
    },
    {
      triggerTime: 18.88,
      title: "SpaceRanchDAO",
      description:
        "A Web3 project exploring decentralized governance and community ownership. It demonstrates modern blockchain-based application design.",
      learnMore: nearconModal,
    },
    {
      triggerTime: 26.68,
      title: "LivePlan",
      description:
        "A business planning application that helps entrepreneurs organize and forecast their ideas. The interface simplifies complex planning workflows.",
      learnMore: paloAltoTimeline,
    },
    {
      triggerTime: 33.18,
      title: "DealBrewer",
      description:
        "A CRM-inspired platform for managing leads and sales opportunities. It focuses on efficiency, organization, and intuitive workflows.",
      // Archive: Deal Brewer POC
      learnMore: heroLearn("work-w5a0tpo6bou"),
    },
    {
      triggerTime: 39.48,
      title: "Outpost",
      description:
        "A collaborative workspace designed to improve communication and project visibility. The experience emphasizes clean design and productivity.",
      learnMore: paloAltoTimeline,
    },
    {
      triggerTime: 44.68,
      title: "LegalGPS",
      description:
        "A legal workflow platform that guides users through complex processes. It prioritizes clarity, accessibility, and organization.",
      // Archive: Legal GPS product demo reel
      learnMore: heroLearn("work-cpbseuddjeq"),
    },
    {
      triggerTime: 50.88,
      title: "Connected Lane County",
      description:
        "A community resource platform connecting residents with local services and information. The application focuses on accessibility and public engagement.",
      learnMore: placeholderModal,
    },
    {
      triggerTime: 54.88,
      title: "StockBOSSup",
      description:
        "A financial application for exploring market data and stock insights. It presents complex information through an approachable interface.",
      learnMore: placeholderModal,
    },
    {
      triggerTime: 61.68,
      title: "Coast2Coast Management",
      description:
        "A management solution supporting distributed teams and business operations. Built to improve organization and operational efficiency.",
      learnMore: shareFilePortalModal,
    },
    {
      triggerTime: 65.18,
      title: "MenuViolet MVP",
      description:
        "An accessibility application that uses OCR to make restaurant menus easier to read. It was designed to improve the dining experience for users with visual impairments.",
      // Video showcase: MenuViolet MVP
      learnMore: heroLearn("work-45dzo3peo2k"),
    },
    {
      triggerTime: 72.78,
      title: "Elmstreet - MLS fed Consumer sites",
      description:
        "A real estate feature integrating MLS data into customer-facing experiences. It delivers responsive interfaces backed by robust property data.",
      // Featured work: MLS property search
      learnMore: heroLearn("work-7k2bict15gc"),
    },
    {
      triggerTime: 78.58,
      title: "Elmstreet - Theme Administration",
      description:
        "A flexible site theming system supporting extensive branding customization. It balances developer flexibility with ease of use for clients.",
      // Featured work: MLS property search
      learnMore: heroLearn("work-7k2bict15gc"),
    },
    {
      triggerTime: 87.58,
      title: "Elmstreet - Virtual Staging",
      description:
        "A virtual staging solution that enhances property photography with digitally furnished interiors. It showcases modern imaging techniques for real estate marketing.",
      // Featured work: AI Redesign
      learnMore: heroLearn("work-dqpqfhk-8k"),
    },
    {
      triggerTime: 90.28,
      ...testimonialsCue,
    },
  ] satisfies HeroVideoCue[],
};

/** Index of the latest cue whose `triggerTime` is at or before `timeSeconds`. */
export function cueIndexForTime(timeSeconds: number): number {
  const { cues } = heroVideoWidget;
  let index = 0;
  for (let i = 0; i < cues.length; i++) {
    if (cues[i].triggerTime <= timeSeconds) index = i;
    else break;
  }
  return index;
}

/** Latest cue whose `triggerTime` is at or before `timeSeconds`. */
export function cueForTime(timeSeconds: number): HeroVideoCue {
  return heroVideoWidget.cues[cueIndexForTime(timeSeconds)];
}

/**
 * Progress (0–1) through the active cue’s breakpoint window, left → right.
 * `null` on the first/last cues (no timer line).
 */
export function cueSegmentProgress(timeSeconds: number): number | null {
  const { cues } = heroVideoWidget;
  const index = cueIndexForTime(timeSeconds);
  if (index <= 0 || index >= cues.length - 1) return null;

  const start = cues[index].triggerTime;
  const end = cues[index + 1].triggerTime;
  const span = end - start;
  if (!(span > 0)) return 1;
  return Math.min(1, Math.max(0, (timeSeconds - start) / span));
}

/** Brunson Moody when first/last cue or non-interactive; otherwise the cue’s Learn more target. */
export function resolveHeroLearnMore(
  cue: HeroVideoCue,
  opts: { cueIndex: number; isNonInteractive: boolean },
): HeroLearnMoreTarget {
  const { cues } = heroVideoWidget;
  const isBookend = opts.cueIndex <= 0 || opts.cueIndex >= cues.length - 1;
  if (opts.isNonInteractive || isBookend) return brunsonMoodyModal;
  return cue.learnMore;
}
