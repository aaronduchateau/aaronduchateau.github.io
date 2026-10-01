"use client";

import { useState } from "react";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";
import { isThemeUnlocked } from "@/activity/milestonePrizes";
import { useActivity } from "@/activity/ActivityProvider";
import { ThemeLockedModal } from "@/components/ThemeLockedModal";
import {
  clearThemePickerReturnToBoard,
  isThemePickerReturningToBoard,
  markEasterThemeOptinDone,
} from "@/lib/easterEggBoardRoute";
import { THEME_PALETTES } from "@/theme/palettes";
import { THEME_APPLY_CLOSE_DELAY_MS, useApplyTheme } from "@/hooks/useApplyTheme";
import { requestAdaGuyExplainer } from "@/lib/adaGuyExplainer";
import { requestInteractiveDemoClose } from "@/lib/interactiveDemoClose";
import {
  THEME_IDS,
  THEME_LABELS,
  type ThemeId,
} from "@/theme/types";
import { DemoPanel } from "../shared/DemoPanel";
import { MODAL_CHROME_PAD_X } from "@/lib/modalLayout";

export { INTERACTIVE_DEMO_REQUEST_CLOSE } from "@/lib/interactiveDemoClose";

const THEME_BLURBS: Record<ThemeId, string> = {
  cyberpunk: "Original glass + cyan neon — the default portfolio look.",
  "relic-guy": "Warm earth, gold accents, adventure-serifs, relic-hunter hero.",
  "psychedelic-hippie": "Violet night, magenta/lime glow, groovy Pacifico type.",
  "cursive-roman-empire": "Imperial marble tones with Great Vibes + Cinzel.",
  "ada-first": "White paper, black ink — max contrast, zero chrome.",
  professional:
    "Keynote stage plate, warm charcoal + ribbon cobalt — software focus only.",
  "conspiracy-theorist":
    "Evidence-board noir: corkboard browns, red-string accents, typewriter headlines.",
  "galaxy-guy":
    "Holo-bridge HUD: electric cyan, magenta nebula, Orbitron capsules — gesture glass.",
  atlantean:
    "Deep-sea command hologram: bioluminescent teal, trident bronze, classical Cormorant type.",
  "captain-guy":
    "Captain’s wheel hologram: candlelit amber, stone grit, Oswald title cards.",
  nerd:
    "Basement sanctuary: CRT phosphor green, star-map cyan HUD, VT323 keys — hello world energy.",
  "pop-art-guy":
    "Pop lithograph: canary yellow type, hot magenta, Ben-Day dots, razor-flat cutouts.",
  surrealist:
    "Dream parlor: melting soft-clock shapes, burgundy velvet, brass glow, Fell English ink.",
  "dog-days-guy":
    "Dog Days animation bay: warm wood, soft toy radii, Fredoka type, sunny orange + denim blue.",
  "retro-guy":
    "Retro beach bay: coin gold, pipe green, chunky red punches, Luckiest Guy type.",
};

function themeCardImage(id: ThemeId): string | null {
  return THEME_PALETTES[id].heroImage;
}

function ThemeSampleCard({
  themeId,
  selected,
  locked,
  onSelect,
  disabled,
}: {
  themeId: ThemeId;
  selected: boolean;
  locked: boolean;
  onSelect: (id: ThemeId) => void;
  disabled?: boolean;
}) {
  const src = themeCardImage(themeId);

  return (
    <button
      type="button"
      onClick={() => onSelect(themeId)}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={
        locked
          ? `${THEME_LABELS[themeId]} (locked)`
          : `Apply theme: ${THEME_LABELS[themeId]}`
      }
      className={`group flex flex-col overflow-hidden rounded-lg border text-left transition disabled:cursor-wait ${
        selected ? "border-accent-400/70 ring-1 ring-accent-400/40" : "border-white/10 hover:border-white/30"
      }`}
    >
      <span className="relative block aspect-[4/3] w-full overflow-hidden bg-black">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- static local theme asset
          <img
            src={src}
            alt=""
            loading="lazy"
            className={`h-full w-full object-cover object-left transition duration-300 ${
              locked ? "grayscale" : ""
            } ${selected ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}
          />
        ) : (
          <span
            className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-white text-black transition ${
              selected ? "opacity-100" : "opacity-90 group-hover:opacity-100"
            }`}
            aria-hidden
          >
            <span className="text-xs font-bold uppercase tracking-[0.2em]">ADA</span>
            <span className="h-px w-12 bg-black" />
            <span className="text-[10px] font-medium">High contrast</span>
          </span>
        )}
        {selected ? (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-accent-400 px-1.5 py-0.5 text-[9px] font-bold text-surface-950">
            ✓
          </span>
        ) : locked ? (
          <span className="absolute right-1.5 top-1.5 rounded-full bg-surface-950/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-surface-200">
            Locked
          </span>
        ) : null}
      </span>
      <span className="flex flex-col gap-0.5 px-2.5 py-2">
        <span className="text-xs font-semibold text-surface-200">{THEME_LABELS[themeId]}</span>
        <span className="text-[10px] leading-snug text-surface-500">{THEME_BLURBS[themeId]}</span>
      </span>
    </button>
  );
}

export function ThemePickerDemo() {
  const { themeId, applyTheme } = useApplyTheme();
  const { unlockedMilestoneIds } = useActivity();
  const [pending, setPending] = useState(false);
  const [lockedPrompt, setLockedPrompt] = useState(false);

  const pickTheme = (id: ThemeId) => {
    if (pending) return;
    const returnToBoard = isThemePickerReturningToBoard();
    if (returnToBoard) {
      markEasterThemeOptinDone();
      clearThemePickerReturnToBoard();
      setPending(true);
      applyTheme(id, { closeModal: true, scrollToTop: false, trackActivity: true });
      window.setTimeout(() => setPending(false), 500);
      return;
    }
    if (!isThemeUnlocked(id, unlockedMilestoneIds)) {
      setLockedPrompt(true);
      return;
    }
    const switchingToAda = id === "ada-first" && themeId !== "ada-first";
    setPending(true);
    applyTheme(id, { trackActivity: true });
    window.setTimeout(() => setPending(false), 500);
    if (switchingToAda) {
      window.setTimeout(() => requestAdaGuyExplainer(), THEME_APPLY_CLOSE_DELAY_MS + 80);
    }
  };

  return (
    <DemoPanel title="Theme playground">
      <div
        className={`flex h-full min-h-0 flex-col gap-4 overflow-y-auto overscroll-contain pr-1 ${MODAL_CHROME_PAD_X}`}
      >
        <p className="shrink-0 text-sm leading-relaxed text-surface-400">
          Pick a visual theme. Choices apply site-wide through the same rules-engine tokens
          used in Options → Themes — including hero art, radii, and type.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {THEME_IDS.map((id) => (
            <ThemeSampleCard
              key={id}
              themeId={id}
              selected={themeId === id}
              locked={!isThemeUnlocked(id, unlockedMilestoneIds)}
              onSelect={pickTheme}
              disabled={pending}
            />
          ))}
        </div>
        <p className="shrink-0 text-[11px] text-surface-500">
          Active: <span className="font-semibold text-surface-300">{THEME_LABELS[themeId]}</span>
        </p>
      </div>
      <ThemeLockedModal
        open={lockedPrompt}
        onCancel={() => setLockedPrompt(false)}
        onContinue={() => {
          setLockedPrompt(false);
          requestInteractiveDemoClose();
          window.setTimeout(() => requestEasterEggBoard(), 80);
        }}
      />
    </DemoPanel>
  );
}
