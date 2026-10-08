"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type MouseEvent } from "react";
import {
  introCharacters,
  isIntroCharacterAvailable,
  type IntroCharacter,
  type IntroCharacterStat,
} from "@/data/introScreen";
import { useActivity } from "@/activity/ActivityProvider";
import { isBaseClickUnlocked, isContentWindowSoundUnlocked } from "@/activity/milestonePrizes";
import { resolveIntroSideQuests } from "@/activity/resolveIntroSideQuests";
import { EasterEggBoardIntro } from "@/components/EasterEggBoardIntro";
import { EasterEggBoardPanel, EasterEggBoardScore } from "@/components/EasterEggBoardPanel";
import { SoundAvailableIcon, SoundLockIcon } from "@/components/SoundLockIcon";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { ThemeLockedModal } from "@/components/ThemeLockedModal";
import { Button } from "@/components/ui";
import { ThemeMusicToggle, SpeakerMutedIcon, SpeakerOnIcon } from "@/components/ThemeMusicToggle";
import { ThemeMusicDividerWave } from "@/components/intro/ThemeMusicDividerWave";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { INTRO_SPLASH_PATH, PORTFOLIO_PATH } from "@/lib/routes";
import { markIntroCompleted, shouldSkipIntroShellLaunch } from "@/lib/introGate";
import { readSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import {
  BASE_CLICKS,
  CONTENT_WINDOW_SOUNDS,
  DEFAULT_BASE_CLICK_ID,
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
  NO_SOUND_ID,
} from "@/theme/sounds";
import { useTheme } from "@/theme/ThemeProvider";
import {
  THEME_ALT_LABELS,
  THEME_LABELS,
  themeDisplayLabel,
  type ThemeId,
} from "@/theme/types";

type IntroPanel = "setup" | "all-characters" | "easter-eggs";

type IntroGameModalProps = {
  /**
   * When true, render the intro shell as a non-interactive backdrop
   * (e.g. under `/intro/splash`) — no dialog role or focus trap.
   */
  backgroundOnly?: boolean;
};

/**
 * Dedicated intro “game shell” modal — not MediaModal / InteractiveModal.
 * Desktop: centered card. Mobile (max-sm): fills the viewport.
 */
export function IntroGameModal({ backgroundOnly = false }: IntroGameModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [panel, setPanel] = useState<IntroPanel>("setup");
  const [easterEntered, setEasterEntered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [skipLaunch, setSkipLaunch] = useState(false);
  const [softwarePortfolioOnly, setSoftwarePortfolioOnly] = useState(false);
  const [lockedPrompt, setLockedPrompt] = useState(false);
  const { store: activityStore, unlockedMilestoneIds } = useActivity();
  const sideQuests = useMemo(() => resolveIntroSideQuests(activityStore), [activityStore]);
  const {
    themeId,
    setThemeId,
    playNavClick,
    baseClickId,
    setBaseClickId,
    contentWindowSoundId,
    setContentWindowSoundId,
    themeMusicEnabled,
    themeMusicSrc,
    soundEnabled,
    setThemeMusicEnabled,
    setSoundEnabled,
    muteAllSounds,
    setClickInteractionsEnabled,
    setContentWindowSoundsEnabled,
    restoreSoundEffectDefaults,
  } = useTheme();
  const [displayedLabel, setDisplayedLabel] = useState(() => themeDisplayLabel(themeId));
  const previousDisplayedRef = useRef<string | null>(null);
  /** Pending roster index while theme apply is async — keeps ◂/▸ cycling bidirectional. */
  const cycleIndexRef = useRef<number | null>(null);
  const isAda = themeId === "ada-first";

  const allCharacters = useMemo(
    () => introCharacters(undefined, unlockedMilestoneIds),
    [unlockedMilestoneIds],
  );

  useEffect(() => {
    setMounted(true);
    setSoftwarePortfolioOnly(readSoftwarePortfolioOnly());
    setSkipLaunch(shouldSkipIntroShellLaunch());
  }, []);

  const { className: launchClass, onAnimationEnd } = useModalLaunchClass({
    instant: skipLaunch,
    openKey: "intro-game",
  });

  // Keep roster label in sync with themeId (storage hydrate) without clobbering
  // Aaron-alt names chosen while cycling on this screen.
  useEffect(() => {
    setDisplayedLabel((prev) => {
      const primary = THEME_LABELS[themeId];
      const alt = THEME_ALT_LABELS[themeId];
      if (prev === primary || (alt != null && prev === alt)) return prev;
      return themeDisplayLabel(themeId, null);
    });
    const idx = allCharacters.findIndex((c) => c.id === themeId);
    if (idx >= 0) cycleIndexRef.current = idx;
  }, [themeId, allCharacters]);

  const leaveIntro = () => {
    markIntroCompleted();
    router.push(PORTFOLIO_PATH);
  };

  // Intro shell is a modal for a11y, but must not pause theme music on open.
  // ADA: auto-focus the close control. Other themes: no initial focus ring on load.
  // Skip trap entirely when used as splash backdrop.
  useModalAccessibility(
    mounted && !backgroundOnly && !lockedPrompt,
    dialogRef,
    isAda ? leaveIntro : undefined,
    {
      pauseThemeMusic: false,
      autoFocus: isAda,
    },
  );
  const openEasterEggs = () => {
    playNavClick();
    setEasterEntered(false);
    setPanel("easter-eggs");
  };

  const openAllCharacters = () => {
    playNavClick();
    setPanel("all-characters");
  };

  const backToSetup = () => {
    playNavClick();
    setEasterEntered(false);
    setPanel("setup");
  };

  /**
   * Cycling forces theme music + interaction SFX off during the change, then
   * restores prior prefs once we’ve landed on the new character (new bed plays).
   */
  const applyCharacter = async (id: ThemeId) => {
    const switching = id !== themeId;
    const restoreMusic = themeMusicEnabled;
    const restoreSfx = soundEnabled;
    if (switching) {
      muteAllSounds();
    }
    previousDisplayedRef.current = displayedLabel;
    setDisplayedLabel(themeDisplayLabel(id, previousDisplayedRef.current));
    await setThemeId(id);
    if (switching) {
      if (restoreMusic) setThemeMusicEnabled(true);
      if (restoreSfx) setSoundEnabled(true);
    }
  };

  /** Unlocked roster slots apply immediately; locked slots open the confirm first. */
  const pickCharacter = (id: ThemeId) => {
    playNavClick();
    if (!isIntroCharacterAvailable(id, unlockedMilestoneIds)) {
      setLockedPrompt(true);
      return;
    }
    void applyCharacter(id);
  };

  const cycleCharacter = (delta: -1 | 1) => {
    if (allCharacters.length === 0) return;
    const idx =
      cycleIndexRef.current ??
      Math.max(0, allCharacters.findIndex((c) => c.id === themeId));
    const nextIdx = (idx + delta + allCharacters.length) % allCharacters.length;
    cycleIndexRef.current = nextIdx;
    const next = allCharacters[nextIdx];
    if (!next) return;
    playNavClick();
    void applyCharacter(next.id);
  };

  const tryEnterPortfolio = (event: MouseEvent<HTMLAnchorElement>) => {
    playNavClick();
    if (isIntroCharacterAvailable(themeId, unlockedMilestoneIds)) {
      markIntroCompleted();
      return;
    }
    event.preventDefault();
    setLockedPrompt(true);
  };

  const selected =
    allCharacters.find((c) => c.id === themeId) ?? allCharacters[0] ?? null;
  const selectedAvailable = selected ? selected.available : false;
  const stats = selected?.stats ?? [];
  const art = selected?.art ?? null;

  const headerEyebrow = "Aaron DuChateau Portfolio Setup";
  const headerTitle =
    panel === "setup"
      ? "Choose your loadout"
      : panel === "all-characters"
        ? "All characters"
        : "Easter egg board";

  const onSetup = panel === "setup";
  const showEasterIntro = panel === "easter-eggs" && !easterEntered;
  const headerBlurb =
    panel === "setup"
      ? softwarePortfolioOnly
        ? "Software portfolio only — you can still collect points, but some content stays hidden. Pick your Aaron, set your preferences, view objectives."
        : "Pick your Aaron, set your preferences, view objectives."
      : panel === "all-characters"
        ? "Full roster — locked characters unlock from the easter egg board."
        : "Side quests unlock from real portfolio actions — tracked in Your Event Log.";

  if (!mounted) {
    return (
      <div
        className="intro-game-backdrop flex min-h-dvh items-stretch justify-center bg-surface-950 p-0 sm:items-center sm:p-4 md:p-6"
        aria-hidden
      />
    );
  }

  return (
    <div
      className={`intro-game-backdrop flex min-h-dvh items-stretch justify-center bg-surface-950 p-0 sm:items-center sm:p-4 md:p-6 ${
        backgroundOnly ? "pointer-events-none select-none" : ""
      }`}
      aria-hidden={backgroundOnly || undefined}
      // React 18: empty string marks backdrop inert so its controls leave the tab order.
      {...(backgroundOnly ? ({ inert: "" } as Record<string, string>) : {})}
    >
      <div
        ref={dialogRef}
        role={backgroundOnly ? undefined : "dialog"}
        aria-modal={backgroundOnly ? undefined : "true"}
        aria-labelledby={backgroundOnly ? undefined : titleId}
        tabIndex={backgroundOnly ? undefined : -1}
        className={`intro-game-modal theme-glass ${launchClass} relative flex h-dvh w-full max-w-none flex-col overflow-hidden border-0 border-white/10 shadow-2xl shadow-black/50 sm:h-[min(94dvh,960px)] sm:max-h-[min(94dvh,960px)] sm:max-w-3xl sm:border sm:border-white/10 md:max-w-4xl lg:h-[min(94dvh,1020px)] lg:max-h-[min(94dvh,1020px)]`}
        onAnimationEnd={onAnimationEnd}
      >
        {showEasterIntro ? (
          <EasterEggBoardIntro
            titleId={titleId}
            onBack={() => setPanel("setup")}
            onContinue={() => setEasterEntered(true)}
          />
        ) : (
          <>
            {isAda ? (
              <div className="absolute right-3 top-3 z-20 sm:right-4 sm:top-4">
                <ModalCloseButton
                  onClick={leaveIntro}
                  ariaLabel="Close intro and enter portfolio"
                />
              </div>
            ) : null}
            <header className="intro-game-header relative shrink-0 px-5 py-3 pb-6 sm:px-7 sm:py-4 sm:pb-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-300/80">
                {headerEyebrow}
              </p>
              <div className={`flex items-center justify-between gap-3 ${isAda ? "pr-12" : ""}`}>
                <h1
                  id={titleId}
                  className="intro-loadout-title font-display mt-1 min-w-0 text-white"
                >
                  {headerTitle}
                </h1>
                {panel === "easter-eggs" ? (
                  <EasterEggBoardScore score={activityStore.totalScore} />
                ) : null}
              </div>
              {panel !== "easter-eggs" ? (
                <p className="intro-game-header-blurb mt-1.5 w-full text-sm text-surface-400">
                  {headerBlurb}
                </p>
              ) : null}
              <ThemeMusicDividerWave src={themeMusicSrc} active={themeMusicEnabled} />
            </header>

            <div
              className={
                panel === "easter-eggs"
                  ? "theme-quest-board-shell"
                  : "min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6"
              }
            >
              {panel === "setup" && selected ? (
                <SetupPanel
                  selectedLabel={displayedLabel}
                  selectedAvailable={selectedAvailable}
                  art={art}
                  artAlt={isAda ? "Aaron DuChateau" : ""}
                  stats={stats}
                  baseClickId={baseClickId}
                  contentWindowSoundId={contentWindowSoundId}
                  onCycle={cycleCharacter}
                  onSoundTease={() => {
                    // Locked kit → same ThemeLockedModal as locked characters / main Options.
                    playNavClick();
                    setLockedPrompt(true);
                  }}
                  onMuteBaseClicks={() => {
                    if (baseClickId === NO_SOUND_ID) {
                      setClickInteractionsEnabled(true);
                    } else {
                      playNavClick();
                      setBaseClickId(NO_SOUND_ID, { preview: false });
                    }
                  }}
                  onMuteContentWindows={() => {
                    if (contentWindowSoundId === NO_SOUND_ID) {
                      setContentWindowSoundsEnabled(true);
                    } else {
                      playNavClick();
                      setContentWindowSoundId(NO_SOUND_ID, { preview: false });
                    }
                  }}
                  onSelectNoBaseClick={() => {
                    playNavClick();
                    setBaseClickId(NO_SOUND_ID, { preview: false });
                  }}
                  onSelectBaseClick={(id) => {
                    setBaseClickId(id);
                  }}
                  onSelectNoContentWindow={() => {
                    playNavClick();
                    setContentWindowSoundId(NO_SOUND_ID, { preview: false });
                  }}
                  onSelectContentWindow={(id) => {
                    setContentWindowSoundId(id);
                  }}
                  onRestoreSoundDefaults={restoreSoundEffectDefaults}
                  unlockedMilestoneIds={unlockedMilestoneIds}
                  onOpenEasterEggs={openEasterEggs}
                  onViewAllCharacters={openAllCharacters}
                />
              ) : null}
              {panel === "all-characters" ? (
                <AllCharactersPanel
                  characters={allCharacters}
                  themeId={themeId}
                  onPickCharacter={pickCharacter}
                />
              ) : null}
              {panel === "easter-eggs" ? (
                <EasterEggBoardPanel quests={sideQuests} />
              ) : null}
            </div>

            <footer className="shrink-0 border-t border-white/10 px-5 py-3 sm:px-7 sm:py-3.5">
              {onSetup ? (
                <div className="flex gap-2.5">
                  <Button
                    role="outline"
                    size="lg"
                    className="flex-1"
                    href={INTRO_SPLASH_PATH}
                    onClick={() => playNavClick()}
                  >
                    Back
                  </Button>
                  <Button
                    role="primary"
                    size="lg"
                    className="flex-1 gap-2"
                    href={PORTFOLIO_PATH}
                    onClick={tryEnterPortfolio}
                    aria-label={
                      selectedAvailable
                        ? "Enter portfolio"
                        : "Enter portfolio (locked)"
                    }
                  >
                    {!selectedAvailable ? (
                      <SoundLockIcon className="h-4 w-4 shrink-0" />
                    ) : null}
                    Enter portfolio
                  </Button>
                </div>
              ) : (
                <Button role="outline" size="lg" className="w-full" onClick={backToSetup}>
                  Go back
                </Button>
              )}
            </footer>
          </>
        )}
      </div>
      <ThemeLockedModal
        open={lockedPrompt}
        onCancel={() => setLockedPrompt(false)}
        onContinue={() => {
          setLockedPrompt(false);
          setEasterEntered(false);
          setPanel("easter-eggs");
        }}
      />
    </div>
  );
}

function SetupPanel({
  selectedLabel,
  selectedAvailable,
  art,
  artAlt,
  stats,
  baseClickId,
  contentWindowSoundId,
  onCycle,
  onSoundTease,
  onMuteBaseClicks,
  onMuteContentWindows,
  onSelectNoBaseClick,
  onSelectBaseClick,
  onSelectNoContentWindow,
  onSelectContentWindow,
  onRestoreSoundDefaults,
  unlockedMilestoneIds,
  onOpenEasterEggs,
  onViewAllCharacters,
}: {
  selectedLabel: string;
  selectedAvailable: boolean;
  art: string | null;
  artAlt: string;
  stats: IntroCharacterStat[];
  baseClickId: string;
  contentWindowSoundId: string;
  onCycle: (delta: -1 | 1) => void;
  onSoundTease: () => void;
  onMuteBaseClicks: () => void;
  onMuteContentWindows: () => void;
  onSelectNoBaseClick: () => void;
  onSelectBaseClick: (id: string) => void;
  onSelectNoContentWindow: () => void;
  onSelectContentWindow: (id: string) => void;
  onRestoreSoundDefaults: () => void;
  unlockedMilestoneIds: readonly string[];
  onOpenEasterEggs: () => void;
  onViewAllCharacters: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {/* Above-the-fold: character+stats | sound kits */}
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start lg:gap-5">
        <section className="min-w-0">
          <div className="flex h-8 items-center justify-between gap-3">
            <h2 className="intro-section-label text-accent-300/80">
              Pick our character
            </h2>
            <span className="truncate text-[11px] font-semibold text-surface-300">
              {selectedLabel}
              {!selectedAvailable ? (
                <span className="ml-1.5 font-mono text-[9px] uppercase tracking-wider text-amber-300/90">
                  Locked
                </span>
              ) : null}
            </span>
          </div>

          <div className="mt-3 flex items-stretch gap-2">
            <CycleArrow label="Previous character" direction="left" onClick={() => onCycle(-1)} />

            {/*
              Desktop: photo left, stats column to the right.
              Fullscreen (mobile): stats overlay the right half of the photo
              (heroes are left-justified in frame).
            */}
            <div
              className="relative min-w-0 flex-1 overflow-hidden border border-white/10 bg-surface-950/50 sm:flex sm:flex-row"
              style={{ borderRadius: "var(--radius-media)" }}
            >
              <div className="relative aspect-[16/10] w-full shrink-0 bg-surface-900 sm:aspect-auto sm:min-h-[12.5rem] sm:w-[58%]">
                {art ? (
                  <Image
                    src={art}
                    alt={artAlt}
                    fill
                    className={`object-cover object-left ${selectedAvailable ? "" : "grayscale"}`}
                    sizes="(max-width: 1024px) 100vw, 320px"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center bg-white text-xs font-semibold uppercase tracking-wider text-black">
                    No portrait
                  </div>
                )}
                {!selectedAvailable ? (
                  <span className="theme-intro-character-lock" aria-hidden>
                    <span className="theme-intro-character-lock__mark">
                      <SoundLockIcon className="h-5 w-5" />
                    </span>
                    <span className="theme-intro-character-lock__label">Locked</span>
                  </span>
                ) : null}

                {/* Fullscreen / narrow: stats over right side of portrait */}
                <div className="theme-intro-character-stats-veil pointer-events-none absolute inset-y-0 right-0 z-[2] flex w-[52%] items-stretch sm:hidden">
                  <div className="flex w-full flex-col justify-center gap-1.5 py-3 pl-4 pr-2.5">
                    <StatBars stats={stats} compact />
                  </div>
                </div>
              </div>

              {/* Card / desktop: stats to the right of the character */}
              <div className="theme-intro-character-stats-veil theme-intro-character-stats-veil--column hidden min-w-0 flex-1 flex-col justify-center gap-2 border-l border-white/10 px-3 py-3 sm:flex">
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-surface-500">
                  Character sheet
                </p>
                <StatBars stats={stats} />
              </div>
            </div>

            <CycleArrow label="Next character" direction="right" onClick={() => onCycle(1)} />
          </div>

          <Button role="outline" size="sm" className="mt-3 w-full" onClick={onViewAllCharacters}>
            View all character options
          </Button>
        </section>

        <section className="min-w-0">
          <div className="flex h-8 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <h2 className="intro-section-label text-accent-300/80">Sound kits</h2>
              <SoundDefaultsRestoreButton
                enabled={
                  baseClickId !== DEFAULT_BASE_CLICK_ID ||
                  contentWindowSoundId !== DEFAULT_CONTENT_WINDOW_SOUND_ID
                }
                onRestore={onRestoreSoundDefaults}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-surface-500">Primary theme music</span>
              <ThemeMusicToggle />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
            <SoundBrowseList
              title="Base clicks"
              activeId={baseClickId}
              soundCategory="baseClick"
              unlockedMilestoneIds={unlockedMilestoneIds}
              options={[
                { id: NO_SOUND_ID, label: "No Sound" },
                ...BASE_CLICKS.map((s) => ({ id: s.id, label: s.label })),
              ]}
              onTease={onSoundTease}
              onSelectNoSound={onSelectNoBaseClick}
              onSelectSound={onSelectBaseClick}
              onToggleMute={onMuteBaseClicks}
            />
            <SoundBrowseList
              title="Content windows"
              activeId={contentWindowSoundId}
              soundCategory="contentWindow"
              unlockedMilestoneIds={unlockedMilestoneIds}
              options={[
                { id: NO_SOUND_ID, label: "No Sound" },
                ...CONTENT_WINDOW_SOUNDS.map((s) => ({ id: s.id, label: s.label })),
              ]}
              onTease={onSoundTease}
              onSelectNoSound={onSelectNoContentWindow}
              onSelectSound={onSelectContentWindow}
              onToggleMute={onMuteContentWindows}
            />
          </div>
        </section>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <div className="min-w-0 flex-1">
          <h2 className="intro-section-label text-accent-300/80">Easter eggs</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-surface-500">
            Interact with Aaron&rsquo;s portfolio to unlock new features of the site.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenEasterEggs}
          className="theme-btn-shape shrink-0 border border-accent-500/40 bg-accent-950/40 px-4 py-2 text-xs font-semibold text-accent-200 transition hover:border-accent-400/60 hover:text-accent-100"
        >
          Open easter egg board
        </button>
      </section>
    </div>
  );
}

function SoundDefaultsRestoreButton({
  enabled,
  onRestore,
}: {
  enabled: boolean;
  onRestore: () => void;
}) {
  return (
    <button
      type="button"
      className="theme-sound-restore"
      disabled={!enabled}
      aria-label="Restore default click and content window sounds"
      title={
        enabled
          ? "Restore default click and content window sounds"
          : "Already using default click and content window sounds"
      }
      onClick={() => {
        if (!enabled) return;
        onRestore();
      }}
    >
      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4.5 12a7.5 7.5 0 0112.6-5.5M19.5 12a7.5 7.5 0 01-12.6 5.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M16.5 3.5V7h-3.5M7.5 20.5V17H11"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

function CycleArrow({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="theme-btn-shape relative z-10 flex w-9 shrink-0 items-center justify-center border border-white/15 bg-white/5 text-lg text-accent-200 transition hover:border-accent-500/40 hover:bg-accent-950/30 sm:w-10"
    >
      {direction === "left" ? "‹" : "›"}
    </button>
  );
}

function StatBars({
  stats,
  compact = false,
}: {
  stats: IntroCharacterStat[];
  compact?: boolean;
}) {
  return (
    <ul className={`flex flex-col ${compact ? "gap-1" : "gap-1.5"}`}>
      {stats.map((stat) => (
        <li key={stat.id}>
          <div className="mb-0.5 flex items-center justify-between gap-2">
            <span
              className={`font-mono uppercase tracking-wider text-surface-300 ${
                compact ? "text-[8px]" : "text-[9px]"
              }`}
            >
              {stat.label}
            </span>
            <span className={`tabular-nums text-accent-200/90 ${compact ? "text-[8px]" : "text-[9px]"}`}>
              {stat.value}
            </span>
          </div>
          <div
            className={`overflow-hidden rounded-full bg-white/10 ${compact ? "h-1" : "h-1.5"}`}
            role="meter"
            aria-label={stat.label}
            aria-valuenow={stat.value}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-300"
              style={{ width: `${Math.min(100, Math.max(0, stat.value))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function AllCharactersPanel({
  characters,
  themeId,
  onPickCharacter,
}: {
  characters: IntroCharacter[];
  themeId: ThemeId;
  onPickCharacter: (id: ThemeId) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {characters.map((character) => {
          const selected = character.id === themeId;
          const art = character.art;
          return (
            <li key={character.id}>
              <button
                type="button"
                onClick={() => onPickCharacter(character.id)}
                aria-pressed={selected}
                aria-label={
                  character.available ? character.label : `${character.label} (locked)`
                }
                className={`group relative flex w-full flex-col overflow-hidden border text-left transition ${
                  selected
                    ? "border-accent-400/70 bg-accent-500/15 ring-1 ring-accent-400/40"
                    : character.available
                      ? "border-white/10 bg-surface-950/50 hover:border-accent-500/40 hover:bg-white/5"
                      : "border-white/5 bg-surface-950/30 opacity-70 hover:border-amber-500/35 hover:opacity-90"
                }`}
                style={{ borderRadius: "var(--radius-media)" }}
              >
                <div className="relative aspect-[16/10] w-full bg-surface-900">
                  {art ? (
                    <Image
                      src={art}
                      alt=""
                      fill
                      className={`object-cover object-left transition group-hover:scale-[1.03] ${
                        character.available ? "" : "grayscale"
                      }`}
                      sizes="160px"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center bg-white text-[10px] font-semibold uppercase tracking-wider text-black">
                      No portrait
                    </div>
                  )}
                  {!character.available ? (
                    <>
                      <span className="theme-intro-character-lock" aria-hidden>
                        <span className="theme-intro-character-lock__mark">
                          <SoundLockIcon className="h-4 w-4" />
                        </span>
                      </span>
                      <span className="absolute inset-x-0 bottom-0 bg-surface-950/75 px-1.5 py-1 text-center text-[9px] font-bold uppercase tracking-wider text-accent-200/90">
                        Locked
                      </span>
                    </>
                  ) : null}
                  {selected ? (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-400 px-1.5 py-0.5 text-[9px] font-bold text-surface-950">
                      {character.available ? "Active" : "Preview"}
                    </span>
                  ) : null}
                </div>
                <span className="truncate px-2.5 py-2 text-xs font-semibold text-surface-200">
                  {character.label}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AccordionChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
      className={`h-3.5 w-3.5 shrink-0 text-surface-500 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SoundBrowseList({
  title,
  activeId,
  soundCategory,
  unlockedMilestoneIds,
  options,
  onTease,
  onSelectNoSound,
  onSelectSound,
  onToggleMute,
}: {
  title: string;
  activeId: string;
  soundCategory: "baseClick" | "contentWindow";
  unlockedMilestoneIds: readonly string[];
  options: { id: string; label: string }[];
  onTease: () => void;
  onSelectNoSound: () => void;
  onSelectSound: (id: string) => void;
  onToggleMute: () => void;
}) {
  const panelId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const muted = activeId === NO_SOUND_ID;
  const isUnlocked = (id: string) =>
    soundCategory === "baseClick"
      ? isBaseClickUnlocked(id, unlockedMilestoneIds)
      : isContentWindowSoundUnlocked(id, unlockedMilestoneIds);

  const toggleMobile = () => setMobileOpen((open) => !open);

  const speakerIcon = muted ? (
    <SpeakerMutedIcon className="h-3 w-3 opacity-80" />
  ) : (
    <SpeakerOnIcon className="h-3 w-3 opacity-70" />
  );

  return (
    <div
      className="flex min-h-0 flex-col border border-white/10 bg-surface-950/40"
      style={{ borderRadius: "var(--radius-media)" }}
    >
      <div
        className={`flex h-8 shrink-0 items-center gap-2 px-3 ${
          mobileOpen ? "border-b border-white/10" : ""
        } sm:border-b sm:border-white/10`}
      >
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          aria-label={`${mobileOpen ? "Collapse" : "Expand"} ${title}`}
          onClick={toggleMobile}
          className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-surface-500 transition hover:text-accent-300/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 sm:hidden"
        >
          {speakerIcon}
        </button>
        <button
          type="button"
          aria-pressed={!muted}
          aria-label={muted ? `Enable ${title}` : `Mute ${title}`}
          title={muted ? "Sound off — click to restore" : "Mute — select No Sound"}
          onClick={onToggleMute}
          className="hidden h-5 w-5 shrink-0 items-center justify-center text-surface-500 transition hover:text-accent-300/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 sm:inline-flex"
        >
          {speakerIcon}
        </button>
        <button
          type="button"
          aria-expanded={mobileOpen}
          aria-controls={panelId}
          onClick={toggleMobile}
          className="flex min-h-8 min-w-0 flex-1 items-center justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 sm:hidden"
        >
          <span className="min-w-0 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            {title}
          </span>
          <AccordionChevron open={mobileOpen} />
        </button>
        <p className="hidden min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500 sm:block">
          {title}
        </p>
      </div>
      <ul
        id={panelId}
        className={`${
          mobileOpen ? "block" : "hidden"
        } max-h-40 space-y-0.5 overflow-y-auto overscroll-contain p-1.5 sm:block sm:max-h-48 lg:max-h-52`}
      >
        {options.map((option) => {
          const current = option.id === activeId;
          const isNoSound = option.id === NO_SOUND_ID;
          const unlocked = isUnlocked(option.id);
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => {
                  if (isNoSound) {
                    onSelectNoSound();
                    return;
                  }
                  if (unlocked) {
                    onSelectSound(option.id);
                    return;
                  }
                  onTease();
                }}
                title={
                  isNoSound
                    ? "Mute this sound kit"
                    : unlocked
                      ? "Equip this sound"
                      : "Locked — finish a quest to unlock"
                }
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs transition ${
                  current
                    ? "bg-white/5 font-semibold text-surface-200"
                    : "text-surface-500 hover:bg-white/5 hover:text-surface-300"
                }`}
                style={{ borderRadius: "var(--radius-control)" }}
              >
                <span
                  className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                    current ? "bg-accent-400" : "bg-transparent ring-1 ring-white/20"
                  }`}
                  aria-hidden
                />
                <span className="min-w-0 truncate">{option.label}</span>
                {current ? (
                  <span className="ml-auto shrink-0 text-[9px] uppercase tracking-wider text-surface-500">
                    Equipped
                  </span>
                ) : !isNoSound && !unlocked ? (
                  <SoundLockIcon className="ml-auto h-3 w-3 shrink-0 text-surface-500" />
                ) : !isNoSound && unlocked ? (
                  <SoundAvailableIcon className="ml-auto h-3 w-3 shrink-0 text-surface-500" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
