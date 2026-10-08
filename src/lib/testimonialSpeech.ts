"use client";

import EasySpeech from "easy-speech";

export type TestimonialVoiceGender = "male" | "female";

export type TestimonialVoice = {
  gender: TestimonialVoiceGender;
};

/** Word-level `boundary` events expose `charIndex` for karaoke highlighting. */

let initPromise: Promise<boolean> | null = null;

export function speechSynthesisAvailable() {
  if (typeof window === "undefined") return false;
  return Boolean(EasySpeech.detect().speechSynthesis);
}

export function ensureTestimonialSpeech(): Promise<boolean> {
  if (!speechSynthesisAvailable()) return Promise.resolve(false);
  if (!initPromise) {
    initPromise = EasySpeech.init({ maxTimeout: 5000, interval: 250, quiet: true }).catch(
      () => false,
    );
  }
  return initPromise;
}

/**
 * iOS WebKit (Safari + Chrome on iPhone) blocks speechSynthesis.speak unless the
 * first utterance is queued during a user gesture. Call this synchronously from
 * click/touch handlers before any delayed intro / quote speech.
 */
export function unlockTestimonialSpeechGesture(): void {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  try {
    const utter = new SpeechSynthesisUtterance(" ");
    utter.volume = 0;
    utter.rate = 10;
    utter.pitch = 1;
    synth.speak(utter);
  } catch {
    /* ignore */
  }
  // Warm EasySpeech init without awaiting — must not delay the gesture speak.
  void ensureTestimonialSpeech();
}

/** Voice catalog differs by engine: Chrome desktop Google cloud vs Apple/Android local TTS. */
export type SpeechPlatform = "ios" | "android" | "desktop";

export function detectSpeechPlatform(): SpeechPlatform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  // iPadOS 13+ can report as MacIntel; touch points distinguish it.
  if (
    /iPhone|iPod|iPad/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function guessGender(voice: SpeechSynthesisVoice): TestimonialVoiceGender | "unknown" {
  const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  // Apple Siri bundle ids: com.apple…siri_female_en-US… / siri_male_en-US…
  if (/siri[_-]?female|female[_-]?en[-_]/.test(label)) return "female";
  if (/siri[_-]?male|male[_-]?en[-_]/.test(label)) return "male";
  // Android TTS often uses opaque ids (en-us-x-sfg-local) instead of “Samantha”.
  if (
    /\bfemale\b|\bwoman\b|samantha|victoria|karen|moira|tessa|fiona|veena|serena|zira|hazel|susan|salli|ivy|joanna|kendra|kimberly|nicole|amy|emma|olivia|allison|ava|martha|kate|princess|vicki|kathy|stephanie|shelley|sandy|en-us-x-sfg|en-us-x-tpf|en-gb-x-gba|en-au-x-au[cf]|en-gb-x-rfp/.test(
      label,
    )
  ) {
    return "female";
  }
  if (
    /\bmale\b|\bman\b|\bdavid\b|daniel|\balex\b|fred|\btom\b|jorge|diego|rishi|bruce|nathan|gordon|ralph|arthur|george|james|\baaron\b|thomas|oliver|\bevan\b|\breed\b|\bnoel\b|google uk english male|microsoft david|microsoft mark|microsoft guy|en-us-x-tpd|en-us-x-iob|en-gb-x-gbb|en-gb-x-rbf|en-au-x-au[dm]/.test(
      label,
    )
  ) {
    return "male";
  }
  return "unknown";
}

function rankVoice(voice: SpeechSynthesisVoice) {
  const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  if (
    /compact|espeak|mbrola|whisper|zarvox|trinoids|boing|bells|cellos|organ|bubbles|bad news|good news|pipes|junior|\bralph\b|albert|bahh|deranged|hysterical|superstar|one world|\bfred\b/.test(
      label,
    )
  ) {
    return -1;
  }
  let score = 1;
  if (/google/.test(label)) score += 8;
  if (/premium|enhanced|neural|natural/.test(label)) score += 6;
  // Android network voices usually beat the same id’s -local variant.
  if (/-network\b/.test(label)) score += 4;
  if (voice.localService === false) score += 3;
  if (
    /samantha|daniel|moira|tessa|karen|serena|fiona|veena|rishi|arthur|gordon|\btom\b|\balex\b|nicky|microsoft david|microsoft mark|microsoft zira|en-us-x-sfg|en-us-x-tpd|en-gb-x-gba|en-gb-x-gbb/.test(
      label,
    )
  ) {
    score += 4;
  }
  return score;
}

function voiceLabel(voice: SpeechSynthesisVoice) {
  return `${voice.name} ${voice.voiceURI}`;
}

function findVoiceByHints(
  pool: SpeechSynthesisVoice[],
  hints: readonly (string | RegExp)[],
) {
  for (const hint of hints) {
    const match = pool.find((voice) => {
      const label = voiceLabel(voice);
      return typeof hint === "string"
        ? label.toLowerCase().includes(hint)
        : hint.test(label);
    });
    if (match) return match;
  }
  return null;
}

function uniqueByName(voices: SpeechSynthesisVoice[]) {
  const seen = new Set<string>();
  const unique: SpeechSynthesisVoice[] = [];
  for (const voice of voices) {
    const key = voice.name.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(voice);
  }
  return unique;
}

function englishVoices() {
  const all = EasySpeech.voices();
  const english = all.filter((voice) => /^en\b/i.test(voice.lang));
  return english.length > 0 ? english : all;
}

/**
 * Ranked voices for one gender only.
 * Never falls back to the other gender — that made iPhone male letters speak
 * as Samantha when Alex wasn’t installed / recognized.
 */
function rankedVoicesForGender(gender: TestimonialVoiceGender) {
  const pool = englishVoices().filter((voice) => guessGender(voice) === gender);
  const ranked = pool
    .map((voice) => ({ voice, score: rankVoice(voice) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score);
  const good = ranked.filter((row) => row.score >= 4);
  return uniqueByName((good.length > 0 ? good : ranked).map((row) => row.voice));
}

function rankedNonFemaleEnglish() {
  const pool = englishVoices().filter((voice) => guessGender(voice) !== "female");
  return uniqueByName(
    pool
      .map((voice) => ({ voice, score: rankVoice(voice) }))
      .filter((row) => row.score >= 0)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.voice),
  );
}

/**
 * Female pick: Google cloud voices when the engine exposes them (desktop Chrome,
 * often Android Chrome). Otherwise prefer the best native voice for the OS —
 * iOS WebKit never ships Google voices, so Samantha/Moira/… matter there.
 */
const FEMALE_HINTS_GOOGLE = ["google uk english female", "google us english"] as const;

const FEMALE_HINTS_IOS = [
  /samantha/i,
  /moira/i,
  /karen/i,
  /tessa/i,
  /serena/i,
  /fiona/i,
  /\bava\b/i,
  /allison/i,
] as const;

const FEMALE_HINTS_ANDROID = [
  /en-us-x-sfg/i,
  /en-gb-x-gba/i,
  /en-us-x-tpf/i,
  /en-au-x-auc/i,
  /\bfemale\b/i,
] as const;

const FEMALE_HINTS_DESKTOP_FALLBACK = ["samantha", "zira", "hazel"] as const;

/** Highest-ranked natural female voice (Mimi / all women). Do not replace via word-callback probing. */
export function preferredFemaleVoice() {
  const pool = rankedVoicesForGender("female");
  const google = findVoiceByHints(pool, FEMALE_HINTS_GOOGLE);
  if (google) return google;

  const platform = detectSpeechPlatform();
  if (platform === "ios") {
    return findVoiceByHints(pool, FEMALE_HINTS_IOS) ?? pool[0] ?? null;
  }
  if (platform === "android") {
    return findVoiceByHints(pool, FEMALE_HINTS_ANDROID) ?? pool[0] ?? null;
  }
  return findVoiceByHints(pool, FEMALE_HINTS_DESKTOP_FALLBACK) ?? pool[0] ?? null;
}

/**
 * Male pick (trial).
 *
 * TRY (current): Google UK English Male first — same Chrome Google engine as Mimi.
 * On iOS/Android without Google, prefer Alex / Android en-*-x-* males.
 * Pitch/rate stay flat (1 / 0.97).
 *
 * REVERT to Alex-first everywhere:
 * 1. Put `/^alex\b/i` ahead of Google in FEMALE/MALE google lists (or remove Google).
 * 2. In isSkippedMaleVoice, skip Google UK Male again.
 * 3. In testimonialSpeechUsesChunks, `return gender === "male"` (drop the Google exception).
 */
const MALE_HINTS_GOOGLE = [/google uk english male/i] as const;

const MALE_HINTS_IOS = [
  /siri[_-]?male/i,
  /\balex\b/i,
  /\barthur\b/i,
  /\bgordon\b/i,
  /\btom\b/i,
  /\bdaniel\b/i,
  /\bnicky\b/i,
  /\baaron\b/i,
  /\bevan\b/i,
  /\bnathan\b/i,
  /\breed\b/i,
  /\bnoel\b/i,
  /\bbruce\b/i,
] as const;

const MALE_HINTS_ANDROID = [
  /en-us-x-tpd/i,
  /en-us-x-iob/i,
  /en-gb-x-gbb/i,
  /en-gb-x-rbf/i,
  /en-au-x-aud/i,
  /\bmale\b/i,
] as const;

const MALE_HINTS_DESKTOP_FALLBACK = [
  /^alex\b/i,
  /microsoft david/i,
  /^tom\b/i,
  /^arthur\b/i,
  /^gordon\b/i,
  /microsoft mark/i,
  /^nathan\b/i,
] as const;

function isSkippedMaleVoice(voice: SpeechSynthesisVoice, platform: SpeechPlatform) {
  // Desktop Chrome: Daniel is choppy next to Google/Alex. On iOS Daniel is a solid UK male.
  if (platform !== "ios" && /^daniel\b/i.test(voice.name)) return true;
  return false;
}

/**
 * Smoother installed male voice. Does not replace the locked Mimi female pick.
 * Searches non-female voices by platform hints first so iOS still finds Alex /
 * Siri male even when `guessGender` misses a URI shape — and never returns Samantha.
 */
export function preferredMaleVoice() {
  const platform = detectSpeechPlatform();
  const males = rankedVoicesForGender("male").filter(
    (voice) => !isSkippedMaleVoice(voice, platform),
  );
  const nonFemale = rankedNonFemaleEnglish().filter(
    (voice) => !isSkippedMaleVoice(voice, platform),
  );
  // Prefer hint search over the whole non-female list (includes unknowns).
  const hintPool = uniqueByName([...males, ...nonFemale]);

  const google = findVoiceByHints(hintPool, MALE_HINTS_GOOGLE);
  if (google && guessGender(google) !== "female") return google;

  const hints =
    platform === "ios"
      ? MALE_HINTS_IOS
      : platform === "android"
        ? MALE_HINTS_ANDROID
        : MALE_HINTS_DESKTOP_FALLBACK;

  return (
    findVoiceByHints(hintPool, hints) ??
    males[0] ??
    nonFemale[0] ??
    null
  );
}

export function pickTestimonialVoice(_id: string, gender: TestimonialVoiceGender) {
  if (gender === "female") return preferredFemaleVoice();
  return preferredMaleVoice();
}

export function testimonialSpeechTune(
  _id: string,
  gender: TestimonialVoiceGender,
  voice?: SpeechSynthesisVoice | null,
) {
  if (gender === "female") {
    return { pitch: 1.05, rate: 0.97 };
  }
  // Last resort when the OS only exposes female English voices (common on stock iOS).
  if (!voice || guessGender(voice) === "female") {
    return { pitch: 0.72, rate: 0.95 };
  }
  return { pitch: 1, rate: 0.97 };
}

/**
 * Female (and Google male trial) speak a full sentence.
 * Local male fallbacks still use short chunks — do not delete that path.
 * REVERT: `return gender === "male";`
 */
export function testimonialSpeechUsesChunks(
  gender: TestimonialVoiceGender,
  voice?: SpeechSynthesisVoice | null,
) {
  if (gender !== "male") return false;
  if (voice && /google/i.test(`${voice.name} ${voice.voiceURI}`)) return false;
  return true;
}

export function cancelTestimonialSpeech() {
  try {
    EasySpeech.cancel();
  } catch {
    /* ignore */
  }
  try {
    window.speechSynthesis?.cancel();
  } catch {
    /* ignore */
  }
}

export function pauseTestimonialSpeech() {
  try {
    EasySpeech.pause();
  } catch {
    /* ignore */
  }
}

export function resumeTestimonialSpeech() {
  try {
    EasySpeech.resume();
  } catch {
    /* ignore */
  }
}

export function speechEnginePaused() {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis?.paused);
}

export function speechEngineSpeaking() {
  if (typeof window === "undefined") return false;
  return Boolean(window.speechSynthesis?.speaking);
}

export async function speakTestimonial(options: {
  id: string;
  quote: string;
  gender: TestimonialVoiceGender;
  /** Cancel any in-flight utterance first. Default true (fresh start). */
  cancelBefore?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
  onBoundary?: (event: SpeechSynthesisEvent) => void;
}) {
  const ready = await ensureTestimonialSpeech();
  if (!ready) return false;

  if (options.cancelBefore !== false) cancelTestimonialSpeech();

  const voice = pickTestimonialVoice(options.id, options.gender);
  const tune = testimonialSpeechTune(options.id, options.gender, voice);
  const chain = options.cancelBefore === false;
  const localVoice = voice?.localService === true;

  try {
    await EasySpeech.speak({
      text: options.quote,
      voice: voice ?? undefined,
      pitch: tune.pitch,
      rate: tune.rate,
      noStop: chain,
      infiniteResume: !localVoice,
      start: () => options.onStart?.(),
      end: () => options.onEnd?.(),
      error: () => options.onError?.(),
      boundary: options.onBoundary,
    } as Parameters<typeof EasySpeech.speak>[0]);
    return true;
  } catch {
    options.onError?.();
    return false;
  }
}
