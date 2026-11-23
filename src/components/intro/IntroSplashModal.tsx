"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  persistPrizeAnimationsEnabled,
  readPrizeAnimationsEnabled,
} from "@/activity/prizeAnimationsPref";
import { ThemeRadioGroup, type ThemeRadioChoice } from "@/components/ThemeRadioOption";
import { Button } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { markIntroCompleted, shouldSkipIntroShellLaunch } from "@/lib/introGate";
import { persistSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import { INTRO_PATH, PORTFOLIO_PATH } from "@/lib/routes";
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

type SplashHeroArtProps = {
  art: string | null;
};

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
    </div>
  );
}

type Props = {
  /** Hero art override; defaults to current theme hero (Software Guy for ADA). */
  imageSrc?: string | null;
};

/**
 * Start-over screen only. One choice: which experience to begin again with.
 * Welcome lives in Config → About Site. Continue routes by the choice
 * (full → loadout; software / skip-fun → portfolio).
 */
export function IntroSplashModal({ imageSrc }: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
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
  const [experience, setExperience] = useState<ExperienceChoiceId>("full");
  /** Applied when leaving. Playback stays off while this screen is open. */
  const [musicPref, setMusicPref] = useState(true);
  const [prizeAnimations, setPrizeAnimations] = useState(true);
  const leavingSplashRef = useRef(false);

  const clicksEnabled = baseClickId !== NO_SOUND_ID;
  const modalsEnabled = contentWindowSoundId !== NO_SOUND_ID;

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
   * Fresh start — cyberpunk under the plate, bed silent until Continue.
   * Wait for ThemeProvider hydrate so a leftover preference cannot win.
   */
  useEffect(() => {
    if (!mounted || !themeReady || leavingSplashRef.current) return;
    void setThemeId(DEFAULT_THEME_ID);
    setSoundEnabled(true);
    setThemeMusicEnabled(false);
  }, [mounted, themeReady, setThemeId, setSoundEnabled, setThemeMusicEnabled]);

  useEffect(() => {
    if (!mounted || !themeReady || leavingSplashRef.current || !themeMusicEnabled) return;
    setThemeMusicEnabled(false);
  }, [mounted, themeReady, themeMusicEnabled, setThemeMusicEnabled]);

  useEffect(() => {
    applyExperienceConfigDefaults(experience);
  }, [experience, applyExperienceConfigDefaults]);

  /** Leave without picking. Does not force a theme. Music follows the current choice. */
  const leaveToPortfolio = useCallback(() => {
    leavingSplashRef.current = true;
    setThemeMusicEnabled(musicPref);
    markIntroCompleted();
    router.push(PORTFOLIO_PATH);
  }, [musicPref, router, setThemeMusicEnabled]);

  useModalAccessibility(mounted, dialogRef, leaveToPortfolio, {
    pauseThemeMusic: false,
    autoFocus: false,
  });

  useEffect(() => {
    if (!mounted) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [mounted]);

  const applyExperienceTheme = async (choice: ExperienceChoiceId) => {
    const nextTheme: ThemeId = choice === "software-only" ? "professional" : DEFAULT_THEME_ID;
    await setThemeId(nextTheme);
  };

  const finishSplash = async () => {
    leavingSplashRef.current = true;
    persistPrizeAnimationsEnabled(prizeAnimations);
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
    await finishSplash();
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
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.28em] text-accent-300/80">
                Portfolio - Aaron DuChateau
              </p>
              <h1
                id={titleId}
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-xl leading-none tracking-tight text-white outline-none sm:text-2xl lg:text-3xl"
              >
                Your Experience
              </h1>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 pt-4 sm:px-7 sm:pb-6 sm:pt-5">
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
            </div>

            <footer className="shrink-0 border-t border-white/10 px-5 py-3 sm:px-7 sm:py-3.5">
              <Button role="primary" size="lg" className="w-full" onClick={() => void onContinue()}>
                Continue
              </Button>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
