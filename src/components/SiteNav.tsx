"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { person } from "@/data/content";
import { MODAL_CLOSED_EVENT } from "@/hooks/useBodyScrollLock";
import { MobileSectionNav } from "@/components/MobileSectionNav";
import { OptionsMenu } from "@/components/OptionsMenu";
import { ScoreChestButton } from "@/components/ScoreChestButton";
import { SoundMenu } from "@/components/SoundMenu";
import { useTheme } from "@/theme/ThemeProvider";
import { PORTFOLIO_PATH } from "@/lib/routes";

const primaryLinks = [
  { href: "#education", label: "Education" },
  { href: "#testimonials", label: "Testimonials" },
];

const workLinks = [
  { href: "#new-software-demos", label: "New software demos" },
  { href: "#interactive-things", label: "Interactive things" },
  { href: "#work", label: "Career timeline" },
  { href: "#projects", label: "Major projects" },
  { href: "#hackathons", label: "Hackathon Contributions" },
  { href: "#older-videos", label: "Archives" },
];

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
        className="theme-btn-shape flex items-center gap-1 px-3 py-1.5 transition hover:bg-white/5 hover:text-white"
      >
        Work
        <span className="text-surface-500" aria-hidden>
          {open ? "▾" : "▸"}
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
  const { playNavClick } = useTheme();

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
        if (target instanceof Element && target.closest("[data-section-nav-toggle]")) {
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
          {primaryLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                onClick={playNavClick}
                className="theme-btn-shape px-3 py-1.5 transition hover:bg-white/5 hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex shrink-0 items-center gap-2">
          <OptionsMenu />
          <SoundMenu />
          <ScoreChestButton />
        </div>
      </div>
    </nav>
  );
}
