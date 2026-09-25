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

function guessGender(voice: SpeechSynthesisVoice): TestimonialVoiceGender | "unknown" {
  const label = `${voice.name} ${voice.voiceURI}`.toLowerCase();
  if (
    /\bfemale\b|\bwoman\b|samantha|victoria|karen|moira|tessa|fiona|veena|serena|zira|hazel|susan|salli|ivy|joanna|kendra|kimberly|nicole|amy|emma|olivia|allison|ava|martha|samantha|karen|moira|fiona|tessa|veena|kate|princess|vicki|kathy/.test(
      label,
    )
  ) {
    return "female";
  }
  if (
    /\bmale\b|\bman\b|\bdavid\b|daniel|alex\b|fred|tom\b|jorge|diego|rishi|bruce|nathan|gordon|ralph|arthur|george|james|aaron|fred|thomas|oliver|google uk english male|microsoft david|microsoft mark|microsoft guy/.test(
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
  if (voice.localService === false) score += 3;
  if (
    /samantha|daniel|moira|tessa|karen|serena|fiona|veena|rishi|arthur|gordon|\btom\b|\balex\b|nicky|microsoft david|microsoft mark|microsoft zira/.test(
      label,
    )
  ) {
    score += 4;
  }
  return score;
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

function rankedVoicesForGender(gender: TestimonialVoiceGender) {
  const pool = englishVoices().filter((voice) => guessGender(voice) === gender);
  const fallback = pool.length > 0 ? pool : englishVoices();
  const ranked = fallback
    .map((voice) => ({ voice, score: rankVoice(voice) }))
    .filter((row) => row.score >= 0)
    .sort((a, b) => b.score - a.score);
  const good = ranked.filter((row) => row.score >= 4);
  return uniqueByName((good.length > 0 ? good : ranked).map((row) => row.voice));
}

/** Name hints for the female voice Mimi should keep. First match wins. */
const LOCKED_FEMALE_VOICE_HINTS = [
  "google uk english female",
  "google us english",
  "samantha",
];

/** Highest-ranked natural female voice (Mimi / all women). Do not replace via word-callback probing. */
export function preferredFemaleVoice() {
  const pool = rankedVoicesForGender("female");
  for (const hint of LOCKED_FEMALE_VOICE_HINTS) {
    const match = pool.find((voice) => voice.name.toLowerCase().includes(hint));
    if (match) return match;
  }
  return pool[0] ?? null;
}

/**
 * Male voice pick (trial).
 *
 * TRY (current): Google UK English Male first — same Chrome Google engine as Mimi.
 * Pitch/rate stay flat (1 / 0.97). Do not restore the old hash-based pitch nudges.
 *
 * REVERT to Alex:
 * 1. Put `/^alex\b/i` first in LOCKED_MALE_VOICE_HINTS (remove the Google UK Male hint).
 * 2. In isSkippedMaleVoice, skip Google UK Male again:
 *    `/google uk english male/i.test(...) || /^daniel\b/i.test(voice.name)`
 * 3. In testimonialSpeechUsesChunks, `return gender === "male"` (drop the Google exception).
 * Chunk / slash / early-end code in useTestimonialSpeech stays either way.
 */
const LOCKED_MALE_VOICE_HINTS = [
  /google uk english male/i,
  /^alex\b/i,
  /microsoft david/i,
  /^tom\b/i,
  /^arthur\b/i,
  /^gordon\b/i,
  /microsoft mark/i,
  /^nathan\b/i,
];

function isSkippedMaleVoice(voice: SpeechSynthesisVoice) {
  return /^daniel\b/i.test(voice.name);
}

/** Smoother installed male voice. Does not replace the locked Mimi female pick. */
export function preferredMaleVoice() {
  const ranked = rankedVoicesForGender("male").filter((voice) => !isSkippedMaleVoice(voice));
  const pool = ranked.length > 0 ? ranked : rankedVoicesForGender("male");
  for (const hint of LOCKED_MALE_VOICE_HINTS) {
    const match = pool.find(
      (voice) => hint.test(`${voice.name} ${voice.voiceURI}`) && guessGender(voice) !== "female",
    );
    if (match) return match;
  }
  return pool[0] ?? null;
}

export function pickTestimonialVoice(_id: string, gender: TestimonialVoiceGender) {
  if (gender === "female") return preferredFemaleVoice();
  return preferredMaleVoice();
}

export function testimonialSpeechTune(_id: string, gender: TestimonialVoiceGender) {
  if (gender === "female") {
    return { pitch: 1.05, rate: 0.97 };
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
  const tune = testimonialSpeechTune(options.id, options.gender);
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
