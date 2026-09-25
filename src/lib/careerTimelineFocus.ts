/** Deep-link the Career timeline from hero Learn more (and similar CTAs). */

export const CAREER_TIMELINE_FOCUS_EVENT = "portfolio:career-timeline-focus";

export type CareerTimelineFocusDetail = {
  /** `workHistory[].id` — e.g. Palo Alto Software is `"4"`. */
  workHistoryId: string;
  /** Pause auto-advance after selecting (default true). */
  pause?: boolean;
};

export function focusCareerTimeline(workHistoryId: string, opts?: { pause?: boolean }) {
  if (typeof window === "undefined") return;
  document.getElementById("work")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
  window.dispatchEvent(
    new CustomEvent<CareerTimelineFocusDetail>(CAREER_TIMELINE_FOCUS_EVENT, {
      detail: { workHistoryId, pause: opts?.pause ?? true },
    }),
  );
}
