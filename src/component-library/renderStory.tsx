import {
  LibraryDemoBadge,
  LibraryGhostButton,
  LibraryIcons,
  LibraryOutlineButton,
  LibraryModalClose,
  LibraryNavControl,
  LibraryPageSection,
  LibraryModalFrame,
  LibraryPreview,
  LibraryPrimaryCta,
  LibrarySectionHeading,
  LibraryEducationCard,
  LibraryFullScreenQuote,
  LibraryCareerTimeline,
  LibraryLeaveSiteConfirm,
  LibraryQuestBoardCard,
  LibraryQuizPlayer,
  LibraryTestimonialCard,
  LibraryThemeCard,
} from "./primitives";
import type { LibraryPropMap } from "./types";

function flag(value: string | undefined): boolean {
  return value === "true";
}

export function renderLibraryStory(storyId: string, props: LibraryPropMap) {
  switch (storyId) {
    case "primary-cta":
      return (
        <LibraryPrimaryCta
          label={props.label ?? "Visit Site"}
          size={props.size ?? "md"}
          disabled={flag(props.disabled)}
          onClick={props.onClick}
        />
      );
    case "ghost-button":
      return (
        <LibraryGhostButton
          label={props.label ?? "Go back"}
          size={props.size ?? "md"}
          disabled={flag(props.disabled)}
          onClick={props.onClick}
        />
      );
    case "outline-button":
      return (
        <LibraryOutlineButton
          label={props.label ?? "Go back"}
          size={props.size ?? "md"}
          disabled={flag(props.disabled)}
          onClick={props.onClick}
        />
      );
    case "nav-control":
      return <LibraryNavControl label={props.label ?? "Options"} onClick={props.onClick} />;
    case "theme-card":
      return (
        <LibraryThemeCard
          title={props.title ?? ""}
          excerpt={props.excerpt ?? ""}
          cover={props.cover ?? "null"}
          cta={props.cta ?? "Open demo"}
          date={props.date}
          onClick={props.onClick}
        />
      );
    case "education-card":
      return (
        <LibraryEducationCard
          years={props.years ?? "2003 — 2008"}
          degree={props.degree ?? "B.S. Digital Arts"}
          school={props.school ?? "University of Oregon"}
          detail={
            props.detail ??
            "Focused on interactive design, installation work with microprocessors, and UI/UX foundations that informed later web product work."
          }
          splash={props.splash ?? "#7c2d12|#f97316"}
        />
      );
    case "testimonial-card":
      return (
        <LibraryTestimonialCard
          name={props.name ?? "Mimi Dollah"}
          title={props.title ?? "Director of QA · Elm Street Technology"}
          quote={props.quote ?? ""}
          photo={props.photo ?? "/photos/testimonials/Aaron_DuChateau_mimi.png"}
          onClick={props.onClick}
        />
      );
    case "full-screen-quote":
      return (
        <LibraryFullScreenQuote
          quote={props.quote ?? ""}
          attribution={props.attribution ?? ""}
          photo={props.photo ?? ""}
          photoAlt={props.photoAlt}
        />
      );
    case "career-timeline":
      return (
        <LibraryCareerTimeline
          items={props.items ?? "[]"}
          activeIndex={props.activeIndex ?? "0"}
          paused={props.paused ?? "true"}
        />
      );
    case "leave-site-confirm":
      return (
        <LibraryLeaveSiteConfirm
          company={props.company ?? ""}
          location={props.location ?? ""}
          window={props.window ?? ""}
          role={props.role ?? ""}
          bullets={props.bullets ?? "[]"}
          photo={props.photo ?? ""}
          href={props.href ?? ""}
          armed={props.armed ?? "false"}
        />
      );
    case "quiz-player":
      return (
        <LibraryQuizPlayer
          quiz={props.quiz ?? ""}
          alreadyUnlocked={props.alreadyUnlocked ?? "false"}
          onBack={props.onBack}
        />
      );
    case "quest-board-card":
      return (
        <LibraryQuestBoardCard
          title={props.title ?? ""}
          bounty={props.bounty ?? ""}
          complete={props.complete ?? "false"}
          unlockItems={props.unlockItems ?? "[]"}
          card={props.card ?? ""}
          onClick={props.onClick}
        />
      );
    case "modal-close":
      return (
        <LibraryModalClose
          size={props.size === "sm" || props.size === "lg" ? props.size : "md"}
          onClick={props.onClick}
        />
      );
    case "section-heading":
      return (
        <LibrarySectionHeading
          eyebrow={props.eyebrow ?? "Interactive tools"}
          title={props.title ?? "Interactive things"}
        />
      );
    case "page-section":
      return (
        <LibraryPageSection
          divider={props.divider ?? "bottom"}
          padding={props.padding ?? "lg"}
        />
      );
    case "modal-frame":
      return (
        <LibraryModalFrame chrome={props.chrome ?? "confirm"} onClose={props.onClose} />
      );
    case "demo-badge":
      return <LibraryDemoBadge size={props.size === "list" ? "list" : "card"} />;
    case "icons":
      return <LibraryIcons size={props.size ?? "md"} />;
    case "preview":
      return (
        <LibraryPreview
          label={props.label ?? "Device size"}
          size={props.size ?? "phone"}
          onNatural={props.onNatural}
          onFullscreen={props.onFullscreen}
          onTablet={props.onTablet}
          onPhone={props.onPhone}
        />
      );
    default:
      return (
        <p className="text-sm text-surface-400">Unknown component: {storyId}</p>
      );
  }
}
