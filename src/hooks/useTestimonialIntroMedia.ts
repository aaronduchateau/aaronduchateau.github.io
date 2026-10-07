"use client";

import { useEffect, useRef } from "react";
import { testimonialIntroSpeechText } from "@/lib/testimonialIntro";
import { speakTestimonial } from "@/lib/testimonialSpeech";
import {
  pauseTestimonialIntroSting,
  playTestimonialIntroStingIfNeeded,
  resumeTestimonialIntroSting,
  stopTestimonialIntroSting,
  TESTIMONIAL_INTRO_HOLD_MS,
  TESTIMONIAL_INTRO_VOICE_DELAY_MS,
} from "@/theme/sounds";

type Options = {
  letterId: string;
  name: string;
  title: string;
  active: boolean;
  paused: boolean;
  onComplete: () => void;
};

export function useTestimonialIntroMedia({
  letterId,
  name,
  title,
  active,
  paused,
  onComplete,
}: Options) {
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const nameRef = useRef(name);
  nameRef.current = name;
  const titleRef = useRef(title);
  titleRef.current = title;
  const letterIdRef = useRef(letterId);
  letterIdRef.current = letterId;

  const generationRef = useRef(0);
  const voiceTimerRef = useRef(0);
  const holdTimerRef = useRef(0);
  const voiceRemainingRef = useRef(TESTIMONIAL_INTRO_VOICE_DELAY_MS);
  const voiceDueRef = useRef(0);
  const holdRemainingRef = useRef(TESTIMONIAL_INTRO_HOLD_MS);
  const holdDueRef = useRef(0);
  const voicedRef = useRef(false);
  const holdingRef = useRef(false);

  useEffect(() => {
    const clearTimers = () => {
      if (voiceTimerRef.current) window.clearTimeout(voiceTimerRef.current);
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      voiceTimerRef.current = 0;
      holdTimerRef.current = 0;
    };

    if (!active) {
      generationRef.current += 1;
      clearTimers();
      voicedRef.current = false;
      holdingRef.current = false;
      // Stop only when leaving an active intro (idle / reading). Do not rely on
      // effect cleanup for this — Strict Mode remount cleanup was silencing the
      // gesture-started sting while animations kept running.
      stopTestimonialIntroSting();
      return;
    }

    const generation = ++generationRef.current;
    voicedRef.current = false;
    holdingRef.current = false;
    voiceRemainingRef.current = TESTIMONIAL_INTRO_VOICE_DELAY_MS;
    holdRemainingRef.current = TESTIMONIAL_INTRO_HOLD_MS;

    const finish = () => {
      if (generationRef.current !== generation) return;
      if (pausedRef.current) return;
      holdingRef.current = false;
      onCompleteRef.current();
    };

    const armHold = (delay: number) => {
      holdingRef.current = true;
      holdDueRef.current = performance.now() + delay;
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = 0;
        finish();
      }, delay);
    };

    const speakIntro = () => {
      if (generationRef.current !== generation) return;
      if (pausedRef.current) return;
      voicedRef.current = true;
      void speakTestimonial({
        id: letterIdRef.current,
        quote: testimonialIntroSpeechText(nameRef.current, titleRef.current),
        gender: "female",
        cancelBefore: true,
        onEnd: () => {
          if (generationRef.current !== generation) return;
          if (pausedRef.current) {
            holdingRef.current = true;
            holdRemainingRef.current = TESTIMONIAL_INTRO_HOLD_MS;
            return;
          }
          armHold(TESTIMONIAL_INTRO_HOLD_MS);
        },
        onError: () => {
          if (generationRef.current !== generation) return;
          if (pausedRef.current) {
            holdingRef.current = true;
            holdRemainingRef.current = TESTIMONIAL_INTRO_HOLD_MS;
            return;
          }
          armHold(TESTIMONIAL_INTRO_HOLD_MS);
        },
      });
    };

    const armVoice = (delay: number) => {
      voiceDueRef.current = performance.now() + delay;
      voiceTimerRef.current = window.setTimeout(() => {
        voiceTimerRef.current = 0;
        speakIntro();
      }, delay);
    };

    // Play click may have already started the sting in-gesture; don't restart.
    playTestimonialIntroStingIfNeeded();
    if (!pausedRef.current) armVoice(TESTIMONIAL_INTRO_VOICE_DELAY_MS);

    return () => {
      clearTimers();
      // Intentionally do not stop the sting here. Cleanup runs on Strict Mode
      // remount and would mute intro audio while the swoop animation continues.
      if (generationRef.current === generation) {
        generationRef.current += 1;
      }
    };
  }, [active, letterId]);

  useEffect(() => {
    if (!active) return;

    if (paused) {
      pauseTestimonialIntroSting();
      if (voiceTimerRef.current) {
        window.clearTimeout(voiceTimerRef.current);
        voiceTimerRef.current = 0;
        voiceRemainingRef.current = Math.max(0, voiceDueRef.current - performance.now());
      }
      if (holdTimerRef.current) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = 0;
        holdRemainingRef.current = Math.max(0, holdDueRef.current - performance.now());
      }
      try {
        window.speechSynthesis?.pause();
      } catch {
        /* ignore */
      }
      return;
    }

    resumeTestimonialIntroSting();

    if (!voicedRef.current && voiceTimerRef.current === 0) {
      voiceDueRef.current = performance.now() + voiceRemainingRef.current;
      voiceTimerRef.current = window.setTimeout(() => {
        voiceTimerRef.current = 0;
        voicedRef.current = true;
        void speakTestimonial({
          id: letterIdRef.current,
          quote: testimonialIntroSpeechText(nameRef.current, titleRef.current),
          gender: "female",
          cancelBefore: true,
          onEnd: () => {
            if (pausedRef.current) {
              holdingRef.current = true;
              holdRemainingRef.current = TESTIMONIAL_INTRO_HOLD_MS;
              return;
            }
            holdingRef.current = true;
            holdDueRef.current = performance.now() + TESTIMONIAL_INTRO_HOLD_MS;
            holdTimerRef.current = window.setTimeout(() => {
              holdTimerRef.current = 0;
              holdingRef.current = false;
              onCompleteRef.current();
            }, TESTIMONIAL_INTRO_HOLD_MS);
          },
          onError: () => {
            if (pausedRef.current) {
              holdingRef.current = true;
              holdRemainingRef.current = TESTIMONIAL_INTRO_HOLD_MS;
              return;
            }
            holdingRef.current = true;
            holdDueRef.current = performance.now() + TESTIMONIAL_INTRO_HOLD_MS;
            holdTimerRef.current = window.setTimeout(() => {
              holdTimerRef.current = 0;
              holdingRef.current = false;
              onCompleteRef.current();
            }, TESTIMONIAL_INTRO_HOLD_MS);
          },
        });
      }, voiceRemainingRef.current);
      return;
    }

    if (holdingRef.current && holdTimerRef.current === 0) {
      holdDueRef.current = performance.now() + holdRemainingRef.current;
      holdTimerRef.current = window.setTimeout(() => {
        holdTimerRef.current = 0;
        holdingRef.current = false;
        onCompleteRef.current();
      }, holdRemainingRef.current);
      return;
    }

    try {
      window.speechSynthesis?.resume();
    } catch {
      /* ignore */
    }
  }, [active, paused]);
}
