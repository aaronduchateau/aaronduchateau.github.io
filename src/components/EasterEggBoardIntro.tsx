"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { readEasterThemeOptinDone } from "@/lib/easterEggBoardRoute";
import { readSoftwarePortfolioOnly } from "@/lib/softwarePortfolioPref";
import { Button } from "@/components/ui";
import { playBoundNavClick } from "@/theme/sounds";
import { useTheme } from "@/theme/ThemeProvider";

const SPLASH_SRC = "/cards/Aaron_DuChateau_splash_cards.png";

type EasterEggBoardIntroProps = {
  titleId?: string;
  descriptionId?: string;
  onBack: () => void;
  onContinue: () => void;
  /** Checked + Continue: open Interactive things theme playground (URL). */
  onEnterThemeGame?: () => void;
};

/**
 * Shared first screen for intro + main-site easter-egg boards.
 * Go back and Continue only — no extra chrome.
 */
export function EasterEggBoardIntro({
  titleId,
  descriptionId,
  onBack,
  onContinue,
  onEnterThemeGame,
}: EasterEggBoardIntroProps) {
  const { visibility } = useTheme();
  const [softwareOnly, setSoftwareOnly] = useState(false);
  const [optinDone, setOptinDone] = useState(false);
  const [enterThemeGame, setEnterThemeGame] = useState(false);

  useEffect(() => {
    setSoftwareOnly(readSoftwarePortfolioOnly());
    setOptinDone(readEasterThemeOptinDone());
  }, []);

  const showSoftwareModeOptIn =
    Boolean(onEnterThemeGame) &&
    softwareOnly &&
    visibility.softwareModeThemeGame &&
    !optinDone;

  return (
    <div className="theme-quest-board-intro">
      <div className="theme-quest-board-intro__scroll">
        <div className="theme-quest-board-intro__frame">
          <div className="theme-quest-board-intro__lead">
            <p className="theme-quest-board-intro__eyebrow">Easter egg board</p>
            <h2 id={titleId} className="theme-quest-board-intro__title">
              The Aaron game
            </h2>
          </div>
          <div className="theme-quest-board-intro__art theme-decorative">
            <Image
              src={SPLASH_SRC}
              alt=""
              width={1536}
              height={1024}
              className="theme-quest-board-intro__img"
              sizes="(min-width: 768px) 28rem, 90vw"
              priority
            />
          </div>
          <p id={descriptionId} className="theme-quest-board-intro__copy">
            Interact with Aaron&rsquo;s portfolio — watch, click, and try things.
            Some content might be locked by default! Finish a quest and you unlock a
            trading card or a new feature.
          </p>
        </div>
      </div>
      <div className="theme-quest-board-intro__actions">
        {showSoftwareModeOptIn ? (
          <div className="theme-software-mode-optin">
            <label className="theme-software-mode-optin__label">
              <input
                type="checkbox"
                checked={enterThemeGame}
                onChange={(event) => {
                  playBoundNavClick();
                  setEnterThemeGame(event.target.checked);
                }}
              />
              <span>Pick a different theme and enter the game</span>
            </label>
            <p className="theme-software-mode-optin__note">
              You are in software portfolio only mode. You will still be able to collect
              points, but your options may be limited.
            </p>
          </div>
        ) : null}
        <div className="theme-quest-board-intro__action-row">
          <Button
            role="outline"
            size="lg"
            className="flex-1"
            onClick={() => {
              playBoundNavClick();
              onBack();
            }}
          >
            Go back
          </Button>
          <Button
            role="primary"
            size="lg"
            className="flex-1"
            onClick={() => {
              playBoundNavClick();
              if (showSoftwareModeOptIn && enterThemeGame && onEnterThemeGame) {
                onEnterThemeGame();
                return;
              }
              onContinue();
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
