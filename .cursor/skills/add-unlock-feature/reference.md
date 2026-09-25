# Unlock feature file map

| File | Role |
|---|---|
| `src/activity/milestones.ts` | Quest copy, prizes, `allMilestoneRules` |
| `src/activity/milestonePrizes.ts` | `resolveGrantedPrizes`, `isFeatureUnlocked` |
| `src/activity/unlockFeatures.ts` | Feature ids, catalog, `viewTargetForPrize` |
| `src/activity/unlockRoutes.ts` | `navigateToUnlockedContent` |
| `src/lib/optionsRoute.ts` | `?options=` / `?optionsSound=` parse + write |
| `src/lib/useRouteModal.ts` | `?modal=` `?path=` `?item=` |
| `src/types/media-modal.ts` | `gatedByFeature` |
| `src/components/MediaModal.tsx` | `applyFeatureGates` |
| `src/components/OptionsMenu.tsx` | Opens from options query |
| `src/components/EasterEggBoardPanel.tsx` | View unlocked content |

Fun things namespace is `fun` (GalleryStrip). Random card key is `random`.
