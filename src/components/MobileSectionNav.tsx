"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";
import { requestOptionsMenu } from "@/components/OptionsMenu";
import { MinusIcon, PlusIcon } from "@/components/ui/simple/icons";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";

/** Primary section links — order matches homepage scroll. */
const primaryLinks = [
  { href: "#testimonials", label: "Testimonials" },
  { href: "#education", label: "Education" },
  { href: "#human-things", label: "Human things", requiresFunThings: true },
] as const;

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


/**
 * Phone menu glyph: three lines → right chevron → down-V → peace hand.
 * Peace artwork reads as a down chevron (filled silhouette, theme ink via currentColor).
 */
function MenuToggleGlyph() {
  return (
    <span className="theme-nav-menu-glyph">
      <svg className="theme-nav-menu-glyph__lines" viewBox="0 0 24 24" fill="none" aria-hidden>
        <g className="theme-nav-menu-glyph__spin">
          <path
            className="theme-nav-menu-glyph__line theme-nav-menu-glyph__line--top"
            d="M4 7.5h16"
          />
          <path
            className="theme-nav-menu-glyph__line theme-nav-menu-glyph__line--mid"
            d="M4 12h16"
          />
          <path
            className="theme-nav-menu-glyph__line theme-nav-menu-glyph__line--bot"
            d="M4 16.5h16"
          />
        </g>
      </svg>
      <svg
        className="theme-nav-menu-glyph__peace"
        viewBox="0 0 256 256"
        fill="none"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <g
          className="theme-nav-menu-glyph__peace-strokes"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* index finger / left side of V */}
          <path d="M102 147 C102 132 100 119 96 104 L78 34 C75 22 82 10 94 7 C106 4 118 11 121 23 L142 103" />
          {/* middle finger and inside V */}
          <path d="M142 103 L161 31 C164 19 176 12 188 15 C200 18 207 30 204 42 L177 144" />
          {/* folded ring finger */}
          <path d="M177 144 L187 108 C190 97 201 91 212 94 C223 97 229 108 226 119 L214 165 C211 176 200 182 189 179 C178 176 172 165 175 154 Z" />
          {/* folded pinky */}
          <path d="M217 132 C220 121 231 115 242 118 C253 121 259 132 256 143 L247 177 C244 188 233 194 222 191 C211 188 205 177 208 166 Z" />
          {/* palm / outer hand */}
          <path d="M102 147 L79 163 C72 168 68 175 68 184 L68 202 C68 232 92 256 122 256 L166 256 C198 256 224 230 224 198 L224 187" />
          {/* thumb crossing palm */}
          <path d="M79 163 L121 133 C131 126 144 128 151 138 C158 148 156 161 146 168 L118 188 L128 196" />
        </g>
      </svg>
    </span>
  );
}

/** Section jump list — menu glyph left of Aaron; left flyout at all breakpoints. */
export function MobileSectionNav({ open, onOpenChange }: Props) {
  const menuId = useId();
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [workOpen, setWorkOpen] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { playNavClick, visibility } = useTheme();
  const sectionLinks = primaryLinks.filter(
    (l) => !("requiresFunThings" in l && l.requiresFunThings) || visibility.funThings,
  );

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

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
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
    <div>
      <button
        type="button"
        data-section-nav-toggle=""
        className="theme-nav-menu-toggle"
        aria-label={open ? "Close section menu" : "Open section menu"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
      >
        <MenuToggleGlyph />
      </button>
      {mounted && open
        ? createPortal(
            <div className="theme-nav-flyout-layer" data-section-nav-panel="">
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
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center"
                      aria-hidden
                    >
                      {workOpen ? (
                        <MinusIcon className="h-4 w-4" />
                      ) : (
                        <PlusIcon className="h-4 w-4" />
                      )}
                    </span>
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
                  {sectionLinks.map((link) => (
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
                    Config
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
