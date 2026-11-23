"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { ABOUT_SITE_NOTE, ABOUT_SITE_VERSIONS_BLURB } from "@/data/aboutSite";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { THEME_PALETTES } from "@/theme/palettes";
import { useTheme } from "@/theme/ThemeProvider";

type AboutSiteModalProps = {
  open: boolean;
  onClose: () => void;
};

/**
 * Welcome note plus a site-versions blurb. Opened from Config.
 * Does not change the theme or the saved music preference.
 */
export function AboutSiteModal({ open, onClose }: AboutSiteModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { themeId, visibility } = useTheme();
  const showPortrait = visibility.decorativeCardMedia;
  const { className: launchClass, onAnimationEnd } = useModalLaunchClass({
    openKey: open ? "about-site" : null,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useModalAccessibility(open && mounted, dialogRef, onClose, {
    pauseThemeMusic: false,
    autoFocus: false,
  });

  if (!open || !mounted) return null;

  const art = THEME_PALETTES[themeId].heroImage;

  return (
    <div className="fixed inset-0 z-[80] flex items-stretch justify-center bg-surface-950/70 p-0 sm:items-center sm:p-4 md:p-6">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`theme-glass ${launchClass} relative flex h-dvh w-full max-w-none flex-col overflow-hidden border-0 border-white/10 shadow-2xl shadow-black/60 outline-none sm:h-[min(88dvh,720px)] sm:max-h-[min(88dvh,720px)] sm:max-w-4xl sm:border sm:border-white/10 md:max-w-5xl`}
        onAnimationEnd={onAnimationEnd}
      >
        <div
          className={`flex min-h-0 flex-1 flex-col ${showPortrait ? "lg:grid lg:grid-cols-2" : ""}`}
        >
          {showPortrait ? (
            <div
              className="relative h-52 shrink-0 overflow-hidden bg-surface-900 sm:h-56 lg:h-full lg:min-h-0"
              aria-hidden
            >
              {art ? (
                <Image
                  src={art}
                  alt=""
                  fill
                  className="object-cover object-left"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : null}
            </div>
          ) : null}
          <div
            className={`flex min-h-0 flex-1 flex-col overflow-hidden ${
              showPortrait ? "border-t border-white/10 lg:border-l lg:border-t-0" : ""
            }`}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
              <div className="min-w-0">
                <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-accent-300/80">
                  About Site
                </p>
                <h2
                  id={titleId}
                  tabIndex={-1}
                  className="font-display text-xl leading-none tracking-tight text-white outline-none sm:text-2xl lg:text-3xl"
                >
                  Welcome
                </h2>
              </div>
              <ModalCloseButton onClick={onClose} />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 pt-4 sm:px-7 sm:pb-7 sm:pt-5">
              <div className="max-w-md space-y-4 text-sm leading-relaxed text-surface-400">
                {ABOUT_SITE_NOTE.split("\n\n").map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
                <p className="border-t border-white/10 pt-4 text-surface-300">{ABOUT_SITE_VERSIONS_BLURB}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
