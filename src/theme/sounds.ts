/** Base click / content-window SFX catalog for theme + Options menu. */

const BASE_CLICK_FILES = [
  "Buckle_Splash.mp3",
  "Buckle_Poke_Click.mp3",
  "Buckle_Click.mp3",
  "Buckle_Lazer_Click.mp3",
  "Duck_Poke_Click.mp3",
  "Laser_Blast_Click.mp3",
  "Poked_Duck_Click.mp3",
  "Seatbelt_Click.mp3",
  "Shotgun_Cocking.mp3",
  "Zeep_Zoop_Click.mp3",
] as const;

/** Modal / content-window open SFX (trimmed via scripts/trim-open-sfx.sh). */
const CONTENT_WINDOW_FILES = [
  "Click_Crescendo.mp3",
  "Future_Click.mp3",
  "Future_Clicks.mp3",
  "Loading_Click.mp3",
  "Portal_Click.mp3",
  "Portal_Click_Event.mp3",
  "Portal_Opening.mp3",
  "Portal_Opening_SFX.mp3",
  "Sci-Fi_Click.mp3",
  "Sci-Fi_Rapid_Clicks.mp3",
  "Zeep_Click.mp3",
  "Zeep_Open.mp3",
] as const;

/** Measured post-trim durations (ms). Client metadata can refine these. */
const CONTENT_WINDOW_DURATION_MS: Record<(typeof CONTENT_WINDOW_FILES)[number], number> = {
  "Click_Crescendo.mp3": 1045,
  "Future_Click.mp3": 679,
  "Future_Clicks.mp3": 1489,
  "Loading_Click.mp3": 2011,
  "Portal_Click.mp3": 1149,
  "Portal_Click_Event.mp3": 1985,
  "Portal_Opening.mp3": 1985,
  "Portal_Opening_SFX.mp3": 1254,
  "Sci-Fi_Click.mp3": 1306,
  "Sci-Fi_Rapid_Clicks.mp3": 496,
  "Zeep_Click.mp3": 993,
  "Zeep_Open.mp3": 1567,
};

export type SoundOption = {
  id: string;
  file: string;
  label: string;
  src: string;
  /** Clip length in ms (content-window opens); 0 when unused. */
  durationMs?: number;
};

/** Human-readable label from a sound filename (`Buckle_Click.mp3` → `Buckle Click`). */
export function labelFromSoundFilename(file: string): string {
  return file.replace(/\.mp3$/i, "").replace(/_/g, " ");
}

function idFromSoundFilename(file: string): string {
  return file
    .replace(/\.mp3$/i, "")
    .toLowerCase()
    .replace(/_/g, "-");
}

/** Bump when click / open assets change so browsers skip stale cached MP3s. */
const CLICK_ASSET_VERSION = "6";
const OPEN_ASSET_VERSION = "2";

/** Obnoxious option that requires an extra confirmation in Options. */
export const ZEEP_ZOOP_CLICK_ID = "zeep-zoop-click" as const;

export const BASE_CLICKS: SoundOption[] = BASE_CLICK_FILES.map((file) => ({
  id: idFromSoundFilename(file),
  file,
  label: labelFromSoundFilename(file),
  src: `/audio/clicks/${file}?v=${CLICK_ASSET_VERSION}`,
}));

export const CONTENT_WINDOW_SOUNDS: SoundOption[] = CONTENT_WINDOW_FILES.map((file) => ({
  id: idFromSoundFilename(file),
  file,
  label: labelFromSoundFilename(file),
  src: `/audio/open/${file}?v=${OPEN_ASSET_VERSION}`,
  durationMs: CONTENT_WINDOW_DURATION_MS[file],
}));

export type BaseClickId = (typeof BASE_CLICKS)[number]["id"];
export type ContentWindowSoundId = (typeof CONTENT_WINDOW_SOUNDS)[number]["id"];

/** Explicit mute option shared by Base Clicks and Content Windows. */
export const NO_SOUND_ID = "none" as const;

export type BaseClickPreference = BaseClickId | typeof NO_SOUND_ID;
export type ContentWindowPreference = ContentWindowSoundId | typeof NO_SOUND_ID;

/** 4th Base Click in the catalog (Buckle Lazer Click). */
export const DEFAULT_BASE_CLICK_ID: BaseClickPreference = "buckle-lazer-click";
/** 3rd Content Window sound in the catalog (Future Clicks). */
export const DEFAULT_CONTENT_WINDOW_SOUND_ID: ContentWindowPreference = "future-clicks";

export const BASE_CLICK_STORAGE_KEY = "portfolio-base-click-id";
export const CONTENT_WINDOW_STORAGE_KEY = "portfolio-content-window-sound-id";
/** Master SFX gate (nav + modal opens). Default on. */
export const SOUND_ENABLED_STORAGE_KEY = "portfolio-sound-enabled";
export const DEFAULT_SOUND_ENABLED = true;

/** Bump when theme-music beds in `/public/audio/theme` change. */
export const THEME_MUSIC_ASSET_VERSION = "1";

/** Build a versioned theme-music URL under `/audio/theme/`. */
export function themeMusicSrc(file: string): string {
  return `/audio/theme/${file}?v=${THEME_MUSIC_ASSET_VERSION}`;
}

/** Default bed (Cyber Aaron / Perpetual Rain). */
export const DEFAULT_THEME_MUSIC_SRC = themeMusicSrc("Perpetual_Rain.mp3");

/** One-shot sting under testimonial character intros (not a looping bed). */
export const TESTIMONIAL_INTRO_STING_SRC = themeMusicSrc(
  "Take_My_Word_2026-09-18T030636.mp3",
);
export const TESTIMONIAL_INTRO_VOICE_DELAY_MS = 4000;
/** Set false to park the intro photo in the slot with no swoop/flip (easy revert). */
export const TESTIMONIAL_INTRO_BOUNCE = true;
/** Hold over the name, swoop into the slot, then X-axis coin flip. */
export const TESTIMONIAL_INTRO_PORTRAIT_MS = 4000;
export const TESTIMONIAL_INTRO_HOLD_MS = 420;

const testimonialIntroStingBySrc = new Map<string, HTMLAudioElement>();

/** Nominal loop length for ~30s beds (rules metadata; playback uses `audio.loop`). */
export const DEFAULT_THEME_MUSIC_LOOP_INTERVAL_MS = 30_000;

export function isBaseClickId(value: unknown): value is BaseClickId {
  return typeof value === "string" && BASE_CLICKS.some((c) => c.id === value);
}

export function isBaseClickPreference(value: unknown): value is BaseClickPreference {
  return value === NO_SOUND_ID || isBaseClickId(value);
}

/** Old Beaver_* filenames → Buckle_* catalog ids. */
const LEGACY_BASE_CLICK_IDS: Record<string, string> = {
  "beaver-poke": "buckle-splash",
  "buckle-poke": "buckle-splash",
  "beaver-poke-click": "buckle-poke-click",
};

/** Resolve a stored click id, including pre-rename Beaver picks. */
export function resolveBaseClickPreference(value: unknown): BaseClickPreference | null {
  if (typeof value !== "string") return null;
  const mapped = LEGACY_BASE_CLICK_IDS[value] ?? value;
  return isBaseClickPreference(mapped) ? mapped : null;
}

export function isContentWindowSoundId(value: unknown): value is ContentWindowSoundId {
  return typeof value === "string" && CONTENT_WINDOW_SOUNDS.some((c) => c.id === value);
}

export function isContentWindowPreference(value: unknown): value is ContentWindowPreference {
  return value === NO_SOUND_ID || isContentWindowSoundId(value);
}

/** Catalog / mute duration for modal launch timing (0 = instant, no delay). */
export function contentWindowDurationMs(id: ContentWindowPreference): number {
  if (id === NO_SOUND_ID) return 0;
  return CONTENT_WINDOW_SOUNDS.find((c) => c.id === id)?.durationMs ?? 0;
}

export const DEFAULT_CONTENT_WINDOW_OPEN_DURATION_MS = contentWindowDurationMs(
  DEFAULT_CONTENT_WINDOW_SOUND_ID,
);

/** Paint modal-open duration onto `<html>` for CSS-driven launch animation. */
export function applyModalOpenDuration(ms: number): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const safe = Math.max(0, Math.round(ms));
  root.style.setProperty("--modal-open-duration", `${safe}ms`);
  if (safe <= 0) {
    root.setAttribute("data-modal-open-instant", "true");
  } else {
    root.removeAttribute("data-modal-open-instant");
  }
}

const clickAudioById = new Map<string, HTMLAudioElement>();
const openAudioById = new Map<string, HTMLAudioElement>();
const themeMusicAudioBySrc = new Map<string, HTMLAudioElement>();

function ensureAudio(
  map: Map<string, HTMLAudioElement>,
  id: string,
  src: string,
): HTMLAudioElement {
  let audio = map.get(id);
  if (!audio) {
    audio = new Audio(src);
    audio.preload = "auto";
    map.set(id, audio);
  }
  return audio;
}

function playCached(
  map: Map<string, HTMLAudioElement>,
  id: string,
  src: string,
): void {
  if (typeof window === "undefined") return;
  const audio = ensureAudio(map, id, src);
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore seek errors before metadata */
  }
  void audio.play().catch(() => {
    /* autoplay / gesture policies */
  });
}

/** Eagerly create + buffer every theme SFX clip (safe to call once on mount). */
export function preloadThemeSounds(): void {
  if (typeof window === "undefined") return;

  for (const opt of BASE_CLICKS) {
    ensureAudio(clickAudioById, opt.id, opt.src).load();
  }
  for (const opt of CONTENT_WINDOW_SOUNDS) {
    ensureAudio(openAudioById, opt.id, opt.src).load();
  }
}

/** @deprecated Prefer preloadThemeSounds */
export const preloadBaseClicks = preloadThemeSounds;

/** One-shot for splash “Skip the fun” — not in the Base Clicks catalog. */
/** Not in BASE_CLICK_FILES — only played via playSkipTheFunClick (quiz miss / skip-fun). */
export const SKIP_THE_FUN_CLICK_SRC = "/audio/clicks/Fart_Squeak.mp3?v=2";

export function playSkipTheFunClick(): void {
  playCached(clickAudioById, "skip-the-fun", SKIP_THE_FUN_CLICK_SRC);
}

export function playBaseClick(id: BaseClickPreference): void {
  if (id === NO_SOUND_ID) return;
  const opt = BASE_CLICKS.find((c) => c.id === id);
  if (!opt) return;
  playCached(clickAudioById, opt.id, opt.src);
}

export function playContentWindowOpen(id: ContentWindowPreference): void {
  if (id === NO_SOUND_ID) return;
  const opt = CONTENT_WINDOW_SOUNDS.find((c) => c.id === id);
  if (!opt) return;
  playCached(openAudioById, opt.id, opt.src);
}

/**
 * Resolve clip length from the loaded Audio element (falls back to catalog).
 * Used when the user picks a Content Windows option.
 */
export function measureContentWindowDurationMs(
  id: ContentWindowPreference,
): Promise<number> {
  if (id === NO_SOUND_ID) return Promise.resolve(0);
  const opt = CONTENT_WINDOW_SOUNDS.find((c) => c.id === id);
  if (!opt) return Promise.resolve(0);
  if (typeof window === "undefined") return Promise.resolve(opt.durationMs ?? 0);

  const audio = ensureAudio(openAudioById, opt.id, opt.src);
  const fromElement = () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      return Math.round(audio.duration * 1000);
    }
    return opt.durationMs ?? 0;
  };

  if (audio.readyState >= 1) {
    return Promise.resolve(fromElement());
  }

  return new Promise((resolve) => {
    const finish = () => resolve(fromElement());
    audio.addEventListener("loadedmetadata", finish, { once: true });
    audio.addEventListener("error", finish, { once: true });
    audio.load();
  });
}

/** Bound by ThemeProvider so non-React helpers (Escape, close buttons) can play SFX. */
let boundNavClickPlayer: (() => void) | null = null;
let boundModalOpenPlayer: (() => void) | null = null;

export function bindNavClickPlayer(player: () => void): () => void {
  boundNavClickPlayer = player;
  return () => {
    if (boundNavClickPlayer === player) boundNavClickPlayer = null;
  };
}

export function bindModalOpenPlayer(player: () => void): () => void {
  boundModalOpenPlayer = player;
  return () => {
    if (boundModalOpenPlayer === player) boundModalOpenPlayer = null;
  };
}

/** Play the currently selected base click (no-op before ThemeProvider binds). */
export function playBoundNavClick(): void {
  boundNavClickPlayer?.();
}

/** Play the currently selected content-window open SFX. */
export function playBoundModalOpen(): void {
  boundModalOpenPlayer?.();
}

/**
 * Start a looping theme-music bed (intro modal only — gated by ThemeProvider).
 * Stops any other theme bed first so only one plays.
 */
export function startThemeMusicLoop(src: string): void {
  if (typeof window === "undefined" || !src) return;
  stopThemeMusicLoop();
  const audio = ensureAudio(themeMusicAudioBySrc, src, src);
  audio.loop = true;
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
  void audio.play().catch(() => {
    /* autoplay / gesture policies */
  });
}

/** Stop any in-flight theme-music bed. */
export function stopThemeMusicLoop(): void {
  themeMusicAudioBySrc.forEach((audio) => {
    try {
      audio.loop = false;
      audio.pause();
      audio.currentTime = 0;
    } catch {
      /* ignore */
    }
  });
}

/** Return the live theme-music element for `src` (if already created). */
export function getThemeMusicAudio(src: string): HTMLAudioElement | null {
  if (!src) return null;
  return themeMusicAudioBySrc.get(src) ?? null;
}

type ThemeMusicAnalyserTap = {
  ctx: AudioContext;
  analyser: AnalyserNode;
};

const themeMusicAnalyserBySrc = new Map<string, ThemeMusicAnalyserTap>();

/**
 * Live time-domain tap for theme music (oscilloscope / meter visuals).
 * Routes element audio through Web Audio so analysis and playback stay in sync.
 * Safe to call repeatedly — `createMediaElementSource` runs once per element.
 */
export function ensureThemeMusicAnalyser(src: string): AnalyserNode | null {
  if (typeof window === "undefined" || !src) return null;

  const existing = themeMusicAnalyserBySrc.get(src);
  if (existing) {
    if (existing.ctx.state === "suspended") {
      void existing.ctx.resume().catch(() => {
        /* gesture / autoplay */
      });
    }
    return existing.analyser;
  }

  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  const audio = ensureAudio(themeMusicAudioBySrc, src, src);
  try {
    const ctx = new AC();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.72;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    themeMusicAnalyserBySrc.set(src, { ctx, analyser });
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {
        /* gesture / autoplay */
      });
    }
    return analyser;
  } catch {
    return null;
  }
}

/** @deprecated Prefer startThemeMusicLoop */
export const playThemeMusicSting = startThemeMusicLoop;
/** @deprecated Prefer stopThemeMusicLoop */
export const stopThemeMusicSting = stopThemeMusicLoop;

export function playTestimonialIntroSting(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;
  const audio = ensureAudio(
    testimonialIntroStingBySrc,
    TESTIMONIAL_INTRO_STING_SRC,
    TESTIMONIAL_INTRO_STING_SRC,
  );
  audio.loop = false;
  try {
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
  void audio.play().catch(() => {
    /* autoplay / gesture */
  });
  return audio;
}

export function pauseTestimonialIntroSting(): void {
  const audio = testimonialIntroStingBySrc.get(TESTIMONIAL_INTRO_STING_SRC);
  if (!audio) return;
  try {
    audio.pause();
  } catch {
    /* ignore */
  }
}

export function resumeTestimonialIntroSting(): void {
  const audio = testimonialIntroStingBySrc.get(TESTIMONIAL_INTRO_STING_SRC);
  if (!audio) return;
  void audio.play().catch(() => {
    /* autoplay / gesture */
  });
}

export function stopTestimonialIntroSting(): void {
  const audio = testimonialIntroStingBySrc.get(TESTIMONIAL_INTRO_STING_SRC);
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch {
    /* ignore */
  }
}

/** Buffer the testimonial intro sting (safe to call once on mount). */
export function preloadTestimonialIntroSting(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  const audio = ensureAudio(
    testimonialIntroStingBySrc,
    TESTIMONIAL_INTRO_STING_SRC,
    TESTIMONIAL_INTRO_STING_SRC,
  );
  audio.loop = false;
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const done = () => {
      audio.removeEventListener("canplaythrough", done);
      audio.removeEventListener("error", done);
      resolve();
    };
    audio.addEventListener("canplaythrough", done, { once: true });
    audio.addEventListener("error", done, { once: true });
    try {
      audio.load();
    } catch {
      done();
    }
  });
}
