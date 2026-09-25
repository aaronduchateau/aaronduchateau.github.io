import { cancelTestimonialSpeech, ensureTestimonialSpeech } from "@/lib/testimonialSpeech";
import { preloadTestimonialIntroSting, stopTestimonialIntroSting } from "@/theme/sounds";

let preloadPromise: Promise<boolean> | null = null;

/**
 * Warm EasySpeech + the Take My Word intro sting once.
 * Resolves true when speech synthesis is usable.
 */
export function ensureTestimonialPlaybackPreload(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (!preloadPromise) {
    preloadPromise = Promise.all([
      ensureTestimonialSpeech(),
      preloadTestimonialIntroSting(),
    ]).then(([speechOk]) => speechOk);
  }
  return preloadPromise;
}

/** Hard-stop TTS + intro sting when the testimonials modal closes. */
export function haltTestimonialPlayback() {
  cancelTestimonialSpeech();
  stopTestimonialIntroSting();
}
