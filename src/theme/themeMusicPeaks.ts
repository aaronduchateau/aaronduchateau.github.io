/** Shared theme-music peak extraction for decorative waveforms. */

const peaksCache = new Map<string, Float32Array>();
export const THEME_MUSIC_PEAK_BARS = 720;

let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx || sharedCtx.state === "closed") {
    sharedCtx = new AC();
  }
  return sharedCtx;
}

/**
 * Decode (or return cached) signed mid-block samples for a theme-music src.
 * Values are roughly -1…1 so a stroked polyline reads as an oscilloscope squiggle.
 */
export async function loadThemeMusicPeaks(src: string): Promise<Float32Array | null> {
  if (!src) return null;
  const cacheKey = `signed-v1:${src}`;
  const cached = peaksCache.get(cacheKey);
  if (cached) return cached;

  const ctx = getAudioContext();
  if (!ctx) return null;

  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const raw = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(raw.slice(0));
    const channel = buffer.getChannelData(0);
    const peaks = new Float32Array(THEME_MUSIC_PEAK_BARS);
    const block = Math.max(1, Math.floor(channel.length / THEME_MUSIC_PEAK_BARS));
    for (let i = 0; i < THEME_MUSIC_PEAK_BARS; i++) {
      const start = i * block;
      const mid = Math.min(channel.length - 1, start + Math.floor(block / 2));
      peaks[i] = channel[mid] ?? 0;
    }
    peaksCache.set(cacheKey, peaks);
    return peaks;
  } catch {
    return null;
  }
}
