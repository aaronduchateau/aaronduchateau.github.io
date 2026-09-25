import type { ActivityEventType } from "./types";

export type PointScheduleEntry = {
  type: ActivityEventType;
  points: number;
  label: string;
  description: string;
};

/** Single source of truth for points + legend copy. */
export const POINT_SCHEDULE: readonly PointScheduleEntry[] = [
  {
    type: "modal.open",
    points: 10,
    label: "Open a modal",
    description: "Open any content modal (video, gallery, demo, article).",
  },
  {
    type: "modal.close",
    points: 5,
    label: "Close a modal",
    description: "Close a content modal (once per modal id).",
  },
  {
    type: "theme.change",
    points: 15,
    label: "Change theme",
    description: "Select a theme from Options or the theme playground (once per theme; intro picks do not count).",
  },
  {
    type: "timeline.select",
    points: 5,
    label: "Career timeline",
    description: "Select an employer on the career timeline (once per role).",
  },
  {
    type: "timeline.pause",
    points: 3,
    label: "Pause timeline",
    description: "Pause career timeline auto-advance.",
  },
  {
    type: "project.leavePreview",
    points: 8,
    label: "Leave preview",
    description: "Arm a major-project card leave preview (once per project).",
  },
  {
    type: "project.visitSite",
    points: 12,
    label: "Visit site",
    description: "Confirm Visit Site on a major-project leave preview (once per project).",
  },
  {
    type: "photo.view",
    points: 5,
    label: "View a photo",
    description: "View a photo or before/after slide in a media modal.",
  },
  {
    type: "button.click",
    points: 2,
    label: "Content click",
    description: "Click a stamped content control (card / CTA).",
  },
  {
    type: "video.complete",
    points: 25,
    label: "Finish a video",
    description: "Watch a video through to the end.",
  },
  {
    type: "sound.zeepEnable",
    points: 10,
    label: "Enable Zeep Zoop",
    description: "Confirm and enable Zeep Zoop Click.",
  },
  {
    type: "demo.photoCritique",
    points: 15,
    label: "Run photo critique",
    description: "Complete a Photo critique analysis.",
  },
  {
    type: "quiz.complete",
    points: 20,
    label: "Pass a Quiz Power",
    description: "Finish a Quiz Power run with fewer than three misses.",
  },
  {
    type: "milestone.unlock",
    points: 0,
    label: "Milestone",
    description: "Bonus unlock from the milestone rules engine (points set per milestone).",
  },
] as const;

const byType = Object.fromEntries(POINT_SCHEDULE.map((e) => [e.type, e])) as Record<
  ActivityEventType,
  PointScheduleEntry
>;

export function pointsFor(type: ActivityEventType): number {
  return byType[type]?.points ?? 0;
}

export function labelFor(type: ActivityEventType): string {
  return byType[type]?.label ?? type;
}
