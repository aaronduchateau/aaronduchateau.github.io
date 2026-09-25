"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  fitPlayerToHost,
  formatVideoTime,
  loadYouTubeApi,
  SCRUB_SEEK_THROTTLE_MS,
  VideoPauseIcon,
  VideoPlayIcon,
  YT_ENDED,
  YT_PLAYING,
  type YtPlayer,
} from "@/lib/youtubeIframeApi";
import { playBoundNavClick } from "@/theme/sounds";

type Props = {
  youtubeId: string;
  startSeconds?: number;
  /** Accessible title for the player region. */
  title?: string;
  className?: string;
  /** Extra class on the seek row (defaults leave max width for the scrubber). */
  seekClassName?: string;
  /** Fired once when playback reaches the end. */
  onEnded?: () => void;
};

/**
 * Chromeless YouTube player with our timeline scrubber.
 * No YouTube chrome / hover UI — only a center play affordance when paused.
 */
export function ChromelessYouTubePlayer({
  youtubeId,
  startSeconds = 0,
  title = "Video",
  className = "",
  seekClassName = "",
  onEnded,
}: Props) {
  const reactId = useId().replace(/:/g, "");
  const hostId = `chrome-yt-${reactId}`;
  const playerRef = useRef<YtPlayer | null>(null);
  const scrubbingRef = useRef(false);
  const pendingScrubTimeRef = useRef<number | null>(null);
  const lastSeekAtRef = useRef(0);
  const youtubeIdRef = useRef(youtubeId);
  youtubeIdRef.current = youtubeId;
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const destroyPlayer = useCallback(() => {
    try {
      playerRef.current?.destroy();
    } catch {
      /* already gone */
    }
    playerRef.current = null;
    setReady(false);
    setPlaying(false);
  }, []);

  const mountPlayer = useCallback(
    async (videoId: string, autoplay: boolean) => {
      const YT = await loadYouTubeApi();
      if (youtubeIdRef.current !== videoId) return;

      destroyPlayer();

      const player = new YT.Player(hostId, {
        videoId,
        width: "100%",
        height: "100%",
        host: "https://www.youtube-nocookie.com",
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          mute: autoplay ? 1 : 0,
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
          start: startSeconds > 0 ? Math.floor(startSeconds) : 0,
        },
        events: {
          onReady: (event) => {
            if (youtubeIdRef.current !== videoId) return;
            playerRef.current = event.target;
            try {
              event.target.unloadModule?.("captions");
            } catch {
              /* optional */
            }
            const d = event.target.getDuration();
            if (Number.isFinite(d)) setDuration(d);
            if (startSeconds > 0) {
              try {
                event.target.seekTo(startSeconds, true);
              } catch {
                /* ignore */
              }
            }
            setReady(true);
            fitPlayerToHost(hostId, event.target);
            if (autoplay) {
              try {
                event.target.unMute();
                event.target.playVideo();
              } catch {
                /* autoplay may fail */
              }
            }
          },
          onStateChange: (event) => {
            const ended = event.data === (YT.PlayerState?.ENDED ?? YT_ENDED);
            const isPlaying = event.data === (YT.PlayerState?.PLAYING ?? YT_PLAYING);
            setPlaying(isPlaying);
            if (isPlaying) setStarted(true);
            if (ended) {
              setPlaying(false);
              onEndedRef.current?.();
            }
          },
        },
      });
      playerRef.current = player;
    },
    [destroyPlayer, hostId, startSeconds],
  );

  // Remount when the clip changes (e.g. paddle to another video in the modal).
  useEffect(() => {
    setStarted(false);
    setCurrent(0);
    setDuration(0);
    setPlaying(false);
    destroyPlayer();
    // Host node must exist; mount idle without autoplay until user presses play.
    void mountPlayer(youtubeId, false);
    return () => {
      destroyPlayer();
    };
  }, [youtubeId, startSeconds, destroyPlayer, mountPlayer]);

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let alive = true;
    let lastDuration = -1;

    const tick = () => {
      if (!alive) return;
      const p = playerRef.current;
      if (p && !scrubbingRef.current) {
        try {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (Number.isFinite(d) && d > 0 && d !== lastDuration) {
            lastDuration = d;
            setDuration(d);
          }
          if (Number.isFinite(t)) setCurrent(t);
        } catch {
          /* mid-destroy */
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [ready]);

  useEffect(() => {
    const onResize = () => fitPlayerToHost(hostId, playerRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hostId]);

  const togglePlayback = useCallback(() => {
    const p = playerRef.current;
    if (!p || !ready) return;
    playBoundNavClick();
    try {
      if (playing) {
        p.pauseVideo();
      } else {
        p.unMute();
        p.playVideo();
        setStarted(true);
      }
    } catch {
      /* ignore */
    }
  }, [playing, ready]);

  const applyScrubTime = useCallback(
    (value: number, forceSeek: boolean) => {
      if (!playerRef.current || !ready) return;
      setCurrent(value);
      pendingScrubTimeRef.current = value;
      const now = performance.now();
      if (forceSeek || now - lastSeekAtRef.current >= SCRUB_SEEK_THROTTLE_MS) {
        lastSeekAtRef.current = now;
        playerRef.current.seekTo(value, true);
      }
    },
    [ready],
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

  const progress = duration > 0 ? Math.min(1, current / duration) : 0;
  const posterSrc = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
  const showStartOverlay = !started || !playing;

  return (
    <div className={`flex min-h-0 w-full flex-1 flex-col ${className}`} role="region" aria-label={title}>
      <div className="relative min-h-0 w-full flex-1 overflow-hidden bg-black">
        <div
          id={hostId}
          className="pointer-events-none absolute inset-0 z-0 h-full w-full [&_iframe]:pointer-events-none [&_iframe]:!absolute [&_iframe]:!inset-0 [&_iframe]:!h-full [&_iframe]:!w-full [&_iframe]:!max-h-none [&_iframe]:!max-w-none [&_iframe]:border-0"
          aria-hidden
        />

        {/* Paused / not started: poster + center play (only chrome that appears on pause). */}
        {showStartOverlay ? (
          <button
            type="button"
            onClick={togglePlayback}
            disabled={!ready && started}
            aria-label="Play video"
            className="absolute inset-0 z-10 grid place-items-center disabled:cursor-wait"
          >
            {!started ? (
              <>
                <Image src={posterSrc} alt="" fill className="object-cover" sizes="100vw" unoptimized />
                <div className="absolute inset-0 bg-surface-950/45" aria-hidden />
              </>
            ) : (
              <div className="absolute inset-0 bg-surface-950/45" aria-hidden />
            )}
            <span
              className="theme-play-btn relative z-10 h-12 w-12 drop-shadow-[0_6px_14px_rgba(0,0,0,0.55)] sm:h-14 sm:w-14"
              aria-hidden
            >
              <span className="theme-play-triangle" />
            </span>
          </button>
        ) : (
          /* Playing: invisible click-to-pause — no hover chrome. */
          <button
            type="button"
            aria-label="Pause video"
            onClick={togglePlayback}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent"
          />
        )}
      </div>

      <div className={`flex shrink-0 items-center gap-2 py-2 ${seekClassName}`}>
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
          disabled={!ready || duration <= 0}
          aria-label="Seek video timeline"
          className="hero-video-seek h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-40"
          style={{ "--seek-progress": `${progress * 100}%` } as CSSProperties}
          onPointerDown={(event) => {
            scrubbingRef.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={endScrub}
          onPointerCancel={endScrub}
          onChange={(e) => applyScrubTime(Number(e.target.value), false)}
        />
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-surface-500">
          {formatVideoTime(duration)}
        </span>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          title={playing ? "Pause" : "Play"}
          disabled={!ready}
          onClick={togglePlayback}
          className="theme-btn-shape grid h-6 w-6 shrink-0 place-items-center text-accent-300 transition hover:bg-white/10 hover:text-accent-200 disabled:opacity-40"
        >
          {playing ? <VideoPauseIcon className="h-3 w-3" /> : <VideoPlayIcon className="h-3 w-3" />}
        </button>
      </div>
    </div>
  );
}
