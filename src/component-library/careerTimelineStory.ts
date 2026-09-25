import { workHistory } from "@/data/content";
import type { LibraryPropMap } from "./types";

function rowById(id: string | undefined) {
  return workHistory.find((row) => row.id === id) ?? workHistory[0];
}

/** Parent lookup: role id → presentational timeline items + active index. */
export function hydrateCareerTimelineLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const row = rowById(props.workHistoryId);
  const activeIndex = Math.max(
    0,
    workHistory.findIndex((item) => item.id === row.id),
  );
  return {
    ...props,
    workHistoryId: row.id,
    items: JSON.stringify(workHistory),
    activeIndex: String(activeIndex),
    paused: props.paused === "false" ? "false" : "true",
  };
}

export function applyCareerTimelineControl(
  props: LibraryPropMap,
  key: string,
  value: string,
): LibraryPropMap {
  const next = { ...props, [key]: value };
  if (key === "workHistoryId") return hydrateCareerTimelineLibraryProps(next);
  return next;
}

export function careerTimelineJsonNeedsHydration(props: LibraryPropMap): boolean {
  return !props.items;
}
