"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { person } from "@/data/content";
import { MODAL_CLOSED_EVENT } from "@/hooks/useBodyScrollLock";
import { MobileSectionNav } from "@/components/MobileSectionNav";
import { OptionsMenu } from "@/components/OptionsMenu";
import { ScoreChestButton } from "@/components/ScoreChestButton";
import { SoundMenu } from "@/components/SoundMenu";
import { MinusIcon, PlusIcon } from "@/components/ui/simple/icons";
import { useTheme } from "@/theme/ThemeProvider";
import { PORTFOLIO_PATH } from "@/lib/routes";

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

/** Shared with Education / Testimonials anchors — theme roles only, same box. */
const navItemClass =
  "theme-btn-shape inline-flex items-center gap-1 px-3 py-1.5 transition hover:bg-white/5 hover:text-white";

function WorkMenu({ onNavigate }: { onNavigate: () => void }) {
  const menuId = useId();
  const rootRef = useRef<HTMLLIElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const toggle = () => {
    onNavigate();
    setOpen((prev) => !prev);
  };

  return (
    <li ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={toggle}
        className={navItemClass}
      >
        Work
        <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-surface-400" aria-hidden>
          {open ? <MinusIcon className="h-3.5 w-3.5" /> : <PlusIcon className="h-3.5 w-3.5" />}
        </span>
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Work"
          className="options-menu-panel absolute left-0 top-[calc(100%+0.4rem)] z-[60] min-w-[14rem] border border-white/10 bg-surface-950/95 p-2 shadow-xl shadow-black/40"
        >
          {workLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => {
                onNavigate();
                setOpen(false);
              }}
              className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium text-surface-200 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function SiteNav() {
  // Bumping this key remounts the title so the fade-in animation replays each
  // time a modal closes. Starts at 0 so it stays still on first page load.
  const [titleReplay, setTitleReplay] = useState(0);
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const { playNavClick, visibility } = useTheme();
  const sectionLinks = primaryLinks.filter(
    (l) => !("requiresFunThings" in l && l.requiresFunThings) || visibility.funThings,
  );

  useEffect(() => {
    const onModalClosed = () => setTitleReplay((n) => n + 1);
    window.addEventListener(MODAL_CLOSED_EVENT, onModalClosed);
    return () => window.removeEventListener(MODAL_CLOSED_EVENT, onModalClosed);
  }, []);

  return (
    <nav
      className="theme-nav sticky top-0 z-50 border-b border-white/10 bg-surface-950/35"
      onClickCapture={(event) => {
        if (!sectionMenuOpen) return;
        const target = event.target;
        if (!(target instanceof Element)) return;
        // Flyout is portaled; React still bubbles through this tree — ignore panel clicks.
        if (
          target.closest("[data-section-nav-toggle]") ||
          target.closest("[data-section-nav-panel]")
        ) {
          return;
        }
        setSectionMenuOpen(false);
      }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-3 sm:gap-4 sm:px-5 md:px-10">
        <div className="flex min-w-0 items-center gap-2">
          <MobileSectionNav open={sectionMenuOpen} onOpenChange={setSectionMenuOpen} />
          <Link
            key={titleReplay}
            href={PORTFOLIO_PATH}
            onClick={playNavClick}
            className={`font-display text-sm font-semibold tracking-tight text-white ${
              titleReplay > 0 ? "nav-title-fade-in" : ""
            }`}
          >
            {person.name.split(" ")[0]}
            <span className="text-accent-400">.</span>
          </Link>
        </div>
        <ul className="hidden flex-wrap items-center justify-end gap-1 text-xs font-medium text-surface-400 md:flex">
          <WorkMenu onNavigate={playNavClick} />
          {sectionLinks.map((l) => (
            <li key={l.href}>
              <a href={l.href} onClick={playNavClick} className={navItemClass}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-2">
          <SoundMenu />
          <ScoreChestButton />
          <OptionsMenu />
        </div>
      </div>
    </nav>
  );
}
