"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LegacyPortfolioModal } from "@/components/LegacyPortfolioModal";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button, ModalFrame, SettingsGearIcon } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { requestAdaGuyExplainer } from "@/lib/adaGuyExplainer";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import {
  OPEN_OPTIONS_MENU_EVENT,
  clearOptionsSearch,
  navigateToOptions,
  parseOptionsSearch,
  type OptionsRouteState,
} from "@/lib/optionsRoute";
import { useActivity } from "@/activity/ActivityProvider";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";
import {
  isBaseClickUnlocked,
  isContentWindowSoundUnlocked,
  isThemeUnlocked,
} from "@/activity/milestonePrizes";
import { recordActivity } from "@/activity/tracker";
import { MenuLockChoiceButton } from "@/components/MenuLockChoiceButton";
import { ThemeLockedModal } from "@/components/ThemeLockedModal";
import { useTheme } from "@/theme/ThemeProvider";
import {
  BASE_CLICKS,
  CONTENT_WINDOW_SOUNDS,
  NO_SOUND_ID,
  playBoundNavClick,
  ZEEP_ZOOP_CLICK_ID,
  type BaseClickPreference,
  type ContentWindowPreference,
} from "@/theme/sounds";
import { THEME_IDS, THEME_LABELS, type ThemeId } from "@/theme/types";

type Submenu = "themes" | "versions" | "sounds" | "my-events" | null;
type SoundCategory = "base-clicks" | "content-windows" | null;
type SiteVersion = "v1" | "v2";

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export { OPEN_OPTIONS_MENU_EVENT, requestOptionsMenu } from "@/lib/optionsRoute";

export function OptionsMenu() {
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [submenu, setSubmenu] = useState<Submenu>(null);
  const [soundCategory, setSoundCategory] = useState<SoundCategory>(null);
  const [siteVersion, setSiteVersion] = useState<SiteVersion>("v2");
  const [legacyOpen, setLegacyOpen] = useState(false);
  const [zeepConfirmOpen, setZeepConfirmOpen] = useState(false);
  const [restoreDefaultsConfirmOpen, setRestoreDefaultsConfirmOpen] = useState(false);
  const [resetPointsConfirmOpen, setResetPointsConfirmOpen] = useState(false);
  const [lockedPrompt, setLockedPrompt] = useState(false);
  const { reset: resetActivityStore, unlockedMilestoneIds } = useActivity();
  const {
    themeId,
    setThemeId,
    baseClickId,
    setBaseClickId,
    contentWindowSoundId,
    setContentWindowSoundId,
    playNavClick,
    restoreSoundEffectDefaults,
  } = useTheme();

  const applyRouteState = (state: OptionsRouteState) => {
    setOpen(true);
    setSubmenu(state.panel);
    setSoundCategory(state.panel === "sounds" ? state.soundCategory : null);
  };

  const closeMenu = () => {
    setOpen(false);
    setSubmenu(null);
    setSoundCategory(null);
    clearOptionsSearch({ replace: true });
  };

  useEffect(() => {
    const onOpenRequest = (event: Event) => {
      const detail = (event as CustomEvent<OptionsRouteState | null>).detail;
      if (detail?.panel) {
        applyRouteState(detail);
        return;
      }
      setSubmenu(null);
      setSoundCategory(null);
      setOpen(true);
    };
    const syncFromUrl = () => {
      const parsed = parseOptionsSearch(window.location.search);
      if (parsed.panel) applyRouteState(parsed);
    };
    syncFromUrl();
    window.addEventListener(OPEN_OPTIONS_MENU_EVENT, onOpenRequest);
    window.addEventListener("popstate", syncFromUrl);
    return () => {
      window.removeEventListener(OPEN_OPTIONS_MENU_EVENT, onOpenRequest);
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  useEffect(() => {
    if (
      !open ||
      zeepConfirmOpen ||
      restoreDefaultsConfirmOpen ||
      resetPointsConfirmOpen ||
      lockedPrompt
    ) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, zeepConfirmOpen, restoreDefaultsConfirmOpen, resetPointsConfirmOpen, lockedPrompt]);

  const toggleMenu = () => {
    if (open) {
      closeMenu();
      return;
    }
    setSubmenu(null);
    setSoundCategory(null);
    setOpen(true);
  };

  const toggleSubmenu = (next: Exclude<Submenu, null>) => {
    playNavClick();
    setSubmenu((prev) => {
      const nextPanel = prev === next ? null : next;
      if (next === "sounds" && prev !== "sounds") setSoundCategory(null);
      if (nextPanel) {
        navigateToOptions(
          {
            panel: nextPanel,
            soundCategory: nextPanel === "sounds" ? soundCategory : null,
          },
          { replace: true },
        );
      } else {
        clearOptionsSearch({ replace: true });
      }
      return nextPanel;
    });
  };

  const toggleSoundCategory = (next: Exclude<SoundCategory, null>) => {
    playNavClick();
    setSoundCategory((prev) => {
      const nextCat = prev === next ? null : next;
      navigateToOptions({ panel: "sounds", soundCategory: nextCat }, { replace: true });
      return nextCat;
    });
  };

  const pickTheme = (id: ThemeId) => {
    if (!isThemeUnlocked(id, unlockedMilestoneIds)) {
      closeMenu();
      setLockedPrompt(true);
      return;
    }
    const switchingToAda = id === "ada-first" && themeId !== "ada-first";
    setThemeId(id, { trackActivity: true });
    closeMenu();
    scrollToTop();
    if (switchingToAda) requestAdaGuyExplainer();
  };

  const pickSiteVersion = (version: SiteVersion) => {
    playNavClick();
    setSiteVersion(version);
    if (version === "v1") {
      closeMenu();
      setLegacyOpen(true);
      return;
    }
    // v2 is this site — stay here.
    closeMenu();
  };

  const pickBaseClick = (id: BaseClickPreference) => {
    if (id !== NO_SOUND_ID && !isBaseClickUnlocked(id, unlockedMilestoneIds)) {
      openEasterEggBoard();
      return;
    }
    if (id === ZEEP_ZOOP_CLICK_ID && baseClickId !== ZEEP_ZOOP_CLICK_ID) {
      closeMenu();
      setZeepConfirmOpen(true);
      return;
    }
    setBaseClickId(id);
  };

  const pickContentWindowSound = (id: ContentWindowPreference) => {
    if (id !== NO_SOUND_ID && !isContentWindowSoundUnlocked(id, unlockedMilestoneIds)) {
      openEasterEggBoard();
      return;
    }
    setContentWindowSoundId(id);
  };

  const confirmZeepZoop = () => {
    setBaseClickId(ZEEP_ZOOP_CLICK_ID);
    setZeepConfirmOpen(false);
    void recordActivity({
      type: "sound.zeepEnable",
      contentId: ZEEP_ZOOP_CLICK_ID,
      label: "Zeep Zoop enabled",
    });
  };

  const confirmRestoreDefaults = () => {
    restoreSoundEffectDefaults();
    setRestoreDefaultsConfirmOpen(false);
  };

  const confirmResetPoints = () => {
    resetActivityStore();
    setResetPointsConfirmOpen(false);
  };

  const openEventLog = () => {
    playNavClick();
    closeMenu();
    navigateToRouteModal("demos", "my-events");
  };

  const openEasterEggBoard = () => {
    playNavClick();
    closeMenu();
    requestEasterEggBoard();
  };

  const promptResetPoints = () => {
    playNavClick();
    closeMenu();
    setResetPointsConfirmOpen(true);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        role="nav"
        size="sm"
        className="h-9 gap-1.5"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label="Settings"
        onClick={toggleMenu}
      >
        <SettingsGearIcon className="h-5 w-5 shrink-0" />
        Settings
      </Button>

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Settings"
          className="options-menu-panel absolute right-0 top-[calc(100%+0.4rem)] z-[60] max-h-[min(70dvh,28rem)] min-w-[14rem] overflow-y-auto overscroll-contain border border-white/10 bg-surface-950/95 p-2 shadow-xl shadow-black/40"
        >
          <MenuRow
            label="Themes"
            expanded={submenu === "themes"}
            onClick={() => toggleSubmenu("themes")}
          />
          {submenu === "themes" ? (
            <div className="mb-1 ml-1 space-y-0.5 border-l border-white/10 pl-2" role="group" aria-label="Themes">
              {THEME_IDS.map((id) => (
                <MenuLockChoiceButton
                  key={id}
                  selected={themeId === id}
                  locked={!isThemeUnlocked(id, unlockedMilestoneIds)}
                  onClick={() => pickTheme(id)}
                  label={THEME_LABELS[id]}
                />
              ))}
            </div>
          ) : null}

          <MenuRow
            label="Site versions"
            expanded={submenu === "versions"}
            onClick={() => toggleSubmenu("versions")}
          />
          {submenu === "versions" ? (
            <div
              className="mb-1 ml-1 space-y-0.5 border-l border-white/10 pl-2"
              role="group"
              aria-label="Site versions"
            >
              <ChoiceButton
                selected={siteVersion === "v1"}
                onClick={() => pickSiteVersion("v1")}
                label="V1 · classic archive"
              />
              <ChoiceButton
                selected={siteVersion === "v2"}
                onClick={() => pickSiteVersion("v2")}
                label="V2 · this site"
              />
            </div>
          ) : null}

          <MenuRow
            label="Sound Effects"
            expanded={submenu === "sounds"}
            onClick={() => toggleSubmenu("sounds")}
          />
          {submenu === "sounds" ? (
            <div className="ml-1 space-y-0.5 border-l border-white/10 pl-2" role="group" aria-label="Sound Effects">
              <MenuRow
                label="Base Clicks"
                expanded={soundCategory === "base-clicks"}
                onClick={() => toggleSoundCategory("base-clicks")}
              />
              {soundCategory === "base-clicks" ? (
                <div
                  className="mb-1 ml-1 space-y-0.5 border-l border-white/10 pl-2"
                  role="group"
                  aria-label="Base Clicks"
                >
                  <ChoiceButton
                    selected={baseClickId === NO_SOUND_ID}
                    onClick={() => pickBaseClick(NO_SOUND_ID)}
                    label="No Sound"
                  />
                  {BASE_CLICKS.map((click) => (
                    <MenuLockChoiceButton
                      key={click.id}
                      selected={baseClickId === click.id}
                      locked={!isBaseClickUnlocked(click.id, unlockedMilestoneIds)}
                      onClick={() => pickBaseClick(click.id)}
                      label={click.label}
                    />
                  ))}
                </div>
              ) : null}

              <MenuRow
                label="Content Windows"
                expanded={soundCategory === "content-windows"}
                onClick={() => toggleSoundCategory("content-windows")}
              />
              {soundCategory === "content-windows" ? (
                <div
                  className="ml-1 space-y-0.5 border-l border-white/10 pl-2"
                  role="group"
                  aria-label="Content Windows"
                >
                  <ChoiceButton
                    selected={contentWindowSoundId === NO_SOUND_ID}
                    onClick={() => pickContentWindowSound(NO_SOUND_ID)}
                    label="No Sound"
                  />
                  {CONTENT_WINDOW_SOUNDS.map((sound) => (
                    <MenuLockChoiceButton
                      key={sound.id}
                      selected={contentWindowSoundId === sound.id}
                      locked={!isContentWindowSoundUnlocked(sound.id, unlockedMilestoneIds)}
                      onClick={() => pickContentWindowSound(sound.id)}
                      label={sound.label}
                    />
                  ))}
                </div>
              ) : null}

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  playNavClick();
                  closeMenu();
                  setRestoreDefaultsConfirmOpen(true);
                }}
                className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium text-surface-200 transition hover:bg-white/5 hover:text-white"
              >
                Restore defaults
              </button>
            </div>
          ) : null}

          <div className="my-1 border-t border-white/10" role="separator" />
          <MenuRow
            label="Your Event Log"
            expanded={submenu === "my-events"}
            onClick={() => toggleSubmenu("my-events")}
          />
          {submenu === "my-events" ? (
            <div
              className="mb-1 ml-1 space-y-0.5 border-l border-white/10 pl-2"
              role="group"
              aria-label="Your Event Log"
            >
              <SubmenuAction label="Event log" onClick={openEventLog} />
              <SubmenuAction label="Easter egg board" onClick={openEasterEggBoard} />
              <SubmenuAction label="Reset point count" onClick={promptResetPoints} />
            </div>
          ) : null}
        </div>
      ) : null}

      <ThemeLockedModal
        open={lockedPrompt}
        onCancel={() => setLockedPrompt(false)}
        onContinue={() => {
          setLockedPrompt(false);
          requestEasterEggBoard();
        }}
      />

      <ZeepZoopConfirmModal
        open={zeepConfirmOpen}
        onCancel={() => setZeepConfirmOpen(false)}
        onConfirm={confirmZeepZoop}
      />

      <OptionsConfirmModal
        open={restoreDefaultsConfirmOpen}
        onCancel={() => setRestoreDefaultsConfirmOpen(false)}
        onConfirm={confirmRestoreDefaults}
        eyebrow="Sound Effects"
        title="Restore defaults?"
        description="This resets Base Clicks and Content Windows to the native first-load selections. Your other sound settings (theme music, master mute) stay as they are."
        confirmLabel="Restore defaults"
      />

      <OptionsConfirmModal
        open={resetPointsConfirmOpen}
        onCancel={() => setResetPointsConfirmOpen(false)}
        onConfirm={confirmResetPoints}
        eyebrow="Your Event Log"
        title="Reset point count?"
        description="This clears your local activity score, awarded actions, and event log for this browser. Milestone progress resets too. This cannot be undone."
        confirmLabel="Reset point count"
      />

      <LegacyPortfolioModal
        open={legacyOpen}
        onClose={() => {
          setLegacyOpen(false);
          setSiteVersion("v2");
        }}
      />
    </div>
  );
}

function ZeepZoopConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility(open, dialogRef, onCancel);

  return (
    <ModalFrame
      open={open}
      onClose={onCancel}
      chrome="confirm"
      role="alertdialog"
      labelledBy="zeep-zoop-confirm-title"
      describedBy="zeep-zoop-confirm-desc"
      dialogRef={dialogRef}
    >
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={onCancel} size="sm" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">Sound warning</p>
      <h2
        id="zeep-zoop-confirm-title"
        className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl"
      >
        <span className="modal-display-heading__text">Zeep Zoop is… a lot</span>
      </h2>
      <p id="zeep-zoop-confirm-desc" className="mt-3 text-sm leading-relaxed text-surface-300">
        Fair warning: this click is deliberately obnoxious. It will fire on navigation and other
        UI actions across the site. Are you sure you want to use Zeep Zoop Click?
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          role="ghost"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onCancel();
          }}
        >
          No thanks
        </Button>
        <Button role="primary" size="sm" onClick={onConfirm}>
          Yes, I&rsquo;m sure
        </Button>
      </div>
    </ModalFrame>
  );
}

function OptionsConfirmModal({
  open,
  onCancel,
  onConfirm,
  eyebrow,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  eyebrow: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
}) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useModalAccessibility(open, dialogRef, onCancel);

  return (
    <ModalFrame
      open={open}
      onClose={onCancel}
      chrome="confirm"
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descId}
      dialogRef={dialogRef}
    >
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={onCancel} size="sm" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">{eyebrow}</p>
      <h2 id={titleId} className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl">
        <span className="modal-display-heading__text">{title}</span>
      </h2>
      <p id={descId} className="mt-3 text-sm leading-relaxed text-surface-300">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          role="ghost"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onCancel();
          }}
        >
          {cancelLabel}
        </Button>
        <Button
          role="primary"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onConfirm();
          }}
        >
          {confirmLabel}
        </Button>
      </div>
    </ModalFrame>
  );
}

function SubmenuAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      role="menuitem"
      data-track-ignore=""
      onClick={onClick}
      className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-xs font-medium text-surface-200 transition hover:bg-white/5 hover:text-white"
    >
      {label}
    </button>
  );
}

function MenuRow({
  label,
  expanded,
  onClick,
}: {
  label: string;
  expanded: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      aria-expanded={expanded}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs font-medium text-surface-200 transition hover:bg-white/5 hover:text-white"
    >
      <span>{label}</span>
      <span className="text-surface-500" aria-hidden>
        {expanded ? "▾" : "▸"}
      </span>
    </button>
  );
}

function ChoiceButton({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
        selected
          ? "bg-accent-500/15 font-semibold text-accent-200"
          : "text-surface-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          selected ? "bg-accent-400" : "bg-transparent ring-1 ring-white/25"
        }`}
        aria-hidden
      />
      {label}
    </button>
  );
}
