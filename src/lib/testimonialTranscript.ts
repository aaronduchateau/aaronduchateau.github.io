export type TranscriptWord = {
  text: string;
  start: number;
  end: number;
};

export type TranscriptSentence = {
  text: string;
  words: TranscriptWord[];
};

function flattenQuote(quote: string) {
  return quote.replace(/\s+/g, " ").trim();
}

function splitSentences(text: string): string[] {
  if (!text) return [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("en", { granularity: "sentence" });
    return Array.from(segmenter.segment(text), (part) => part.segment.trim()).filter(Boolean);
  }
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function isPunctuationToken(text: string) {
  return !/[a-z0-9]/i.test(text);
}

function wordsInSentence(sentence: string): TranscriptWord[] {
  const words: TranscriptWord[] = [];
  const token = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = token.exec(sentence))) {
    const next: TranscriptWord = {
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    };
    const prev = words[words.length - 1];
    if (prev && isPunctuationToken(next.text)) {
      prev.text = `${prev.text} ${next.text}`;
      prev.end = next.end;
      continue;
    }
    words.push(next);
  }
  return words;
}

/** Spoken form of a karaoke slice. Slashes/pipes become commas so local voices do not stop. */
export function speakableUtterance(text: string) {
  return text
    .replace(/[–—]/g, ", ")
    .replace(/\s*\/\s*/g, ", ")
    .replace(/\s*\|\s*/g, ", ")
    .replace(/\s*&+\s*/g, " and ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/,(?=\S)/g, ", ")
    .replace(/,\s*,+/g, ",")
    .replace(/\s+/g, " ")
    .trim();
}

/** End index (exclusive) of the next TTS chunk, preferring a comma/semicolon pause. */
export function nextSpeechChunkEnd(words: readonly TranscriptWord[], start: number, maxWords = 12) {
  if (start >= words.length) return words.length;
  const hard = Math.min(start + maxWords, words.length);
  if (hard >= words.length) return words.length;
  for (let i = hard - 1; i > start + 3; i--) {
    if (/[,;:]$/.test(words[i]?.text ?? "")) return i + 1;
  }
  return hard;
}

export function isUtteranceNearEnd(wordCount: number, progressIndex: number) {
  if (wordCount <= 2) return true;
  return progressIndex >= wordCount - 2;
}

/** Split a letter into sentences and in-sentence word spans for karaoke + TTS. */
export function splitTestimonialTranscript(quote: string): TranscriptSentence[] {
  const sentences = splitSentences(flattenQuote(quote));
  return sentences.map((text) => ({
    text,
    words: wordsInSentence(text),
  }));
}

export function wordIndexAt(words: readonly TranscriptWord[], charIndex: number) {
  if (words.length === 0) return -1;
  let found = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    if (charIndex >= word.start) found = i;
    if (charIndex >= word.start && charIndex < word.end) return i;
  }
  return found;
}

/** Estimated ms per word at a given speech rate (1 = normal). `pace` < 1 is faster. */
export function wordDurationsMs(words: readonly TranscriptWord[], rate: number, pace = 1) {
  const safeRate = Math.max(0.6, rate || 1);
  const stretch = Math.max(0.2, pace);
  return words.map((word) => {
    const chars = Math.max(word.text.replace(/[^a-z0-9]+/gi, "").length, 3);
    const punct = /[.!?,;:]$/.test(word.text) ? 120 : 0;
    return Math.round(((chars / 13.5) * (1000 / safeRate) + punct) * stretch);
  });
}

export function wordIndexForElapsed(durations: readonly number[], elapsedMs: number) {
  if (durations.length === 0) return -1;
  let acc = 0;
  for (let i = 0; i < durations.length; i++) {
    acc += durations[i] ?? 0;
    if (elapsedMs < acc) return i;
  }
  return durations.length - 1;
}

export function elapsedMsAtWord(durations: readonly number[], wordIndex: number) {
  let acc = 0;
  for (let i = 0; i < wordIndex; i++) acc += durations[i] ?? 0;
  return acc;
}

/** Slower than the karaoke clock so we do not undershoot real TTS. */
export function conservativeWordMs(word: TranscriptWord, rate: number) {
  const safeRate = Math.max(0.6, rate || 1);
  const chars = Math.max(word.text.replace(/[^a-z0-9]+/gi, "").length, 3);
  const punct = /[.!?,;:'")]+$/.test(word.text) ? 240 : 90;
  return Math.round((chars / 9) * (1000 / safeRate) + punct);
}

/**
 * Extra ms to wait after the engine's `end` event before changing the karaoke
 * sentence. Chrome often fires `end` at the start of the last word (or earlier);
 * the gap varies by voice, so this is based on the last word-boundary, not a
 * fixed sleep.
 */
export function remainingSpeechMs(
  words: readonly TranscriptWord[],
  spokenWordIndex: number,
  lastBoundaryAt: number | null,
  rate: number,
) {
  const last = words[words.length - 1];
  const lastMs = last ? conservativeWordMs(last, rate) : 220;
  const cushion = 160;

  if (words.length === 0) return 120;
  if (spokenWordIndex < 0 || lastBoundaryAt == null) {
    return Math.min(lastMs + cushion, 900);
  }

  const start = Math.min(spokenWordIndex, words.length - 1);
  let remaining = 0;
  for (let i = start; i < words.length; i++) {
    const word = words[i];
    if (word) remaining += conservativeWordMs(word, rate);
  }
  const elapsedOnCurrent = performance.now() - lastBoundaryAt;
  const current = words[start];
  if (current) remaining -= Math.min(elapsedOnCurrent, conservativeWordMs(current, rate));
  remaining += cushion;
  return Math.max(80, Math.min(Math.round(remaining), 2800));
}
