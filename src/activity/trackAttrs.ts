/** Stamp content ids onto interactive DOM for delegated click tracking. */
export function trackAttrs(id: string): { "data-track-id": string } {
  return { "data-track-id": id };
}

export const TRACK_IGNORE_ATTR = { "data-track-ignore": "" } as const;
