"use client";

import EasySpeech from "easy-speech";

const SAMPLE = "One two three four five six.";
const CACHE_KEY = "portfolio-tts-word-callback-voices-v1";
const MIN_WORD_EVENTS = 4;
const MAX_PROBE = 8;
const PROBE_TIMEOUT_MS = 4500;

export type WordCallbackVoice = {
  name: string;
  voiceURI: string;
  score: number;
  wordEvents: number;
};

let probePromise: Promise<WordCallbackVoice[]> | null = null;
let probed: WordCallbackVoice[] = [];

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

function readCache(): WordCallbackVoice[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WordCallbackVoice[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(rows: WordCallbackVoice[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(rows));
  } catch {
    /* quota / private mode */
  }
}

function resolveLive(row: WordCallbackVoice) {
  return EasySpeech.voices().find(
    (voice) => voice.voiceURI === row.voiceURI || voice.name === row.name,
  );
}

function countWordBoundaries(voice: SpeechSynthesisVoice) {
  return new Promise<number>((resolve) => {
    let words = 0;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(words);
    };
    const timer = window.setTimeout(() => {
      try {
        EasySpeech.cancel();
      } catch {
        /* ignore */
      }
      finish();
    }, PROBE_TIMEOUT_MS);

    void EasySpeech.speak({
      text: SAMPLE,
      voice,
      volume: 0.01,
      rate: 1.35,
      pitch: 1,
      boundary: (event) => {
        if (!event.name || event.name === "word") words += 1;
      },
      end: finish,
      error: finish,
    }).catch(finish);
  });
}

async function runProbe(): Promise<WordCallbackVoice[]> {
  const cached = readCache();
  if (cached) {
    probed = cached;
    return cached;
  }

  const english = EasySpeech.voices().filter((voice) => /^en\b/i.test(voice.lang));
  const source = english.length > 0 ? english : EasySpeech.voices();
  const candidates = source
    .map((voice) => ({ voice, score: rankVoice(voice) }))
    .filter((row) => row.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_PROBE);

  const capable: WordCallbackVoice[] = [];
  for (const row of candidates) {
    if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
      if (capable.length === 0 && probed.length === 0) probePromise = null;
      return probed;
    }
    const wordEvents = await countWordBoundaries(row.voice);
    if (wordEvents >= MIN_WORD_EVENTS) {
      capable.push({
        name: row.voice.name,
        voiceURI: row.voice.voiceURI,
        score: row.score,
        wordEvents,
      });
    }
  }

  capable.sort((a, b) => b.score - a.score || b.wordEvents - a.wordEvents);
  const top = capable.slice(0, 2);
  probed = top;
  writeCache(top);
  return top;
}

/** Top-rated installed voices that actually fire per-word `boundary` events. */
export function getTopWordCallbackVoices(): SpeechSynthesisVoice[] {
  if (probed.length === 0) {
    const cached = readCache();
    if (cached) probed = cached;
  }
  return probed.map(resolveLive).filter((voice): voice is SpeechSynthesisVoice => Boolean(voice));
}

export function ensureWordCallbackVoiceProbe() {
  if (!probePromise) {
    probePromise = runProbe().catch(() => []);
  }
  return probePromise;
}
