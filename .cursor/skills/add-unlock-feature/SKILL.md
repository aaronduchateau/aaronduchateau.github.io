---
name: add-unlock-feature
description: >-
  Add a portfolio-game unlock (milestone prize, gated media, or Options
  deep-link) using the rules-engine prize catalog. Use when adding an unlock
  feature, gating Fun things / Random media, wiring Timekeeper or other
  quests to content, or adding a View unlocked content route on the easter-egg
  board.
---

# Add an unlock feature

Unlocks are **rules + prizes + a route catalog**. Do not add `if (milestoneId === "…")` or `if (themeId === "…")` in MediaModal, Options, or the easter-egg board.

## Current strategy

1. **json-rules-engine** unlocks a milestone once (`src/activity/milestones.ts` → `allMilestoneRules`).
2. **`MILESTONE_SCHEDULE` prizes** grant sounds, themes, cards, or `feature` ids.
3. **`resolveGrantedPrizes`** is the only apply path (`featureIds`, sound sets, theme ids).
4. **`UNLOCK_FEATURE_CATALOG`** maps each `featureId` to a label + query-param target (`src/activity/unlockFeatures.ts`).
5. **Gated media** sets `gatedByFeature` on the item. `applyFeatureGates` turns that into `locked` from `featureIds`. Static `locked: true` means still locked (no feature yet).
6. **View unlocked content** on the easter-egg drill-down comes from `viewTargetForPrize` — never a one-off button.

Query params only (`?modal=`, `?item=`, `?path=`, `?options=`). Do not add Next.js pages for unlocks.

## Checklist (copy and track)

```
Unlock feature:
- [ ] Milestone rule exists (or reuse one, e.g. timeline-pause / Timekeeper)
- [ ] Prize on MILESTONE_SCHEDULE (sound | theme | feature)
- [ ] If feature: catalog entry in unlockFeatures.ts (label + target + gatedMediaIds)
- [ ] If media: gatedByFeature on the item (not a component if)
- [ ] View target resolves (sound → Options sounds, theme → Options themes, feature → catalog)
- [ ] Options panels already have ?options= routes — do not invent a second menu path
- [ ] ADA: reuse .theme-quest-view-unlock; log a step if you add a new named role
```

## Prize kinds

| Kind | Grant | View unlocked content |
|---|---|---|
| `sound` / `baseClick` | `baseClickIds` | `?options=sounds&optionsSound=base-clicks` |
| `sound` / `contentWindow` | `contentWindowSoundIds` | `?options=sounds&optionsSound=content-windows` |
| `theme` | `themeIds` | `?options=themes` |
| `feature` | `featureIds` | Catalog `target` (usually `?modal=fun:random&item=…`) |
| `card` | trading card | Download only |

## New gated clip (example)

Timekeeper already grants `random-mountain-bike-crash` → Random `random-video-3`.

To gate another Random item on a quest:

1. Add `{ kind: "feature", featureId: "your-feature-id" }` to that milestone’s `prizes`.
2. Register it in `UNLOCK_FEATURE_CATALOG` with `target: { kind: "modal", namespace: "fun", key: "random", item: "<id>" }` and `gatedMediaIds`.
3. Set `gatedByFeature: "your-feature-id"` on the media item. Remove bare `locked: true`.

## Options routes (already exist)

`themes` · `versions` · `sounds` · `sounds` + `base-clicks` · `sounds` + `content-windows` · `my-events`

Event log is `?modal=demos:my-events`. Board is `?modal=easter-eggs:board`. From `/intro`, view-content navigates to `/portfolio-launched/` with the same query.

## Do not

- Hard-code Timekeeper / Opening Act / quest ids in UI
- Unlock media with a local `useState` or theme id check
- Add a real path like `/unlock/bike` — query params only
- Skip the catalog if the board needs a View button

See [reference.md](reference.md) for file map.
