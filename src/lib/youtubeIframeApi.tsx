/** Shared YouTube IFrame API loader + player helpers (hero + chromeless modals). */

export type YtPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setSize?: (width: number, height: number) => void;
  loadVideoById?: (videoId: string | { videoId: string; startSeconds?: number }) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  loadModule?: (module: string) => void;
  unloadModule?: (module: string) => void;
  setOption?: (module: string, option: string, value: unknown) => void;
  destroy: () => void;
};

export type YtNamespace = {
  Player: new (
    element: HTMLElement | string,
    options: {
      videoId: string;
      width?: string | number;
      height?: string | number;
      host?: string;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: YtPlayer }) => void;
        onStateChange?: (event: { data: number; target: YtPlayer }) => void;
      };
    },
  ) => YtPlayer;
  PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
};

declare global {
  interface Window {
    YT?: YtNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const YT_PLAYING = 1;
export const YT_ENDED = 0;
/** Min ms between seekTo calls while dragging the timeline. */
export const SCRUB_SEEK_THROTTLE_MS = 120;

/** YT often bakes iframe pixel size at create — force it to fill the slot. */
export function fitPlayerToHost(hostElementId: string, player: YtPlayer | null) {
  const host = document.getElementById(hostElementId);
  if (!host) return;
  const width = Math.round(host.clientWidth);
  const height = Math.round(host.clientHeight);
  if (width < 2 || height < 2) return;
  try {
    player?.setSize?.(width, height);
  } catch {
    /* ignore */
  }
  const iframe = host.querySelector("iframe");
  if (iframe instanceof HTMLIFrameElement) {
    iframe.setAttribute("width", String(width));
    iframe.setAttribute("height", String(height));
    // Keep autoplay permission after layout changes (expand / resize).
    const allow = iframe.getAttribute("allow") ?? "";
    if (!/\bautoplay\b/i.test(allow)) {
      iframe.setAttribute(
        "allow",
        allow ? `${allow}; autoplay; encrypted-media` : "autoplay; encrypted-media; picture-in-picture",
      );
    }
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.maxWidth = "none";
    iframe.style.maxHeight = "none";
  }
}

/**
 * Move a node under a new parent. Prefers `moveBefore` when it can preserve
 * iframe state; always falls back to `appendChild` on HierarchyRequestError
 * or missing support (YouTube hosts often cannot atomically move).
 */
export function reparentNode(parent: Node, node: Node) {
  if (node.parentNode === parent) return;
  const movable = parent as ParentNode & {
    moveBefore?: (node: Node, child: Node | null) => void;
  };
  if (typeof movable.moveBefore === "function") {
    try {
      movable.moveBefore(node, null);
      return;
    } catch {
      /* invalid hierarchy for atomic move — e.g. node with live iframe */
    }
  }
  parent.appendChild(node);
}

/** Single shared load — never stack intervals / onYouTubeIframeAPIReady handlers. */
let youtubeApiPromise: Promise<YtNamespace> | null = null;

export function loadYouTubeApi(): Promise<YtNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires a browser"));
  }
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled || !window.YT?.Player) return;
      settled = true;
      resolve(window.YT);
    };

    const prior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prior?.();
      finish();
    };

    if (!document.querySelector("script[data-hero-yt-api]")) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.heroYtApi = "true";
      document.body.appendChild(script);
    }

    const poll = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(poll);
        finish();
      }
    }, 50);
  });

  return youtubeApiPromise;
}

export function formatVideoTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "0:00";
  const s = Math.floor(totalSeconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

export function VideoPlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 001.5.86l10.5-6.86a1 1 0 000-1.72L9.5 4.28A1 1 0 008 5.14z" />
    </svg>
  );
}

export function VideoPauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
    </svg>
  );
}
