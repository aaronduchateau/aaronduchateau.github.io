"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { LeaveSiteConfirm } from "@/components/LeaveSiteConfirm";
import { MajorProjectCardBody, PageSection, SectionHeading } from "@/components/ui";
import { MediaModal } from "@/components/MediaModal";
import { MobileContentList } from "@/components/MobileContentList";
import { trackAttrs } from "@/activity/trackAttrs";
import { recordActivity } from "@/activity/tracker";
import type { ContributionProject, ContributionsSectionConfig } from "@/data/content";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import { slugify, useRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";
import type { MediaModalConfig } from "@/types/media-modal";

function projectCardBody(project: ContributionProject, revealPhotoOnHover: boolean | undefined, showDecorativeMedia: boolean) {
  return (
    <MajorProjectCardBody
      company={project.company}
      location={project.location}
      window={project.window}
      role={project.role}
      bullets={project.bullets}
      photo={project.photo}
      revealPhotoOnHover={revealPhotoOnHover}
      showDecorativeMedia={showDecorativeMedia}
    />
  );
}

function ContributionCard({
  project,
  onOpen,
  revealPhotoOnHover,
  onActionClick,
  showDecorativeMedia,
}: {
  project: ContributionProject;
  onOpen: () => void;
  revealPhotoOnHover?: boolean;
  onActionClick: () => void;
  showDecorativeMedia: boolean;
}) {
  const [wiggle, setWiggle] = useState(false);
  const [armed, setArmed] = useState(false);
  /** Pin card height at the resting size while armed; cleared on cancel / width resize. */
  const [lockedHeightPx, setLockedHeightPx] = useState<number | null>(null);
  const cardRef = useRef<HTMLElement>(null);
  const unlockTimerRef = useRef<number | null>(null);
  const viewportWidthRef = useRef(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const visitLabelId = useId();
  const hasModal = Boolean(project.modal);
  const isWiggleOnly = Boolean(project.wiggleOnClick);
  const showChevron = Boolean(project.url) && !hasModal && !isWiggleOnly;
  const groupClass = revealPhotoOnHover && showDecorativeMedia ? "group " : "";

  const clearHeightLockStyles = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.height = "";
    el.style.minHeight = "";
    el.style.maxHeight = "";
  }, []);

  const applyHeightLock = (px: number) => {
    const el = cardRef.current;
    if (!el) return;
    const value = `${px}px`;
    // Imperative first so the next paint (armed layout) cannot shrink the card.
    el.style.height = value;
    el.style.minHeight = value;
    el.style.maxHeight = value;
    setLockedHeightPx(px);
  };

  const triggerWiggle = () => {
    onActionClick();
    setWiggle((v) => !v);
  };

  const disarm = useCallback(() => {
    setArmed(false);
    // Keep the lock through the collapse/expand transition so the grid does not jitter.
    if (unlockTimerRef.current != null) {
      window.clearTimeout(unlockTimerRef.current);
    }
    unlockTimerRef.current = window.setTimeout(() => {
      setLockedHeightPx(null);
      clearHeightLockStyles();
      unlockTimerRef.current = null;
    }, 520);
  }, [clearHeightLockStyles]);

  const toggleArmed = () => {
    onActionClick();
    if (armed) {
      disarm();
      return;
    }
    if (unlockTimerRef.current != null) {
      window.clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    const el = cardRef.current;
    const measured = el?.getBoundingClientRect().height;
    if (measured && measured > 0) {
      applyHeightLock(Math.round(measured));
    }
    setArmed(true);
    void recordActivity({
      type: "project.leavePreview",
      contentId: project.id,
      label: `Leave preview · ${project.company}`,
      meta: { company: project.company, role: project.role },
    });
  };

  const handleVisitSite = () => {
    onActionClick();
    void recordActivity({
      type: "project.visitSite",
      contentId: project.id,
      label: `Visit site · ${project.company}`,
      meta: { company: project.company, url: project.url },
    });
  };

  useEffect(() => {
    return () => {
      if (unlockTimerRef.current != null) {
        window.clearTimeout(unlockTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!armed) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        disarm();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        disarm();
      }
    };

    /**
     * Only clear the height lock when the viewport *width* changes.
     * Mobile browser chrome (URL bar) fires resize on scroll via height-only
     * changes — clearing there was dropping the lock and jittering the grid.
     */
    const onResize = () => {
      const nextWidth = window.innerWidth;
      if (nextWidth === viewportWidthRef.current) return;
      viewportWidthRef.current = nextWidth;
      setLockedHeightPx(null);
      clearHeightLockStyles();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [armed, disarm, clearHeightLockStyles]);

  if (hasModal && project.modal) {
    return (
      <button
        type="button"
        onClick={() => {
          onActionClick();
          onOpen();
        }}
        className={`${groupClass}flex h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40 text-left`}
        aria-label={`Open ${project.company}`}
        {...trackAttrs(project.id)}
      >
        {projectCardBody(project, revealPhotoOnHover, showDecorativeMedia)}
      </button>
    );
  }

  if (isWiggleOnly) {
    return (
      <article
        role="button"
        tabIndex={0}
        onClick={triggerWiggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            triggerWiggle();
          }
        }}
        className={`${groupClass}flex h-full cursor-default overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40 ${
          wiggle ? "animate-wiggle" : ""
        }`}
        aria-label={project.company}
        {...trackAttrs(project.id)}
      >
        {projectCardBody(project, revealPhotoOnHover, showDecorativeMedia)}
      </article>
    );
  }

  const body = projectCardBody(project, revealPhotoOnHover, showDecorativeMedia);

  return (
    <article
      ref={cardRef}
      className={`${groupClass}flex overflow-hidden rounded-2xl border border-white/10 bg-surface-900/40 ${
        lockedHeightPx != null ? "shrink-0" : "h-full"
      }`}
      style={
        lockedHeightPx != null
          ? {
              height: lockedHeightPx,
              minHeight: lockedHeightPx,
              maxHeight: lockedHeightPx,
            }
          : undefined
      }
      aria-describedby={showChevron && armed ? visitLabelId : undefined}
    >
      {showChevron && project.url ? (
        <LeaveSiteConfirm
          phase={armed ? 2 : 1}
          title={project.company}
          subtitle={project.location}
          href={project.url}
          paddleLabel={project.company}
          visitLabelId={visitLabelId}
          onTogglePhase={toggleArmed}
          onVisit={handleVisitSite}
        >
          {body}
        </LeaveSiteConfirm>
      ) : (
        body
      )}
    </article>
  );
}

export function ProjectContributionsSection({
  id,
  eyebrow,
  title,
  description,
  projects,
  revealPhotoOnHover,
  mobileRevealFullCard,
}: ContributionsSectionConfig) {
  const { playNavClick, visibility } = useTheme();
  const showDecorativeMedia = visibility.decorativeCardMedia;
  const isMobile = useMobileOnlyViewport();
  const [armedId, setArmedId] = useState<string | null>(null);
  const [wiggleId, setWiggleId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { active: activeModal, activeKey, path, selection, open, setView, close } =
    useRouteModal<MediaModalConfig>(
      `proj-${id ?? slugify(title)}`,
      (key) => projects.find((p) => p.modal && p.id === key)?.modal ?? null,
    );

  return (
    <PageSection
      after={
        <MediaModal
          key={activeKey ?? "closed"}
          config={activeModal}
          onClose={close}
          initialPath={path}
          initialItemId={selection}
          onNavigate={setView}
        />
      }
    >
      <SectionHeading id={id} eyebrow={eyebrow} title={title} description={description} />

        {isMobile ? (
          <MobileContentList
            showDecorativeMedia={showDecorativeMedia}
            items={projects.map((project) => {
              const hasModal = Boolean(project.modal);
              const isWiggleOnly = Boolean(project.wiggleOnClick);
              const canVisit = Boolean(project.url) && !hasModal && !isWiggleOnly;
              const fullCard = (
                <ContributionCard
                  project={project}
                  revealPhotoOnHover={revealPhotoOnHover}
                  showDecorativeMedia={showDecorativeMedia}
                  onActionClick={playNavClick}
                  onOpen={() => {
                    if (project.modal) open(project.id, project.modal);
                  }}
                />
              );
              if (mobileRevealFullCard) {
                return {
                  id: project.id,
                  title: project.company,
                  date: project.window,
                  graphic: { kind: "image" as const, src: project.photo, alt: "" },
                  ariaLabel: `Open ${project.company}`,
                  expanded: expandedId === project.id ? fullCard : undefined,
                  onCollapse: () => setExpandedId(null),
                  onClick: () => {
                    playNavClick();
                    setExpandedId(project.id);
                  },
                };
              }
              return {
                id: project.id,
                title: project.company,
                date: project.window,
                graphic: { kind: "image" as const, src: project.photo, alt: "" },
                ariaLabel: hasModal
                  ? `Open ${project.company}`
                  : canVisit
                    ? `Prepare to visit ${project.company}`
                    : project.company,
                wiggling: wiggleId === project.id,
                footer:
                  canVisit && armedId === project.id && project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-content-list__visit"
                      data-track-ignore=""
                      onClick={() => {
                        playNavClick();
                        void recordActivity({
                          type: "project.visitSite",
                          contentId: project.id,
                          label: `Visit site · ${project.company}`,
                          meta: { company: project.company, url: project.url },
                        });
                      }}
                    >
                      Visit Site
                    </a>
                  ) : null,
                onClick: () => {
                  playNavClick();
                  if (hasModal && project.modal) {
                    open(project.id, project.modal);
                    return;
                  }
                  if (isWiggleOnly) {
                    setWiggleId(null);
                    window.requestAnimationFrame(() => setWiggleId(project.id));
                    return;
                  }
                  if (canVisit) {
                    setArmedId((current) => {
                      if (current === project.id) return null;
                      void recordActivity({
                        type: "project.leavePreview",
                        contentId: project.id,
                        label: `Leave preview · ${project.company}`,
                        meta: { company: project.company, role: project.role },
                      });
                      return project.id;
                    });
                  }
                },
              };
            })}
          />
        ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <ContributionCard
              key={`${id}-${project.id}`}
              project={project}
              revealPhotoOnHover={revealPhotoOnHover}
              showDecorativeMedia={showDecorativeMedia}
              onActionClick={playNavClick}
              onOpen={() => {
                if (project.modal) open(project.id, project.modal);
              }}
            />
          ))}
        </div>
        )}
    </PageSection>
  );
}
