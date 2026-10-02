import { clearCelebrationToasts } from "./celebrationQueue";
import {
  CHEAT_UNLOCK_ALL_CONTENT_ID,
  CHEAT_UNLOCK_ALL_EVENT_KEY,
  PUMPKIN_EATER_CHEAT_CODE,
  resolveCheatUnlock,
} from "./cheatRules";
import { resolveActivityAward } from "./engine";
import { dispatchMilestoneUnlockCelebration } from "./milestoneCelebration";
import { buildMilestoneFacts } from "./milestoneFacts";
import { resolveMilestoneUnlocks } from "./milestoneEngine";
import { MILESTONE_SCHEDULE } from "./milestones";
import { labelFor } from "./pointSchedule";
import {
  clearActivityStore,
  emptyActivityStore,
  loadActivityStore,
  saveActivityStore,
} from "./storage";
import type {
  ActivityEventType,
  ActivityStore,
  RecordActivityInput,
} from "./types";

let store: ActivityStore = emptyActivityStore();
let hydrated = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeActivity(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActivityStoreSnapshot(): ActivityStore {
  return store;
}

/**
 * Load from localStorage, then re-run milestone rules so score tiers
 * earned before they existed (or before a page refresh) still unlock.
 */
export async function hydrateActivityStore(): Promise<ActivityStore> {
  store = loadActivityStore();
  hydrated = true;
  const before = store.totalScore;
  const awardedBefore = Object.keys(store.awarded).length;
  store = await applyMilestoneUnlocks(store, Date.now());
  if (
    store.totalScore !== before ||
    Object.keys(store.awarded).length !== awardedBefore
  ) {
    saveActivityStore(store);
  }
  notify();
  return store;
}

export function buildEventKey(type: ActivityEventType, contentId: string): string {
  return `${type}:${contentId}`;
}

function newEntryId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function applyMilestoneUnlocks(
  next: ActivityStore,
  ts: number,
  options?: { celebrate?: boolean },
): Promise<ActivityStore> {
  const facts = buildMilestoneFacts(next);
  const unlocks = await resolveMilestoneUnlocks(facts);
  if (unlocks.length === 0) return next;

  let totalScore = next.totalScore;
  const log = [...next.log];
  const awarded = { ...next.awarded };

  for (const unlock of unlocks) {
    const eventKey = buildEventKey("milestone.unlock", unlock.milestoneId);
    if (awarded[eventKey]) continue;

    totalScore += unlock.points;
    awarded[eventKey] = {
      eventKey,
      type: "milestone.unlock",
      contentId: unlock.milestoneId,
      label: unlock.title,
      points: unlock.points,
      firstAwardedAt: ts,
    };
    log.push({
      id: newEntryId(),
      ts,
      type: "milestone.unlock",
      eventKey,
      contentId: unlock.milestoneId,
      label: unlock.title,
      pointsAwarded: unlock.points,
      meta: { kind: "milestone" },
    });

    if (options?.celebrate) {
      dispatchMilestoneUnlockCelebration(unlock);
    }
  }

  const MAX_LOG = 500;
  return {
    version: 1,
    totalScore,
    awarded,
    log: log.length > MAX_LOG ? log.slice(log.length - MAX_LOG) : log,
  };
}

export type UnlockAllCheatStatus = "applied" | "rejected" | "alreadyApplied";

/**
 * Cheat-code path: rules engine decides grant; silent apply plants every
 * missing `MILESTONE_SCHEDULE` unlock (points 0) + bonus score. Never celebrates.
 */
export async function applyUnlockAllCheat(code: string): Promise<UnlockAllCheatStatus> {
  if (typeof window === "undefined") return "rejected";
  if (!hydrated) {
    store = loadActivityStore();
    hydrated = true;
  }

  const codeAccepted = code.trim() === PUMPKIN_EATER_CHEAT_CODE;
  if (!codeAccepted) return "rejected";

  const decision = await resolveCheatUnlock({
    codeAccepted: true,
    cheatAlreadyAwarded: Boolean(store.awarded[CHEAT_UNLOCK_ALL_EVENT_KEY]),
  });
  if (decision.kind === "alreadyApplied") return "alreadyApplied";
  if (decision.kind !== "grant") return "rejected";

  const ts = Date.now();
  const awarded = { ...store.awarded };
  const log = [...store.log];
  let totalScore = store.totalScore;

  for (const milestone of MILESTONE_SCHEDULE) {
    const eventKey = buildEventKey("milestone.unlock", milestone.id);
    if (awarded[eventKey]) continue;
    awarded[eventKey] = {
      eventKey,
      type: "milestone.unlock",
      contentId: milestone.id,
      label: milestone.title,
      points: 0,
      firstAwardedAt: ts,
    };
    log.push({
      id: newEntryId(),
      ts,
      type: "milestone.unlock",
      eventKey,
      contentId: milestone.id,
      label: milestone.title,
      pointsAwarded: 0,
      meta: { kind: "cheat-grant" },
    });
  }

  totalScore += decision.bonusPoints;
  awarded[CHEAT_UNLOCK_ALL_EVENT_KEY] = {
    eventKey: CHEAT_UNLOCK_ALL_EVENT_KEY,
    type: "cheat.unlock-all",
    contentId: CHEAT_UNLOCK_ALL_CONTENT_ID,
    label: "Pumpkin Eater unlock-all",
    points: decision.bonusPoints,
    firstAwardedAt: ts,
  };
  log.push({
    id: newEntryId(),
    ts,
    type: "cheat.unlock-all",
    eventKey: CHEAT_UNLOCK_ALL_EVENT_KEY,
    contentId: CHEAT_UNLOCK_ALL_CONTENT_ID,
    label: "Pumpkin Eater unlock-all",
    pointsAwarded: decision.bonusPoints,
    meta: { kind: "cheat", bonusPoints: decision.bonusPoints },
  });

  const MAX_LOG = 500;
  store = {
    version: 1,
    totalScore,
    awarded,
    log: log.length > MAX_LOG ? log.slice(log.length - MAX_LOG) : log,
  };
  saveActivityStore(store);
  clearCelebrationToasts();
  notify();
  return "applied";
}

/**
 * Append a chronological log row always; award points once per eventKey
 * via the activity rules engine, then evaluate milestoneFacts.
 */
export async function recordActivity(input: RecordActivityInput): Promise<void> {
  if (typeof window === "undefined") return;
  if (!hydrated) {
    store = loadActivityStore();
    hydrated = true;
  }

  const contentId = input.contentId.trim();
  if (!contentId) return;
  // Milestones / cheats are awarded only by their dedicated engines.
  if (input.type === "milestone.unlock" || input.type === "cheat.unlock-all") return;

  const eventKey = buildEventKey(input.type, contentId);
  const alreadyAwarded = Boolean(store.awarded[eventKey]);
  const result = await resolveActivityAward({
    eventKey,
    eventType: input.type,
    contentId,
    alreadyAwarded,
  });

  const label = input.label?.trim() || labelFor(input.type);
  const ts = Date.now();
  let pointsAwarded = 0;
  let next: ActivityStore = {
    version: 1,
    totalScore: store.totalScore,
    log: [...store.log],
    awarded: { ...store.awarded },
  };

  if (result.kind === "award" && result.points > 0) {
    pointsAwarded = result.points;
    next.totalScore += result.points;
    next.awarded[eventKey] = {
      eventKey,
      type: input.type,
      contentId,
      label,
      points: result.points,
      firstAwardedAt: ts,
    };
  }

  next.log.push({
    id: newEntryId(),
    ts,
    type: input.type,
    eventKey,
    contentId,
    label,
    pointsAwarded,
    meta: input.meta,
  });

  const MAX_LOG = 500;
  if (next.log.length > MAX_LOG) {
    next.log = next.log.slice(next.log.length - MAX_LOG);
  }

  next = await applyMilestoneUnlocks(next, ts, { celebrate: true });

  store = next;
  saveActivityStore(store);
  notify();
}

export function resetActivityStore(): void {
  store = clearActivityStore();
  hydrated = true;
  notify();
}
