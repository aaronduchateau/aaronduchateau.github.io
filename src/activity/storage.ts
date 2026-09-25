import {
  ACTIVITY_STORAGE_KEY,
  type ActivityEventType,
  type ActivityLogEntry,
  type ActivityStore,
  type AwardedAction,
} from "./types";
import { canonicalizeThemeId } from "@/theme/types";

export function emptyActivityStore(): ActivityStore {
  return {
    version: 1,
    totalScore: 0,
    log: [],
    awarded: {},
  };
}

function migrateThemeIdField(value: string): string {
  return canonicalizeThemeId(value) ?? value;
}

/** Remap legacy IP-adjacent theme ids in theme.change awards / log rows. */
function migrateThemeIdsInStore(store: ActivityStore): { store: ActivityStore; changed: boolean } {
  let changed = false;

  const awarded: Record<string, AwardedAction> = {};
  for (const action of Object.values(store.awarded)) {
    if (action.type !== "theme.change") {
      awarded[action.eventKey] = action;
      continue;
    }
    const contentId = migrateThemeIdField(action.contentId);
    const eventKey = `theme.change:${contentId}`;
    if (contentId !== action.contentId || eventKey !== action.eventKey) changed = true;
    const existing = awarded[eventKey];
    if (!existing || action.firstAwardedAt < existing.firstAwardedAt) {
      awarded[eventKey] = { ...action, contentId, eventKey };
    }
  }
  if (Object.keys(awarded).length !== Object.keys(store.awarded).length) changed = true;

  const log = store.log.map((entry) => {
    if (entry.type !== "theme.change") return entry;
    const contentId = migrateThemeIdField(entry.contentId);
    const eventKey = `theme.change:${contentId}`;
    let meta = entry.meta;
    if (meta && typeof meta.previous === "string") {
      const previous = migrateThemeIdField(meta.previous);
      if (previous !== meta.previous) {
        meta = { ...meta, previous };
        changed = true;
      }
    }
    if (contentId !== entry.contentId || eventKey !== entry.eventKey) {
      changed = true;
      return { ...entry, contentId, eventKey, meta };
    }
    return meta !== entry.meta ? { ...entry, meta } : entry;
  });

  return { store: changed ? { ...store, awarded, log } : store, changed };
}

function isEventType(value: unknown): value is ActivityEventType {
  return (
    value === "modal.open" ||
    value === "modal.close" ||
    value === "photo.view" ||
    value === "button.click" ||
    value === "video.complete" ||
    value === "theme.change" ||
    value === "timeline.select" ||
    value === "timeline.pause" ||
    value === "project.leavePreview" ||
    value === "project.visitSite" ||
    value === "sound.zeepEnable" ||
    value === "demo.photoCritique" ||
    value === "quiz.complete" ||
    value === "milestone.unlock"
  );
}

function parseAwarded(raw: unknown): Record<string, AwardedAction> {
  if (!raw || typeof raw !== "object") return {};
  const out: Record<string, AwardedAction> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const v = value as Record<string, unknown>;
    if (!isEventType(v.type)) continue;
    if (typeof v.eventKey !== "string" || typeof v.contentId !== "string") continue;
    if (typeof v.label !== "string" || typeof v.points !== "number") continue;
    if (typeof v.firstAwardedAt !== "number") continue;
    out[key] = {
      eventKey: v.eventKey,
      type: v.type,
      contentId: v.contentId,
      label: v.label,
      points: v.points,
      firstAwardedAt: v.firstAwardedAt,
    };
  }
  return out;
}

function parseLog(raw: unknown): ActivityLogEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: ActivityLogEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const v = item as Record<string, unknown>;
    if (!isEventType(v.type)) continue;
    if (typeof v.id !== "string" || typeof v.ts !== "number") continue;
    if (typeof v.eventKey !== "string" || typeof v.contentId !== "string") continue;
    if (typeof v.label !== "string" || typeof v.pointsAwarded !== "number") continue;
    out.push({
      id: v.id,
      ts: v.ts,
      type: v.type,
      eventKey: v.eventKey,
      contentId: v.contentId,
      label: v.label,
      pointsAwarded: v.pointsAwarded,
      meta:
        v.meta && typeof v.meta === "object" ? (v.meta as Record<string, unknown>) : undefined,
    });
  }
  return out;
}

export function loadActivityStore(): ActivityStore {
  if (typeof window === "undefined") return emptyActivityStore();
  try {
    const raw = window.localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return emptyActivityStore();
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (parsed.version !== 1) return emptyActivityStore();
    const { store, changed } = migrateThemeIdsInStore({
      version: 1,
      totalScore: typeof parsed.totalScore === "number" ? parsed.totalScore : 0,
      log: parseLog(parsed.log),
      awarded: parseAwarded(parsed.awarded),
    });
    if (changed) saveActivityStore(store);
    return store;
  } catch {
    return emptyActivityStore();
  }
}

export function saveActivityStore(store: ActivityStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* private mode / quota */
  }
}

export function clearActivityStore(): ActivityStore {
  const empty = emptyActivityStore();
  if (typeof window === "undefined") return empty;
  try {
    window.localStorage.removeItem(ACTIVITY_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  return empty;
}
