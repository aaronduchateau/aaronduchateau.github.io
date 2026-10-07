"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TestimonialVoiceGender } from "@/lib/testimonialSpeech";
import {
  ensureTestimonialPlaybackPreload,
  primeTestimonialPlaybackGesture,
} from "@/lib/testimonialPlaybackPreload";
import {
  cancelTestimonialSpeech,
  pauseTestimonialSpeech,
  resumeTestimonialSpeech,
  speakTestimonial,
  speechEnginePaused,
  pickTestimonialVoice,
  testimonialSpeechTune,
  testimonialSpeechUsesChunks,
} from "@/lib/testimonialSpeech";
import { playTestimonialIntroSting, stopTestimonialIntroSting } from "@/theme/sounds";
import {
  elapsedMsAtWord,
  isUtteranceNearEnd,
  nextSpeechChunkEnd,
  remainingSpeechMs,
  speakableUtterance,
  splitTestimonialTranscript,
  wordDurationsMs,
  wordIndexAt,
  wordIndexForElapsed,
  type TranscriptSentence,
} from "@/lib/testimonialTranscript";

export type TestimonialSpeechStatus = "idle" | "playing" | "paused";
export type TestimonialSpeechPhase = "intro" | "reading";

type Letter = {
  id: string;
  quote: string;
  name: string;
  voice: { gender: TestimonialVoiceGender };
};

type WordClock = {
  raf: number;
  start: number;
  pauseAccum: number;
  pausedAt: number | null;
  durations: number[];
  generation: number;
  maxIndex: number;
};

export function useTestimonialSpeech(
  letter: Letter | null,
  options?: { onPlaybackComplete?: () => void },
) {
  const [supported, setSupported] = useState(false);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState<TestimonialSpeechStatus>("idle");
  const [phase, setPhase] = useState<TestimonialSpeechPhase>("intro");
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(-1);

  const letterRef = useRef(letter);
  letterRef.current = letter;
  const statusRef = useRef(status);
  statusRef.current = status;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const sentenceIndexRef = useRef(0);
  const generationRef = useRef(0);
  const restartOnResumeRef = useRef(false);
  const ignoreErrorRef = useRef(false);
  const clockRef = useRef<WordClock | null>(null);
  const onPlaybackCompleteRef = useRef(options?.onPlaybackComplete);
  onPlaybackCompleteRef.current = options?.onPlaybackComplete;
  const speakAtRef = useRef<(index: number, cancelBefore: boolean, fromWord?: number) => void>(
    () => {},
  );
  const wordIndexRef = useRef(-1);
  const spokenWordIndexRef = useRef(-1);
  const lastBoundaryAtRef = useRef<number | null>(null);
  const advanceTimerRef = useRef(0);
  const pendingAdvanceRef = useRef<{ generation: number; nextIndex: number } | null>(null);

  const assignWordIndex = useCallback((index: number) => {
    wordIndexRef.current = index;
    setWordIndex(index);
  }, []);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = 0;
    }
    pendingAdvanceRef.current = null;
  }, []);

  const sentences = useMemo<TranscriptSentence[]>(
    () => (letter ? splitTestimonialTranscript(letter.quote) : []),
    [letter],
  );
  const sentencesRef = useRef(sentences);
  sentencesRef.current = sentences;

  const stopClock = useCallback(() => {
    const clock = clockRef.current;
    if (clock) window.cancelAnimationFrame(clock.raf);
    clockRef.current = null;
  }, []);

  const pauseClock = useCallback(() => {
    const clock = clockRef.current;
    if (clock && clock.pausedAt == null) clock.pausedAt = performance.now();
  }, []);

  const tickClock = useCallback(() => {
    const clock = clockRef.current;
    if (!clock || clock.generation !== generationRef.current) return;
    if (clock.pausedAt != null) return;
    const elapsed = performance.now() - clock.start - clock.pauseAccum;
    const index = wordIndexForElapsed(clock.durations, elapsed);
    assignWordIndex(Math.min(index, clock.maxIndex));
    clock.raf = window.requestAnimationFrame(tickClock);
  }, [assignWordIndex]);

  const resumeClock = useCallback(() => {
    const clock = clockRef.current;
    if (!clock || clock.pausedAt == null) return;
    clock.pauseAccum += performance.now() - clock.pausedAt;
    clock.pausedAt = null;
    clock.raf = window.requestAnimationFrame(tickClock);
  }, [tickClock]);

  const startClock = useCallback(
    (
      words: TranscriptSentence["words"],
      rate: number,
      generation: number,
      pace = 1,
      startWord = 0,
      maxIndex = Math.max(0, words.length - 1),
    ) => {
      stopClock();
      const durations = wordDurationsMs(words, rate, pace);
      const already = elapsedMsAtWord(durations, startWord);
      clockRef.current = {
        raf: 0,
        start: performance.now() - already,
        pauseAccum: 0,
        pausedAt: null,
        durations,
        generation,
        maxIndex,
      };
      assignWordIndex(startWord < words.length ? startWord : -1);
      clockRef.current.raf = window.requestAnimationFrame(tickClock);
    },
    [assignWordIndex, stopClock, tickClock],
  );

  useEffect(() => {
    let cancelled = false;
    void ensureTestimonialPlaybackPreload().then((ok) => {
      if (cancelled) return;
      setSupported(ok);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const stop = useCallback(() => {
    generationRef.current += 1;
    ignoreErrorRef.current = true;
    cancelTestimonialSpeech();
    stopTestimonialIntroSting();
    stopClock();
    clearAdvanceTimer();
    restartOnResumeRef.current = false;
    sentenceIndexRef.current = 0;
    setSentenceIndex(0);
    assignWordIndex(-1);
    setPhase("intro");
    setStatus("idle");
  }, [assignWordIndex, clearAdvanceTimer, stopClock]);

  useEffect(() => {
    const keep = statusRef.current;
    generationRef.current += 1;
    ignoreErrorRef.current = true;
    cancelTestimonialSpeech();
    stopTestimonialIntroSting();
    stopClock();
    clearAdvanceTimer();
    sentenceIndexRef.current = 0;
    setSentenceIndex(0);
    assignWordIndex(-1);
    spokenWordIndexRef.current = -1;
    lastBoundaryAtRef.current = null;

    if (keep === "playing") {
      restartOnResumeRef.current = false;
      setPhase("intro");
      setStatus("playing");
    } else if (keep === "paused") {
      restartOnResumeRef.current = true;
      setPhase("reading");
      setStatus("paused");
    } else {
      restartOnResumeRef.current = false;
      setPhase("intro");
      setStatus("idle");
    }

    return () => {
      generationRef.current += 1;
      ignoreErrorRef.current = true;
      cancelTestimonialSpeech();
      stopTestimonialIntroSting();
      stopClock();
      clearAdvanceTimer();
    };
  }, [assignWordIndex, clearAdvanceTimer, letter?.id, stopClock]);

  const speakAt = useCallback(
    (index: number, cancelBefore: boolean, fromWord = 0) => {
      const current = letterRef.current;
      const list = sentencesRef.current;
      const sentence = list[index];
      if (!current || !sentence) {
        stopClock();
        setStatus("idle");
        assignWordIndex(-1);
        return;
      }

      const picked = pickTestimonialVoice(current.id, current.voice.gender);
      const chunked = testimonialSpeechUsesChunks(current.voice.gender, picked);
      const startWord = chunked
        ? Math.max(0, Math.min(fromWord, sentence.words.length))
        : 0;
      if (startWord >= sentence.words.length) {
        stopClock();
        const next = index + 1;
        if (next >= list.length) {
          onPlaybackCompleteRef.current?.();
          return;
        }
        speakAt(next, false, 0);
        return;
      }

      const chunkEnd = chunked
        ? nextSpeechChunkEnd(sentence.words, startWord)
        : sentence.words.length;
      const slice = sentence.words.slice(startWord, chunkEnd);
      const spokenText = chunked
        ? speakableUtterance(slice.map((word) => word.text).join(" "))
        : sentence.text;
      const spokenTokens = chunked && spokenText
        ? spokenText.split(/\s+/).map((text, i, all) => {
            const before = all.slice(0, i).join(" ");
            const start = before ? before.length + 1 : 0;
            return { text, start, end: start + text.length };
          })
        : sentence.words;

      const generation = ++generationRef.current;
      sentenceIndexRef.current = index;
      setSentenceIndex(index);
      if (startWord === 0) {
        assignWordIndex(-1);
        spokenWordIndexRef.current = -1;
        lastBoundaryAtRef.current = null;
      } else {
        assignWordIndex(startWord);
        spokenWordIndexRef.current = startWord;
      }
      clearAdvanceTimer();
      ignoreErrorRef.current = false;
      restartOnResumeRef.current = false;
      const tune = testimonialSpeechTune(current.id, current.voice.gender);

      const finishSentence = () => {
        if (generationRef.current !== generation) return;
        if (statusRef.current !== "playing") return;
        pendingAdvanceRef.current = null;
        const next = index + 1;
        if (next >= list.length) {
          const advance = onPlaybackCompleteRef.current;
          if (advance) {
            advance();
            return;
          }
          assignWordIndex(-1);
          setStatus("idle");
          return;
        }
        speakAt(next, false, 0);
      };

      void speakTestimonial({
        id: current.id,
        quote: spokenText || sentence.text,
        gender: current.voice.gender,
        cancelBefore,
        onStart: () => {
          if (generationRef.current !== generation) return;
          setStatus("playing");
          startClock(
            sentence.words,
            tune.rate,
            generation,
            current.voice.gender === "female" ? 0.8 : 1,
            startWord,
            chunkEnd - 1,
          );
        },
        onBoundary: (event) => {
          if (generationRef.current !== generation) return;
          if (event.name && event.name !== "word") return;
          if (typeof event.charIndex !== "number") return;
          const local = wordIndexAt(spokenTokens, event.charIndex);
          if (local < 0) return;
          const nextIndex = chunked
            ? Math.min(startWord + local, chunkEnd - 1)
            : local;
          spokenWordIndexRef.current = nextIndex;
          lastBoundaryAtRef.current = performance.now();
          assignWordIndex(nextIndex);
          const clock = clockRef.current;
          if (!clock || clock.generation !== generation) return;
          const snap = elapsedMsAtWord(clock.durations, nextIndex);
          clock.start = performance.now() - snap - clock.pauseAccum;
        },
        onEnd: () => {
          if (generationRef.current !== generation) return;
          if (statusRef.current !== "playing") return;
          const progress = Math.max(spokenWordIndexRef.current, wordIndexRef.current, startWord);
          const chunkLast = chunkEnd - 1;

          if (chunked) {
            if (
              !isUtteranceNearEnd(chunkEnd - startWord, progress - startWord) &&
              progress < chunkLast
            ) {
              const resumeFrom = Math.min(
                Math.max(progress + 1, startWord + 1),
                sentence.words.length,
              );
              if (resumeFrom > startWord && resumeFrom < sentence.words.length) {
                speakAt(index, false, resumeFrom);
                return;
              }
            }

            if (chunkEnd < sentence.words.length) {
              speakAt(index, false, chunkEnd);
              return;
            }
          }

          stopClock();
          const last = sentence.words.length - 1;
          if (last >= 0) assignWordIndex(last);
          const delay = remainingSpeechMs(
            sentence.words,
            spokenWordIndexRef.current,
            lastBoundaryAtRef.current,
            tune.rate,
          );
          pendingAdvanceRef.current = { generation, nextIndex: index + 1 };
          if (delay <= 16) {
            finishSentence();
            return;
          }
          advanceTimerRef.current = window.setTimeout(() => {
            advanceTimerRef.current = 0;
            finishSentence();
          }, delay);
        },
        onError: () => {
          if (generationRef.current !== generation) return;
          if (ignoreErrorRef.current || statusRef.current === "paused") return;
          stopClock();
          clearAdvanceTimer();
          setStatus("idle");
          assignWordIndex(-1);
        },
      });
    },
    [assignWordIndex, clearAdvanceTimer, startClock, stopClock],
  );
  speakAtRef.current = speakAt;

  const completeIntro = useCallback(
    (letterId: string) => {
      if (phaseRef.current !== "intro") return;
      if (statusRef.current !== "playing") return;
      if (letterRef.current?.id !== letterId) return;
      phaseRef.current = "reading";
      setPhase("reading");
      speakAt(0, true);
    },
    [speakAt],
  );

  const toggle = useCallback(() => {
    const current = letterRef.current;
    if (!current || !supported || !ready) return;

    if (status === "playing") {
      if (phase === "intro") {
        pauseTestimonialSpeech();
        setStatus("paused");
        return;
      }
      if (pendingAdvanceRef.current) {
        if (advanceTimerRef.current) {
          window.clearTimeout(advanceTimerRef.current);
          advanceTimerRef.current = 0;
        }
        pauseClock();
        setStatus("paused");
        return;
      }
      pauseTestimonialSpeech();
      pauseClock();
      window.setTimeout(() => {
        if (speechEnginePaused()) {
          setStatus("paused");
          restartOnResumeRef.current = false;
          return;
        }
        ignoreErrorRef.current = true;
        cancelTestimonialSpeech();
        restartOnResumeRef.current = true;
        setStatus("paused");
      }, 40);
      return;
    }

    if (status === "paused") {
      // Resume may speak after this turn — re-prime iOS WebKit in the tap.
      primeTestimonialPlaybackGesture();
      if (phase === "intro") {
        setStatus("playing");
        resumeTestimonialSpeech();
        return;
      }
      const pending = pendingAdvanceRef.current;
      if (pending) {
        pendingAdvanceRef.current = null;
        if (generationRef.current !== pending.generation) {
          setStatus("playing");
          speakAt(sentenceIndexRef.current, true);
          return;
        }
        setStatus("playing");
        const list = sentencesRef.current;
        if (pending.nextIndex >= list.length) {
          onPlaybackCompleteRef.current?.();
          return;
        }
        speakAt(pending.nextIndex, true);
        return;
      }
      if (restartOnResumeRef.current || !speechEnginePaused()) {
        setStatus("playing");
        speakAt(sentenceIndexRef.current, true);
        return;
      }
      resumeTestimonialSpeech();
      setStatus("playing");
      resumeClock();
      return;
    }

    // Fresh start: unlock TTS in this tap, and start the intro sting here so it
    // is not killed by a deferred gesture-prime pause (manual play path).
    primeTestimonialPlaybackGesture();
    playTestimonialIntroSting();
    setPhase("intro");
    setStatus("playing");
  }, [pauseClock, phase, ready, resumeClock, speakAt, status, supported]);

  return {
    supported,
    ready,
    status,
    phase,
    toggle,
    stop,
    completeIntro,
    sentences,
    sentenceIndex,
    wordIndex,
  };
}
