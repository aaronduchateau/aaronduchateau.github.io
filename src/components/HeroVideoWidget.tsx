"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { createPortal } from "react-dom";
import {
  cueForTime,
  cueIndexForTime,
  cueSegmentProgress,
  heroIntroVideoContentId,
  heroVideoWidget,
  resolveHeroLearnMore,
  type HeroVideoCue,
  type HeroVideoVariant,
  type HeroVideoVariantId,
} from "@/data/heroVideoWidget";
import { TESTIMONIALS_MODAL_NAMESPACE } from "@/data/content";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { recordActivity } from "@/activity/tracker";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { focusCareerTimeline } from "@/lib/careerTimelineFocus";
import { MODAL_CHROME_PAD_X, MODAL_TOPBAR_PAD_X } from "@/lib/modalLayout";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import { useMobileOnlyViewport } from "@/hooks/useMediaQuery";
import {
  fitPlayerToHost,
  formatVideoTime,
  getYouTubeApiIfReady,
  loadYouTubeApi,
  SCRUB_SEEK_THROTTLE_MS,
  VideoPauseIcon,
  VideoPlayIcon,
  YT_ENDED,
  YT_PLAYING,
  type YtNamespace,
  type YtPlayer,
} from "@/lib/youtubeIframeApi";
import { useTheme } from "@/theme/ThemeProvider";

/** Wait after the trailer ends before the Learn more shimmer. */
const LEARN_SHIMMER_DELAY_MS = 1000;

type Stage = "idle" | "choose" | "loading" | "revealed";

function ExpandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function CollapseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
    </svg>
  );
}

/** Geometry-based landscape — used only to arrange the expanded overlay. */
function useIsLandscape() {
  const [landscape, setLandscape] = useState(false);
  useEffect(() => {
    const sync = () => setLandscape(window.innerWidth > window.innerHeight);
    const syncSoon = () => {
      sync();
      window.requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", syncSoon);
    window.visualViewport?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", syncSoon);
      window.visualViewport?.removeEventListener("resize", sync);
    };
  }, []);
  return landscape;
}

export function HeroVideoWidget() {
  const { visibility, playNavClick, holdThemeMusic, releaseThemeMusicHold } = useTheme();
  const hostId = useId().replace(/:/g, "");
  const hostElementId = `hero-yt-${hostId}`;
  /** Layout placeholder in the card / fullscreen shell — stage root is positioned over this. */
  const measureRef = useRef<HTMLDivElement | null>(null);
  const slotRef = useRef<HTMLDivElement | null>(null);
  /** Persistent YouTube host — stays under the stable stage root (never reparented on expand). */
  const ytHostRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const scrubbingRef = useRef(false);
  const pendingScrubTimeRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const cueTimerBarRef = useRef<HTMLDivElement | null>(null);
  const readyRef = useRef(false);
  const playingRef = useRef(false);
  const stageRef = useRef<Stage>("idle");
  const variantIdRef = useRef<HeroVideoVariantId | null>(null);
  const pixelsUnlockedRef = useRef(false);
  const learnShimmerTimerRef = useRef<number | null>(null);
  /** One-shot marker at 3.28s — independent of the cover fade. */
  const pomegranateLoggedRef = useRef(false);
  const mountGenRef = useRef(0);
  const unmuteOnceRef = useRef(false);
  /** User earned unmuted playback — restore after layout sync if the browser remutes. */
  const wantsUnmutedRef = useRef(false);
  const resumeAtRef = useRef(0);
  /** Stable body node for the video stage portal — never destroyed on expand. */
  const stageRootRef = useRef<HTMLDivElement | null>(null);

  const [stage, setStage] = useState<Stage>("idle");
  const [variantId, setVariantId] = useState<HeroVideoVariantId | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  /** True only after accurate playhead samples clear introHiddenSeconds. */
  const [pixelsUnlocked, setPixelsUnlocked] = useState(false);
  const [learnShimmer, setLearnShimmer] = useState(false);
  /** Full-viewport overlay toggled by the expand control / X. */
  const [expanded, setExpanded] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [stageRoot, setStageRoot] = useState<HTMLDivElement | null>(null);
  const isLandscape = useIsLandscape();
  const isMobile = useMobileOnlyViewport();

  useEffect(() => {
    const root = document.createElement("div");
    root.setAttribute("data-hero-video-stage-root", "");
    root.style.position = "fixed";
    root.style.pointerEvents = "none";
    root.style.overflow = "hidden";
    root.style.zIndex = "40";
    document.body.appendChild(root);
    stageRootRef.current = root;
    setStageRoot(root);
    setPortalReady(true);
    return () => {
      root.remove();
      stageRootRef.current = null;
      setStageRoot(null);
    };
  }, []);

  stageRef.current = stage;
  variantIdRef.current = variantId;
  pixelsUnlockedRef.current = pixelsUnlocked;
  readyRef.current = ready;
  playingRef.current = playing;

  const isNonInteractive = variantId === "nonInteractive";
  const introHidden = heroVideoWidget.introHiddenSeconds;
  const fadeStart = heroVideoWidget.coverFadeStartSeconds;
  const fadeDuration = heroVideoWidget.coverFadeDurationSeconds;
  /** Non-interactive: pin to the first cue (Testimonials) only. */
  const cue: HeroVideoCue = isNonInteractive
    ? heroVideoWidget.cues[0]
    : cueForTime(current);
  /**
   * Interactive: cyan fill = progress through the active cue window.
   * Non-interactive: no cyan bar — just the neutral solid hairline track.
   */
  const dividerFill = isNonInteractive ? 0 : (cueSegmentProgress(current) ?? 0);
  const dividerFillVisible = !isNonInteractive && cueSegmentProgress(current) != null;

  const playerMounted = stage === "loading" || stage === "revealed";
  /** Expanded + landscape → side-by-side; expanded + portrait → stacked overlay. */
  const expandedLandscape = expanded && isLandscape;

  useBodyScrollLock(expanded, { pauseThemeMusic: false });

  /**
   * Player keeps running underneath with sound.
   * Loading cover stays mounted through the fade (opacity from playhead).
   * Mode chooser: initial pick (`choose`) OR scrub back before the intro gate.
   */
  const showSelectionOverlay =
    stage === "choose" || (stage === "revealed" && !pixelsUnlocked);

  const loadingCoverOpacity =
    stage !== "loading"
      ? 0
      : current < fadeStart
        ? 1
        : Math.max(0, 1 - (current - fadeStart) / fadeDuration);

  const paintCueTimerBar = useCallback((timeSeconds: number) => {
    const bar = cueTimerBarRef.current;
    if (!bar) return;
    if (variantIdRef.current === "nonInteractive") {
      bar.hidden = true;
      bar.style.transform = "scaleX(0)";
      return;
    }
    const seg = cueSegmentProgress(timeSeconds);
    if (seg == null) {
      bar.style.transform = "scaleX(0)";
      bar.hidden = true;
      return;
    }
    bar.hidden = false;
    bar.style.transform = `scaleX(${seg})`;
  }, []);

  const clearLearnShimmer = useCallback(() => {
    if (learnShimmerTimerRef.current != null) {
      window.clearTimeout(learnShimmerTimerRef.current);
      learnShimmerTimerRef.current = null;
    }
    setLearnShimmer(false);
  }, []);

  const scheduleLearnShimmer = useCallback(() => {
    clearLearnShimmer();
    learnShimmerTimerRef.current = window.setTimeout(() => {
      setLearnShimmer(true);
      learnShimmerTimerRef.current = null;
    }, LEARN_SHIMMER_DELAY_MS);
  }, [clearLearnShimmer]);

  const destroyPlayer = useCallback((opts?: { clearUnlock?: boolean }) => {
    try {
      playerRef.current?.destroy();
    } catch {
      /* already gone */
    }
    playerRef.current = null;
    clearLearnShimmer();
    setReady(false);
    setPlaying(false);
    if (opts?.clearUnlock !== false) {
      setPixelsUnlocked(false);
    }
    unmuteOnceRef.current = false;
    wantsUnmutedRef.current = false;
  }, [clearLearnShimmer]);

  /** YouTube host stays inside the stable stage root — expand only moves the CSS box. */
  const ensureHostElement = useCallback((): HTMLElement | null => {
    if (typeof document === "undefined") return null;

    let host =
      (document.getElementById(hostElementId) as HTMLDivElement | null) ??
      ytHostRef.current;

    // Prefer the live connected host already under the slot (never pull an
    // iframe-bearing node across trees — that triggers HierarchyRequestError).
    if (slotRef.current) {
      const inSlot = slotRef.current.querySelector(`#${CSS.escape(hostElementId)}`);
      if (inSlot instanceof HTMLDivElement) {
        ytHostRef.current = inSlot;
        return inSlot;
      }
    }

    if (!host || !document.contains(host) || host.querySelector("iframe")) {
      // Create a fresh shell only when missing/detached. Do not relocate a live
      // iframe host — the stable stage root keeps that node put.
      if (host?.querySelector("iframe") && document.contains(host)) {
        ytHostRef.current = host;
        return host;
      }
      host = document.createElement("div");
      host.id = hostElementId;
      host.className =
        "pointer-events-none absolute inset-0 z-0 h-full w-full [&_iframe]:pointer-events-none";
      ytHostRef.current = host;
    } else {
      ytHostRef.current = host;
    }

    const slot = slotRef.current;
    if (slot && host.parentElement !== slot) {
      slot.appendChild(host);
    }
    return host;
  }, [hostElementId]);

  const restoreHeroAudio = useCallback(() => {
    if (!wantsUnmutedRef.current) return;
    const player = playerRef.current;
    if (!player) return;
    try {
      player.unMute();
    } catch {
      /* autoplay policies may keep mute */
    }
    if (playingRef.current) {
      try {
        player.playVideo();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const syncStageRootToMeasure = useCallback(() => {
    const root = stageRootRef.current;
    const measure = measureRef.current;
    if (!root || !measure) return;
    const rect = measure.getBoundingClientRect();
    const width = Math.max(0, rect.width);
    const height = Math.max(0, rect.height);
    root.style.top = `${Math.round(rect.top)}px`;
    root.style.left = `${Math.round(rect.left)}px`;
    root.style.width = `${Math.round(width)}px`;
    root.style.height = `${Math.round(height)}px`;
    root.style.zIndex = expanded ? "210" : "40";
    root.style.pointerEvents = "auto";
    root.style.opacity = width < 2 || height < 2 ? "0" : "1";
    if (!expanded) {
      const radius = getComputedStyle(measure).borderRadius;
      root.style.borderRadius = radius && radius !== "0px" ? radius : "0px";
    } else {
      root.style.borderRadius = "0px";
    }
    fitPlayerToHost(hostElementId, playerRef.current);
  }, [expanded, hostElementId]);

  const startPlayback = useCallback((player: YtPlayer, opts?: { unmute?: boolean }) => {
    try {
      if (opts?.unmute) {
        wantsUnmutedRef.current = true;
        unmuteOnceRef.current = true;
        player.unMute();
      }
      player.playVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const tryUnmute = useCallback((player: YtPlayer) => {
    if (unmuteOnceRef.current) return;
    unmuteOnceRef.current = true;
    wantsUnmutedRef.current = true;
    try {
      player.unMute();
    } catch {
      /* autoplay policies may keep mute */
    }
  }, []);

  /**
   * Build the YT player synchronously when the API is already present.
   * Mobile WebKit drops play() that runs after `await loadYouTubeApi()`.
   */
  const mountPlayerWithApi = useCallback(
    (videoId: string, YT: YtNamespace, opts?: { prewarm?: boolean }) => {
      const prewarm = opts?.prewarm === true;
      const stageNow = stageRef.current;
      if (stageNow === "idle") return;
      if (prewarm && stageNow !== "choose") return;
      if (!prewarm && stageNow !== "loading" && stageNow !== "revealed" && stageNow !== "choose") {
        return;
      }

      const startAt = Math.max(0, resumeAtRef.current);
      const pastIntro = startAt >= heroVideoWidget.introHiddenSeconds;
      if (!prewarm && pastIntro) {
        pixelsUnlockedRef.current = true;
        setPixelsUnlocked(true);
        if (
          stageRef.current === "loading" &&
          startAt >=
            heroVideoWidget.coverFadeStartSeconds +
              heroVideoWidget.coverFadeDurationSeconds
        ) {
          setStage("revealed");
        }
      }

      const gen = ++mountGenRef.current;
      destroyPlayer({ clearUnlock: prewarm ? false : !pastIntro });
      if (!prewarm) {
        if (pastIntro) {
          pixelsUnlockedRef.current = true;
          setPixelsUnlocked(true);
        } else {
          setPixelsUnlocked(false);
        }
      }

      const host = ensureHostElement();
      if (!host) return;

      host.replaceChildren();
      const mount = document.createElement("div");
      mount.style.width = "100%";
      mount.style.height = "100%";
      host.appendChild(mount);

      const player = new YT.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: typeof window !== "undefined" ? window.location.origin : "",
          start: startAt > 0 ? Math.floor(startAt) : 0,
        },
        events: {
          onReady: (event) => {
            if (gen !== mountGenRef.current) return;
            const st = stageRef.current;
            if (st === "idle") return;
            const live = document.getElementById(hostElementId);
            if (live instanceof HTMLDivElement) ytHostRef.current = live;
            playerRef.current = event.target;
            try {
              event.target.unloadModule?.("captions");
            } catch {
              /* captions module optional */
            }
            const d = event.target.getDuration();
            if (Number.isFinite(d)) setDuration(d);
            if (startAt > 0) {
              try {
                event.target.seekTo(startAt, true);
              } catch {
                /* ignore */
              }
            }
            if (!prewarm && pastIntro) {
              pixelsUnlockedRef.current = true;
              setPixelsUnlocked(true);
            }
            setReady(true);
            fitPlayerToHost(hostElementId, event.target);
            // Prewarm under the chooser stays muted; keep the engine warm for the next tap.
            startPlayback(event.target, { unmute: false });
            if (prewarm && stageRef.current === "choose") {
              try {
                event.target.pauseVideo();
              } catch {
                /* ignore */
              }
            }
          },
          onStateChange: (event) => {
            const ended = event.data === (YT.PlayerState?.ENDED ?? YT_ENDED);
            const isPlaying = event.data === (YT.PlayerState?.PLAYING ?? YT_PLAYING);
            setPlaying(isPlaying);
            if (isPlaying && stageRef.current !== "choose") {
              tryUnmute(event.target);
            }
            if (ended) {
              scheduleLearnShimmer();
              const vid = variantIdRef.current;
              if (vid) {
                void recordActivity({
                  type: "video.complete",
                  contentId: heroIntroVideoContentId(vid),
                  label: "Portfolio intro video",
                });
              }
            }
          },
        },
      });
      playerRef.current = player;
    },
    [
      destroyPlayer,
      ensureHostElement,
      hostElementId,
      startPlayback,
      scheduleLearnShimmer,
      tryUnmute,
    ],
  );

  const mountPlayer = useCallback(
    async (videoId: string, opts?: { prewarm?: boolean }) => {
      const YT = await loadYouTubeApi();
      if (stageRef.current === "idle") return;
      if (opts?.prewarm && stageRef.current !== "choose") return;
      mountPlayerWithApi(videoId, YT, opts);
    },
    [mountPlayerWithApi],
  );

  useEffect(() => {
    void loadYouTubeApi();
    return () => {
      mountGenRef.current += 1;
      try {
        playerRef.current?.destroy();
      } catch {
        /* already gone */
      }
      playerRef.current = null;
      ytHostRef.current?.remove();
      ytHostRef.current = null;
    };
  }, []);

  // Keep the stable stage root glued to the card / fullscreen measure box.
  useLayoutEffect(() => {
    ensureHostElement();
    syncStageRootToMeasure();
    restoreHeroAudio();
    const raf = window.requestAnimationFrame(() => {
      syncStageRootToMeasure();
      restoreHeroAudio();
    });
    return () => window.cancelAnimationFrame(raf);
  }, [
    expanded,
    expandedLandscape,
    stage,
    ready,
    ensureHostElement,
    syncStageRootToMeasure,
    restoreHeroAudio,
  ]);

  useEffect(() => {
    const measure = measureRef.current;
    if (!measure) return;

    const sync = () => syncStageRootToMeasure();
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(measure);
    if (measure.parentElement) ro.observe(measure.parentElement);

    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, [expanded, expandedLandscape, portalReady, syncStageRootToMeasure]);

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let alive = true;
    let lastDuration = -1;

    const tick = () => {
      if (!alive) return;
      const stageNow = stageRef.current;
      if (stageNow !== "loading" && stageNow !== "revealed") {
        raf = window.requestAnimationFrame(tick);
        return;
      }

      const p = playerRef.current;
      if (p && !scrubbingRef.current) {
        try {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (Number.isFinite(d) && d > 0 && d !== lastDuration) {
            lastDuration = d;
            setDuration(d);
          }

          if (!pomegranateLoggedRef.current && Number.isFinite(t) && t >= 3.28) {
            pomegranateLoggedRef.current = true;
            console.log("pomegranate");
          }

          if (Number.isFinite(t) && t >= fadeStart) {
            if (!pixelsUnlockedRef.current) {
              setPixelsUnlocked(true);
              fitPlayerToHost(hostElementId, p);
            }
            if (
              stageRef.current === "loading" &&
              t >= fadeStart + fadeDuration
            ) {
              setStage("revealed");
            }
          } else if (t < introHidden) {
            if (pixelsUnlockedRef.current) {
              setPixelsUnlocked(false);
            }
          }

          paintCueTimerBar(t);
          setCurrent(t);
        } catch {
          /* ignore mid-destroy */
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [ready, introHidden, fadeStart, fadeDuration, paintCueTimerBar, hostElementId]);

  useEffect(() => {
    if (playing && !scrubbingRef.current) return;
    paintCueTimerBar(current);
  }, [current, playing, isNonInteractive, paintCueTimerBar]);

  useEffect(() => {
    if (playing) {
      holdThemeMusic("hero-intro-video");
      return () => releaseThemeMusicHold("hero-intro-video");
    }
    releaseThemeMusicHold("hero-intro-video");
  }, [playing, holdThemeMusic, releaseThemeMusicHold]);

  const toggleExpanded = useCallback(() => {
    playNavClick();
    setExpanded((open) => !open);
    // Expand click is a user gesture — restore audio in the same turn if needed.
    window.requestAnimationFrame(() => {
      syncStageRootToMeasure();
      restoreHeroAudio();
    });
  }, [playNavClick, syncStageRootToMeasure, restoreHeroAudio]);

  useEffect(() => {
    if (!expanded) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      toggleExpanded();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [expanded, toggleExpanded]);

  const openChooser = () => {
    playNavClick();
    stageRef.current = "choose";
    setStage("choose");
    // Phone: enter fullscreen immediately so chooser + playback share one shell.
    if (isMobile) setExpanded(true);
    // Preload API + muted player while the chooser is up so the variant tap can
    // call loadVideoById/playVideo synchronously (iOS WebKit gesture rules).
    void (async () => {
      await loadYouTubeApi();
      if (stageRef.current !== "choose") return;
      if (playerRef.current) return;
      const warmId = heroVideoWidget.variants[0]?.youtubeId;
      if (!warmId) return;
      const YT = getYouTubeApiIfReady();
      if (YT) {
        mountPlayerWithApi(warmId, YT, { prewarm: true });
        return;
      }
      void mountPlayer(warmId, { prewarm: true });
    })();
  };

  const selectVariant = (variant: HeroVideoVariant) => {
    playNavClick();
    resumeAtRef.current = 0;
    variantIdRef.current = variant.id;
    stageRef.current = "loading";
    setVariantId(variant.id);
    setStage("loading");
    setCurrent(0);
    setPixelsUnlocked(false);
    clearLearnShimmer();
    pomegranateLoggedRef.current = false;
    unmuteOnceRef.current = false;
    wantsUnmutedRef.current = false;
    paintCueTimerBar(0);

    // Keep play() inside this tap — awaiting the API on mobile drops the gesture.
    const existing = playerRef.current;
    if (existing?.loadVideoById) {
      try {
        existing.mute();
        existing.loadVideoById(variant.youtubeId);
        existing.playVideo();
        setReady(true);
        fitPlayerToHost(hostElementId, existing);
        return;
      } catch {
        /* fall through to remount */
      }
    }
    const YT = getYouTubeApiIfReady();
    if (YT) {
      mountPlayerWithApi(variant.youtubeId, YT);
      return;
    }
    void mountPlayer(variant.youtubeId);
  };

  const pausePlayback = useCallback(() => {
    if (!playingRef.current) return;
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* ignore */
    }
  }, []);

  const togglePlayback = useCallback(() => {
    if ((stageRef.current !== "loading" && stageRef.current !== "revealed") || !readyRef.current) {
      return;
    }
    const p = playerRef.current;
    if (!p) return;
    if (playingRef.current) {
      p.pauseVideo();
    } else {
      startPlayback(p, { unmute: true });
    }
  }, [startPlayback]);

  // Outside-tap pause only after the trailer is visible — not during chooser /
  // loading cover (mobile taps on mode buttons were racing a warm player).
  useEffect(() => {
    if (!playing || stage !== "revealed" || !pixelsUnlocked) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Element &&
        (target.closest("[data-hero-playback-toggle]") ||
          target.closest("[data-hero-expand-toggle]") ||
          target.closest("[data-hero-expand-chrome]") ||
          target.closest("[data-hero-variant-choice]") ||
          target.closest("[data-hero-selection-overlay]"))
      ) {
        return;
      }
      pausePlayback();
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, [playing, stage, pixelsUnlocked, pausePlayback]);

  useEffect(() => {
    if (stage !== "loading" && stage !== "revealed") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") return;
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) {
          return;
        }
      }
      event.preventDefault();
      togglePlayback();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, togglePlayback]);

  const applyScrubTime = useCallback(
    (value: number, forceSeek: boolean) => {
      if ((stageRef.current !== "loading" && stageRef.current !== "revealed") || !playerRef.current) {
        return;
      }
      setCurrent(value);
      paintCueTimerBar(value);
      pendingScrubTimeRef.current = value;

      if (value < introHidden) {
        if (pixelsUnlockedRef.current) setPixelsUnlocked(false);
      }

      const now = performance.now();
      if (forceSeek || now - lastSeekAtRef.current >= SCRUB_SEEK_THROTTLE_MS) {
        lastSeekAtRef.current = now;
        playerRef.current.seekTo(value, true);
      }
    },
    [introHidden, paintCueTimerBar],
  );

  const endScrub = useCallback((event?: ReactPointerEvent<HTMLInputElement>) => {
    if (!scrubbingRef.current) return;
    scrubbingRef.current = false;
    if (event?.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const pending = pendingScrubTimeRef.current;
    if (pending != null) {
      playerRef.current?.seekTo(pending, true);
      lastSeekAtRef.current = performance.now();
      pendingScrubTimeRef.current = null;
    }
  }, []);

  const onScrubPointerDown = (event: ReactPointerEvent<HTMLInputElement>) => {
    scrubbingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onScrubChange = (value: number) => {
    if (!ready) return;
    applyScrubTime(value, false);
  };

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const cueIndex = isNonInteractive ? 0 : cueIndexForTime(current);

  const onLearnMore = () => {
    playNavClick();
    pausePlayback();
    setExpanded(false);
    const target = resolveHeroLearnMore(cue, {
      cueIndex,
      isNonInteractive,
    });
    if (target.kind === "career-timeline") {
      focusCareerTimeline(target.workHistoryId, { pause: true });
      return;
    }
    navigateToRouteModal(target.namespace, target.key, {
      play: target.namespace === TESTIMONIALS_MODAL_NAMESPACE,
    });
  };

  // Inline card keeps the original swoop Learn more. Expanded uses a separate CTA
  // (never `.hero-learn-btn`) so fullscreen does not borrow ribbon chrome.
  const showSwoop = visibility.heroLearnMoreSwoop;
  const hasLearnMore = true;

  const inlineLearnMoreClassName = [
    showSwoop
      ? "hero-learn-btn shrink-0 text-sm font-semibold text-surface-950"
      : "hero-learn-btn theme-btn-shape inline-flex shrink-0 items-center px-4 text-sm font-semibold text-surface-950 shadow-lg shadow-accent-500/20",
    learnShimmer ? "hero-learn-btn--shimmer" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inlineLearnMoreControl = (
    <button type="button" onClick={onLearnMore} className={inlineLearnMoreClassName}>
      Learn more
    </button>
  );

  const expandedLearnMoreControl = (
    <button
      type="button"
      onClick={onLearnMore}
      className="theme-btn-shape theme-primary-cta inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold"
    >
      Learn more
    </button>
  );

  const exitFullscreen = useCallback(() => {
    playNavClick();
    setExpanded(false);
    window.requestAnimationFrame(() => {
      syncStageRootToMeasure();
      restoreHeroAudio();
    });
  }, [playNavClick, syncStageRootToMeasure, restoreHeroAudio]);

  /** Fullscreen-only — stays put (no cue slide-in) under Learn more. */
  const expandedGoBackControl = (
    <button
      type="button"
      onClick={exitFullscreen}
      className="theme-btn-shape theme-ghost-cta inline-flex w-full items-center justify-center px-4 py-2.5 text-sm font-semibold"
    >
      Go back
    </button>
  );

  const seekRow = (
    <div className={`flex items-center gap-2 py-2 ${expanded ? "px-2 sm:px-3" : "px-3"}`}>
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-surface-500">
        {formatVideoTime(current)}
      </span>
      <div
        role="progressbar"
        aria-label="Video playback progress"
        aria-valuemin={0}
        aria-valuemax={Math.max(1, Math.round(duration || 1))}
        aria-valuenow={Math.round(Math.min(current, duration || 0))}
        className="sr-only"
      />
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.1}
        value={Math.min(current, duration || 0)}
        disabled={!playerMounted || !ready || duration <= 0}
        aria-label="Seek video timeline"
        className="hero-video-seek h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
        style={{ "--seek-progress": `${progress * 100}%` } as CSSProperties}
        onPointerDown={onScrubPointerDown}
        onPointerUp={endScrub}
        onPointerCancel={endScrub}
        onChange={(e) => onScrubChange(Number(e.target.value))}
      />
      <span className="shrink-0 font-mono text-[10px] tabular-nums text-surface-500">
        {formatVideoTime(duration)}
      </span>
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        title={playing ? "Pause" : "Play"}
        disabled={!playerMounted || !ready}
        data-hero-playback-toggle=""
        onClick={togglePlayback}
        className="theme-btn-shape grid h-6 w-6 shrink-0 place-items-center text-accent-300 transition hover:bg-white/10 hover:text-accent-200 disabled:opacity-40"
      >
        {playing ? <VideoPauseIcon className="h-3 w-3" /> : <VideoPlayIcon className="h-3 w-3" />}
      </button>
      <button
        type="button"
        aria-label={expanded ? "Exit full screen" : "Full screen"}
        title={expanded ? "Exit full screen" : "Full screen"}
        data-hero-expand-toggle=""
        onClick={toggleExpanded}
        className="theme-btn-shape grid h-6 w-6 shrink-0 place-items-center text-accent-300 transition hover:bg-white/10 hover:text-accent-200"
      >
        {expanded ? <CollapseIcon className="h-3.5 w-3.5" /> : <ExpandIcon className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  const cueDivider = (
    <div
      className={`relative h-px w-full shrink-0 transition-opacity duration-300 ${
        isNonInteractive ? "bg-white/20" : "bg-white/10"
      } ${dividerFillVisible && !playing ? "opacity-50" : "opacity-100"}`}
      aria-hidden={!dividerFillVisible}
    >
      <div
        ref={cueTimerBarRef}
        role={dividerFillVisible ? "progressbar" : undefined}
        aria-label={dividerFillVisible ? "Interactive cue segment progress" : undefined}
        aria-valuemin={dividerFillVisible ? 0 : undefined}
        aria-valuemax={dividerFillVisible ? 100 : undefined}
        aria-valuenow={
          dividerFillVisible ? Math.round(Math.min(1, Math.max(0, dividerFill)) * 100) : undefined
        }
        className="absolute inset-y-0 left-0 w-full origin-left bg-accent-400"
        style={{ transform: `scaleX(${dividerFill})` }}
        hidden={!dividerFillVisible}
      />
    </div>
  );

  const cuePanelExpanded = (
    <div
      key={isNonInteractive ? "testimonials-static-expanded" : `expanded-${cue.triggerTime}`}
      className={
        expandedLandscape
          ? // Phone landscape stays compact; desktop fullscreen gets ~20% more cue width.
            `flex h-full min-h-0 w-[min(34%,14rem)] shrink-0 flex-col justify-center gap-3 border-l border-white/10 py-4 md:w-[min(42%,18rem)] ${MODAL_CHROME_PAD_X}`
          : `flex w-full flex-col gap-3 px-4 py-4 sm:px-5`
      }
    >
      <h2 className="hero-expand-cue-item hero-expand-cue-item--title shrink-0 font-display text-base font-semibold text-white sm:text-lg">
        {cue.title}
      </h2>
      {/* Interactive cue progress lives under the title in fullscreen; non-interactive skips it. */}
      {!isNonInteractive ? cueDivider : null}
      <p className="hero-expand-cue-item hero-expand-cue-item--desc min-h-0 text-sm leading-relaxed text-surface-300">
        {cue.description}
      </p>
      {hasLearnMore ? (
        <div className="hero-expand-cue-item hero-expand-cue-item--cta w-full">
          {expandedLearnMoreControl}
        </div>
      ) : null}
      <div className="w-full shrink-0">{expandedGoBackControl}</div>
    </div>
  );

  const cuePanelInline = (
    <div
      key={isNonInteractive ? "testimonials-static" : cue.triggerTime}
      className="hero-learn-cue-copy min-w-0 w-full"
    >
      <h2 className="hero-learn-cue-title font-display text-base font-semibold text-white sm:text-lg">
        <span className="hero-learn-cue-title__text">{cue.title}</span>
      </h2>
      <div className="hero-learn-cue-bottom flex min-w-0 items-end gap-3 sm:gap-4">
        <p className="min-w-0 flex-1 line-clamp-2 text-xs leading-relaxed text-surface-400 sm:text-sm">
          {cue.description}
        </p>
        {hasLearnMore ? (
          showSwoop ? (
            <div className="hero-learn-ribbon-front">
              {inlineLearnMoreControl}
              <span className="hero-learn-ribbon-extend" aria-hidden />
            </div>
          ) : (
            inlineLearnMoreControl
          )
        ) : null}
      </div>
    </div>
  );

  /** In-flow box the stable stage root is positioned over (card or fullscreen). */
  const measureBox = (
    <div
      ref={measureRef}
      className={
        expandedLandscape
          ? "relative min-h-0 w-full flex-1 overflow-hidden bg-surface-950"
          : "relative aspect-video w-full overflow-hidden bg-surface-950"
      }
      aria-hidden
    />
  );

  const videoStageContent = (
    <div className="relative h-full w-full overflow-hidden bg-surface-950">
      <div
        ref={slotRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full [&_iframe]:pointer-events-none [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!max-h-none [&_iframe]:!max-w-none [&_iframe]:border-0"
        aria-hidden={!pixelsUnlocked}
      />

      {stage === "idle" ? (
        <div className="absolute inset-0 z-10">
          <Image
            src={heroVideoWidget.posterSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 32rem"
            priority
          />
          <div className="absolute inset-0 bg-surface-950/45" aria-hidden />
          <button
            type="button"
            onClick={openChooser}
            aria-label="Play portfolio trailer"
            className="absolute inset-0 z-10 grid place-items-center"
          >
            <span
              className="theme-play-btn relative z-10 h-12 w-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14"
              aria-hidden
            >
              <span className="theme-play-triangle" />
            </span>
          </button>
        </div>
      ) : null}

      {showSelectionOverlay ? (
        <div className="absolute inset-0 z-20 bg-surface-950" data-hero-selection-overlay="">
          <Image
            src={heroVideoWidget.posterSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 32rem"
            priority
          />
          <div className="absolute inset-0 bg-surface-950" aria-hidden />
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 p-3 sm:gap-4 sm:p-6">
            <p className="sr-only md:not-sr-only md:block w-full max-w-md text-center font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
              Choose a viewing mode
            </p>
            <div
              className={`grid w-full gap-3 sm:gap-3.5 ${
                expanded ? "max-w-md" : "max-w-none"
              }`}
            >
              {heroVideoWidget.variants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  data-hero-variant-choice=""
                  onClick={() => selectVariant(variant)}
                  className={`theme-btn-shape group border px-4 py-3.5 text-left backdrop-blur-sm transition sm:px-5 sm:py-4 ${
                    variantId === variant.id
                      ? "border-accent-400/60 bg-surface-900/90"
                      : "border-white/15 bg-surface-950/70 hover:border-accent-400/50 hover:bg-surface-900/80"
                  }`}
                >
                  <span className="block font-display text-base font-semibold text-white sm:text-lg">
                    {variant.label}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-surface-400 sm:text-sm">
                    {variant.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {stage === "loading" ? (
        <div
          className="absolute inset-0 z-30 grid place-items-center bg-surface-950"
          style={{ opacity: loadingCoverOpacity }}
          role="status"
          aria-live="polite"
        >
          <div className="px-6 text-center">
            <p className="font-display text-lg font-semibold text-white sm:text-xl">
              Loading trailer…
            </p>
            <p className="mt-2 text-xs text-surface-400 sm:text-sm">
              {variantId === "interactive"
                ? "Preparing the interactive cut."
                : "Preparing the non-interactive cut."}
            </p>
          </div>
        </div>
      ) : null}

      {stage === "revealed" && pixelsUnlocked && playing ? (
        <button
          type="button"
          aria-label="Pause video"
          data-hero-playback-toggle=""
          onClick={togglePlayback}
          className="absolute inset-0 z-10 cursor-pointer bg-transparent"
        />
      ) : null}

      {stage === "revealed" && pixelsUnlocked && !playing ? (
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!ready}
          aria-label="Play video"
          data-hero-playback-toggle=""
          className="absolute inset-0 z-10 grid place-items-center disabled:cursor-wait"
        >
          <div className="absolute inset-0 bg-surface-950/45" aria-hidden />
          <span
            className="theme-play-btn relative z-10 h-12 w-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14"
            aria-hidden
          >
            <span className="theme-play-triangle" />
          </span>
        </button>
      ) : null}
    </div>
  );

  const playerChrome = (
    <>
      {measureBox}
      {seekRow}
    </>
  );

  // Cue + ribbon sit OUTSIDE `overflow-hidden` so the extend can meet the back adornment.
  const inlineCard = (
    <div
      className={`hero-video-widget relative w-full max-w-md lg:max-w-lg${
        !expanded && showSwoop && hasLearnMore ? " hero-video-widget--swoop" : ""
      }`}
    >
      {!expanded && showSwoop && hasLearnMore ? (
        <span className="hero-learn-ribbon-back" aria-hidden />
      ) : null}

      <div className="theme-glass relative z-10 overflow-visible shadow-2xl">
        <div className="theme-quote-aura pointer-events-none absolute -inset-1 -z-10 blur-lg" />
        {expanded ? (
          <div className="aspect-video w-full bg-surface-950" aria-hidden />
        ) : (
          <>
            <div className="overflow-hidden rounded-t-none">
              {measureBox}
              {seekRow}
            </div>
            {cueDivider}
            <div className="hero-learn-cue">{cuePanelInline}</div>
          </>
        )}
      </div>
    </div>
  );

  // Fullscreen chrome above SiteNav. Close sits above the video stage root (z-210).
  const expandedOverlay =
    expanded && portalReady
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex h-dvh max-h-dvh w-full overflow-hidden bg-surface-950"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio trailer"
          >
            <div
              data-hero-expand-chrome=""
              className={`pointer-events-none absolute inset-x-0 top-0 z-[220] flex h-14 items-center ${MODAL_TOPBAR_PAD_X}`}
            >
              <div className="pointer-events-auto">
                <ModalCloseButton onClick={exitFullscreen} ariaLabel="Exit full screen" />
              </div>
            </div>

            <div
              className={
                expandedLandscape
                  ? "flex h-full min-h-0 w-full flex-row"
                  : "flex h-full min-h-0 w-full flex-col overflow-y-auto overscroll-contain"
              }
            >
              <div
                className={
                  expandedLandscape
                    ? "flex min-h-0 min-w-0 flex-1 flex-col"
                    : "flex w-full shrink-0 flex-col"
                }
              >
                {playerChrome}
                {!expandedLandscape ? cuePanelExpanded : null}
              </div>
              {expandedLandscape ? cuePanelExpanded : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  const stagePortal =
    stageRoot && portalReady ? createPortal(videoStageContent, stageRoot) : null;

  return (
    <>
      {inlineCard}
      {expandedOverlay}
      {stagePortal}
    </>
  );
}
