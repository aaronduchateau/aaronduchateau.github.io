"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type RefObject } from "react";
import {
  persistPrizeAnimationsEnabled,
  readPrizeAnimationsEnabled,
} from "@/activity/prizeAnimationsPref";
import { ThemeRadioGroup, type ThemeRadioChoice } from "@/components/ThemeRadioOption";
import { Button } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { INTRO_PATH, PORTFOLIO_PATH } from "@/lib/routes";
import { markIntroCompleted, shouldSkipIntroShellLaunch } from "@/lib/introGate";
import { persistSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import { NO_SOUND_ID, DEFAULT_BASE_CLICK_ID, playBaseClick, playSkipTheFunClick } from "@/theme/sounds";
import { THEME_PALETTES } from "@/theme/palettes";
import { useTheme } from "@/theme/ThemeProvider";
import { DEFAULT_THEME_ID, type ThemeId } from "@/theme/types";

export type ExperienceChoiceId = "full" | "software-only" | "skip-fun";

const EXPERIENCE_CHOICES: readonly ThemeRadioChoice[] = [
  {
    id: "full",
    label: "The Full Experience",
    description: "Tour Aaron's portfolio with all the fun bells and whistles.",
  },
  {
    id: "software-only",
    label: "Software Portfolio Only",
    description:
      "You might not care about work I’ve done outside of software—pick this option to start in software mode and unrelated content will be hidden.",
  },
  {
    id: "skip-fun",
    label: "Skip the fun",
    description:
      "Turn off interactive sounds, skip the sound and character screens, and jump straight into the portfolio.",
  },
] as const;

const SPLASH_STEP_TITLES = ["Welcome", "Your Experience", "Initial Configs"] as const;

const AARON_NOTE = `My portfolio needed an update, so i decided to start with a simple question "What if my portfolio could feel like an MVP?" I decided to tug the tail of the tiger.

Think about my portfolio experience like a handshake, or perhaps, an interactive conversation, at the end of which both of our objectives may be satisfied.

Good Luck, and may the wind be forever at your back!`;

type SoundToggleRowProps = {
  label: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

type SplashStepHeaderProps = {
  title: string;
  titleId: string;
  headingRef: RefObject<HTMLHeadingElement>;
  stepIndex: number;
  stepCount: number;
};

/**
 * Title + step counter — one reserved row so type size and height
 * never shift as the visitor clicks through splash steps.
 */
function SplashStepHeader({
  title,
  titleId,
  headingRef,
  stepIndex,
  stepCount,
}: SplashStepHeaderProps) {
  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-3 sm:h-11 lg:h-12">
      <h1
        id={titleId}
        ref={headingRef}
        tabIndex={-1}
        className="font-display min-w-0 truncate text-xl leading-none tracking-tight text-white outline-none sm:text-2xl lg:text-3xl"
      >
        {title}
      </h1>
      <p
        className="w-[7.25rem] shrink-0 text-right font-mono text-[10px] uppercase leading-none tracking-[0.2em] text-surface-500 [font-variant-numeric:tabular-nums]"
        aria-live="polite"
      >
        Step {stepIndex + 1} of {stepCount}
      </p>
    </div>
  );
}

type SplashHeroArtProps = {
  art: string | null;
};

/** Fixed-height hero on stacked layouts so the photo does not resize with step copy. */
function SplashHeroArt({ art }: SplashHeroArtProps) {
  return (
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
          priority
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-white text-xs font-semibold uppercase tracking-wider text-black">
          No portrait
        </div>
      )}
      <div className="pointer-events-none absolute inset-x-0 top-0 lg:hidden">
        <div className="bg-gradient-to-b from-black/90 via-black/55 to-transparent px-4 pb-14 pt-[max(0.7rem,env(safe-area-inset-top))]">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.9)]">
            Portfolio - Aaron DuChateau
          </p>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 bg-gradient-to-l from-surface-950/50 to-transparent lg:block"
      />
    </div>
  );
}

/** Theme-shaped on/off control for splash sound defaults. */
function SoundToggleRow({ label, enabled, onChange }: SoundToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`theme-btn-shape flex w-full items-center gap-3 border px-3.5 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-300 ${
        enabled
          ? "border-accent-400/70 bg-accent-500/15 text-accent-100 shadow-lg shadow-accent-500/10"
          : "border-white/15 bg-white/5 text-surface-200 hover:border-accent-500/35 hover:bg-accent-950/25"
      }`}
    >
      <span
        className={`flex h-5 w-9 shrink-0 items-center rounded-full border transition ${
          enabled ? "border-accent-300/80 bg-accent-400/40" : "border-white/25 bg-white/10"
        }`}
        aria-hidden
      >
        <span
          className={`h-3.5 w-3.5 rounded-full bg-white shadow transition ${
            enabled ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{label}</span>
      <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-surface-500">
        {enabled ? "On" : "Off"}
      </span>
    </button>
  );
}

type Props = {
  /** Hero art override; defaults to current theme hero (Software Guy for ADA). */
  imageSrc?: string | null;
};

/**
 * Splash layered on `/intro`. Step 1: note. Step 2: experience path. Step 3: initial configs.
 * Continue on the last step routes by experience (full → `/intro`; software /
 * skip-fun → `/`). Software and Skip the fun default all four initial configs
 * off; Skip the fun still bypasses the sound and character screens after that step.
 */
export function IntroSplashModal({ imageSrc }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();
  const {
    themeId,
    setThemeId,
    playNavClick,
    themeMusicEnabled,
    setThemeMusicEnabled,
    baseClickId,
    contentWindowSoundId,
    setClickInteractionsEnabled,
    setContentWindowSoundsEnabled,
    setSoundEnabled,
    ready: themeReady,
  } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [skipLaunch, setSkipLaunch] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [experience, setExperience] = useState<ExperienceChoiceId>("full");
  /** Theme-music preference for after splash — playback stays off while splash is open. */
  const [musicPref, setMusicPref] = useState(true);
  const [prizeAnimations, setPrizeAnimations] = useState(true);
  const leavingSplashRef = useRef(false);

  const clicksEnabled = baseClickId !== NO_SOUND_ID;
  const modalsEnabled = contentWindowSoundId !== NO_SOUND_ID;
  const stepCount = 3;
  const isLastStep = stepIndex >= stepCount - 1;

  const applyExperienceConfigDefaults = useCallback(
    (choice: ExperienceChoiceId) => {
      const funOn = choice === "full";
      setMusicPref(funOn);
      setClickInteractionsEnabled(funOn, { preview: false });
      setContentWindowSoundsEnabled(funOn, { preview: false });
      if (funOn) setSoundEnabled(true);
      setPrizeAnimations(funOn);
      persistPrizeAnimationsEnabled(funOn);
    },
    [setClickInteractionsEnabled, setContentWindowSoundsEnabled, setSoundEnabled],
  );

  /** Intro option toggles always play Buckle Lazer Click (not the equipped clip). */
  const playIntroSoundOptionClick = () => {
    playBaseClick(DEFAULT_BASE_CLICK_ID);
  };

  const art =
    imageSrc ??
    (themeId === "ada-first"
      ? THEME_PALETTES.professional.heroImage
      : THEME_PALETTES[themeId].heroImage) ??
    null;

  useEffect(() => {
    setMounted(true);
    setSkipLaunch(shouldSkipIntroShellLaunch());
    setPrizeAnimations(readPrizeAnimationsEnabled());
  }, []);

  const { className: launchClass, onAnimationEnd } = useModalLaunchClass({
    instant: skipLaunch,
    openKey: "intro-splash",
  });

  /**
   * Splash boot — always cyberpunk (ignore stored theme), theme music off.
   * Click/modal/prize defaults follow the selected experience path.
   * Wait for ThemeProvider hydrate so localStorage can’t win the race.
   */
  useEffect(() => {
    if (!mounted || !themeReady || leavingSplashRef.current) return;
    void setThemeId(DEFAULT_THEME_ID);
    setSoundEnabled(true);
    setThemeMusicEnabled(false);
  }, [
    mounted,
    themeReady,
    setThemeId,
    setSoundEnabled,
    setThemeMusicEnabled,
  ]);

  // Keep music muted for the whole splash (late hydrate / theme apply must not start the bed).
  useEffect(() => {
    if (!mounted || !themeReady || leavingSplashRef.current || !themeMusicEnabled) return;
    setThemeMusicEnabled(false);
  }, [mounted, themeReady, themeMusicEnabled, setThemeMusicEnabled]);

  // Config defaults follow the experience path (full = all on; software / skip-fun = all off).
  useEffect(() => {
    applyExperienceConfigDefaults(experience);
  }, [experience, applyExperienceConfigDefaults]);

  /** Escape hatch: ADA theme + home, skip splash and character intro. */
  const skipToAdaExperience = useCallback(async () => {
    leavingSplashRef.current = true;
    persistSoftwarePortfolioOnly(false);
    setThemeMusicEnabled(false);
    await setThemeId("ada-first");
    markIntroCompleted();
    router.push(PORTFOLIO_PATH);
  }, [router, setThemeId, setThemeMusicEnabled]);

  useModalAccessibility(mounted, dialogRef, () => {
    void skipToAdaExperience();
  }, {
    pauseThemeMusic: false,
    // Focus the dialog shell, not the first radio — avoids a visible ring on load.
    autoFocus: false,
  });

  useEffect(() => {
    if (!mounted) return;
    dialogRef.current?.focus({ preventScroll: true });
  }, [mounted]);

  // After Continue/Back changes step, move focus to the new heading / first control.
  useEffect(() => {
    if (!mounted) return;
    const root = dialogRef.current;
    if (!root) return;
    const frame = window.requestAnimationFrame(() => {
      if (stepIndex === 0) {
        stepHeadingRef.current?.focus();
        return;
      }
      const firstControl = root.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      (firstControl ?? stepHeadingRef.current)?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, stepIndex]);

  const applyExperienceTheme = async (choice: ExperienceChoiceId) => {
    const nextTheme: ThemeId =
      choice === "software-only" ? "professional" : DEFAULT_THEME_ID;
    await setThemeId(nextTheme);
  };

  const finishSplash = async () => {
    leavingSplashRef.current = true;
    persistPrizeAnimationsEnabled(prizeAnimations);
    // Interactive → music on (pref defaults true); other paths keep pref (defaults false).
    setThemeMusicEnabled(musicPref);

    const softwareOnly = experience === "software-only";
    persistSoftwarePortfolioOnly(softwareOnly);

    try {
      window.sessionStorage.setItem(
        "portfolio.introSplashChoices",
        JSON.stringify({
          experience,
          themeMusic: musicPref,
          clickInteractions: clicksEnabled,
          modalInteractions: modalsEnabled,
          prizeAnimations,
        }),
      );
    } catch {
      /* private mode */
    }

    if (experience === "full") {
      await setThemeId(DEFAULT_THEME_ID);
      router.push(INTRO_PATH);
      return;
    }

    await applyExperienceTheme(experience);
    markIntroCompleted();
    router.push(PORTFOLIO_PATH);
  };

  const onContinue = async () => {
    playNavClick();
    if (!isLastStep) {
      // Stay on cyberpunk for the whole splash — theme applies only when leaving.
      setStepIndex((i) => Math.min(i + 1, stepCount - 1));
      return;
    }
    await finishSplash();
  };

  const onBack = () => {
    playNavClick();
    setStepIndex((i) => Math.max(0, i - 1));
  };

  const setClicks = (enabled: boolean) => {
    playIntroSoundOptionClick();
    if (enabled) setSoundEnabled(true);
    setClickInteractionsEnabled(enabled, { preview: false });
  };

  const setModals = (enabled: boolean) => {
    playIntroSoundOptionClick();
    if (enabled) setSoundEnabled(true);
    setContentWindowSoundsEnabled(enabled, { preview: false });
  };

  const setMusic = (enabled: boolean) => {
    playIntroSoundOptionClick();
    setMusicPref(enabled);
  };

  const setPrizeAnimationsPref = (enabled: boolean) => {
    playIntroSoundOptionClick();
    setPrizeAnimations(enabled);
    persistPrizeAnimationsEnabled(enabled);
  };

  if (!mounted) return null;

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
        <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-2">
          <SplashHeroArt art={art} />

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
            <div className="shrink-0 px-5 pt-5 sm:px-7 sm:pt-6">
              <p className="mb-2 hidden font-mono text-[10px] uppercase tracking-[0.28em] text-accent-300/80 lg:block">
                Portfolio - Aaron DuChateau
              </p>
              <p className="sr-only lg:hidden">Portfolio - Aaron DuChateau</p>
              <SplashStepHeader
                title={SPLASH_STEP_TITLES[stepIndex] ?? "Welcome"}
                titleId={titleId}
                headingRef={stepHeadingRef}
                stepIndex={stepIndex}
                stepCount={stepCount}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5">
              {stepIndex === 0 ? (
                <div className="max-w-md space-y-4 text-sm leading-relaxed text-surface-400">
                  {AARON_NOTE.split("\n\n").map((paragraph) => (
                    <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                  ))}
                </div>
              ) : stepIndex === 1 ? (
                <>
                  <p className="max-w-md text-sm leading-relaxed text-surface-400">
                    Which experience would you like to have?
                  </p>
                  <div className="mt-6">
                    <ThemeRadioGroup
                      name="intro-splash-experience"
                      ariaLabel="Which experience would you like to have?"
                      choices={EXPERIENCE_CHOICES}
                      value={experience}
                      onChange={(id) => {
                        if (id === "skip-fun") playSkipTheFunClick();
                        else playIntroSoundOptionClick();
                        setExperience(id as ExperienceChoiceId);
                      }}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <SoundToggleRow
                    label="Theme music"
                    enabled={musicPref}
                    onChange={setMusic}
                  />
                  <SoundToggleRow
                    label="Click Sounds"
                    enabled={clicksEnabled}
                    onChange={setClicks}
                  />
                  <SoundToggleRow
                    label="Content Window Sounds"
                    enabled={modalsEnabled}
                    onChange={setModals}
                  />
                  <SoundToggleRow
                    label="Prize Animations"
                    enabled={prizeAnimations}
                    onChange={setPrizeAnimationsPref}
                  />
                </div>
              )}
            </div>

            <footer className="shrink-0 border-t border-white/10 px-5 py-3 sm:px-7 sm:py-3.5">
              <div className="flex gap-2.5">
                {stepIndex > 0 ? (
                  <Button role="outline" size="lg" className="flex-1" onClick={onBack}>
                    Back
                  </Button>
                ) : null}
                <Button
                  role="primary"
                  size="lg"
                  className={stepIndex > 0 ? "flex-1" : "w-full"}
                  onClick={() => void onContinue()}
                >
                  Continue
                </Button>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
