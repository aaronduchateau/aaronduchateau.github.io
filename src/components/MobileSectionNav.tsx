"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";
import { requestOptionsMenu } from "@/components/OptionsMenu";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";

/** Primary section links — order matches homepage scroll. */
const primaryLinks = [
  { href: "#testimonials", label: "Testimonials" },
  { href: "#education", label: "Education" },
];

const workLinks = [
  { href: "#interactive-things", label: "Interactive things" },
  { href: "#new-software-demos", label: "A few software demos" },
  { href: "#work", label: "Career timeline" },
  { href: "#projects", label: "Major projects" },
  { href: "#hackathons", label: "Hackathon Contributions" },
  { href: "#older-videos", label: "Archives" },
];

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/** Phone-width section jump list — hamburger left of Aaron, left flyout. */
export function MobileSectionNav({ open, onOpenChange }: Props) {
  const menuId = useId();
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [workOpen, setWorkOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { playNavClick } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useBodyScrollLock(open, { pauseThemeMusic: false });

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    const onViewport = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onViewport);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onViewport);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("button, a[href]");
    first?.focus();
  }, [open]);

  const closeMenu = () => {
    onOpenChange(false);
  };

  const closeAfterJump = () => {
    playNavClick();
    closeMenu();
  };

  const runAfterClose = (action: () => void) => {
    playNavClick();
    closeMenu();
    window.requestAnimationFrame(() => {
      action();
    });
  };

  const toggle = () => {
    playNavClick();
    if (open) {
      onOpenChange(false);
      return;
    }
    setWorkOpen(true);
    onOpenChange(true);
  };

  return (
    <div className="md:hidden">
      <button
        type="button"
        data-section-nav-toggle=""
        className="theme-nav-control theme-nav-hamburger theme-btn-shape"
        aria-label={open ? "Close section menu" : "Open section menu"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      </button>
      {mounted && open
        ? createPortal(
            <div className="theme-nav-flyout-layer md:hidden" data-section-nav-panel="">
              <div
                className="theme-nav-flyout-backdrop"
                aria-hidden="true"
                onClick={() => {
                  playNavClick();
                  closeMenu();
                }}
              />
              <aside
                ref={panelRef}
                id={menuId}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="theme-nav-flyout options-menu-panel"
              >
                <div className="theme-nav-flyout__header">
                  <h2 id={titleId} className="theme-nav-flyout__title">
                    Jump to
                  </h2>
                </div>
                <nav className="theme-nav-flyout__list" aria-label="Page sections">
                  <button
                    type="button"
                    aria-expanded={workOpen}
                    className="theme-nav-flyout__item theme-nav-flyout__item--parent"
                    onClick={() => {
                      playNavClick();
                      setWorkOpen((prev) => !prev);
                    }}
                  >
                    Work
                    <span aria-hidden>{workOpen ? "▾" : "▸"}</span>
                  </button>
                  {workOpen
                    ? workLinks.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          className="theme-nav-flyout__item theme-nav-flyout__item--child"
                          onClick={closeAfterJump}
                        >
                          {link.label}
                        </a>
                      ))
                    : null}
                  {primaryLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="theme-nav-flyout__item"
                      onClick={closeAfterJump}
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="theme-nav-flyout__rule" role="separator" />
                  <p className="theme-nav-flyout__title">Site</p>
                  <button
                    type="button"
                    className="theme-nav-flyout__item"
                    onClick={() => {
                      runAfterClose(() => navigateToRouteModal("demos", "theme-playground"));
                    }}
                  >
                    Themes
                  </button>
                  <button
                    type="button"
                    className="theme-nav-flyout__item"
                    onClick={() => {
                      runAfterClose(() => requestOptionsMenu());
                    }}
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    className="theme-nav-flyout__item"
                    onClick={() => {
                      runAfterClose(() => requestEasterEggBoard());
                    }}
                  >
                    Easter egg board
                  </button>
                </nav>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
