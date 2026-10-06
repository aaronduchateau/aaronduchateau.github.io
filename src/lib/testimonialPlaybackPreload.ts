import {
  cancelTestimonialSpeech,
  ensureTestimonialSpeech,
  unlockTestimonialSpeechGesture,
} from "@/lib/testimonialSpeech";
import {
  preloadTestimonialIntroSting,
  primeTestimonialIntroStingGesture,
  stopTestimonialIntroSting,
} from "@/theme/sounds";

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

/**
 * Call synchronously from a click/touch that will start (or auto-start)
 * testimonial playback — unlocks iOS WebKit speech + HTMLAudio for the sting.
 */
export function primeTestimonialPlaybackGesture(): void {
  unlockTestimonialSpeechGesture();
  primeTestimonialIntroStingGesture();
}

/** Hard-stop TTS + intro sting when the testimonials modal closes. */
export function haltTestimonialPlayback() {
  cancelTestimonialSpeech();
  stopTestimonialIntroSting();
}
