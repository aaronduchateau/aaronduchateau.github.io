# Theme system (json-rules-engine)

This portfolio uses [json-rules-engine](https://www.npmjs.com/package/json-rules-engine) as the **maintainer** of visual themes — similar in role to a Material theme provider, but selection is driven by declarative JSON rules instead of a hard-coded switch.

Themes are resolved and applied **only on the client**. Static export ships Cyberpunk defaults in CSS so the first paint matches the original site.

## Slots and swatches

- **Swatch** = a real Tailwind v3 color id (`amber-200`, `cyan-400`, `black`). `src/theme/swatches.ts` imports `tailwindcss/colors` and converts hex to RGB channels. `SWATCH_OVERRIDES` can replace a single id. The name is the hue.
- **Slot** = a semantic role (`accent.400`, `surface.950`, `demo-badge-title`). Packs use `accent` / `surface` fields. Values are `{ swatch }`, `{ ref }`, or `{ rgb }`.
- Apply paints `--accent-*`, `--surface-*`, `--slot-*`. Do not write `--cyan-*` / `--slate-*`.
- Do not put `text-amber-200` or `text-cyan-100` in components as the theme API. Prefer role classes (`theme-card-cta`, `theme-section-anchor`) that read `--slot-*`. Tailwind `/80` still applies alpha on honest `text-accent-*` leftovers.
- Slot values are RGB channels only. Alpha stays on the role (`rgb(var(--slot-card-meta) / 0.9)`) or a separate alpha token when it varies by theme.
- Per-theme CSS workarounds are inventoried in `src/theme/workaround-inventory.md`. Do not delete them until a slot absorbs the look.

## Adding or tuning a theme

1. Adjust the token pack in `src/theme/palettes.ts` (compare Cyberpunk numbers side-by-side — they are the reference). Prefer `{ swatch: "amber-400" }` when the mix is a real Tailwind step; use `{ rgb }` only for custom channels.
2. If needed, add a `[data-theme="…"]` font or ADA strip rule in `globals.css`.
3. Prefer `theme-*` primitives in components over hard-coded opacity stacks.
4. Rebuild and check Cyberpunk still matches the original hero glass before resting.

## Themes (intent)

| Id | Label | Shape | Type | Atmosphere |
| --- | --- | --- | --- | --- |
| `cyberpunk` | Cyber Blue | Full pills, `1.5rem` cards | Outfit + DM Sans | Glass scrim `/70`–`/85`, cyan→fuchsia aura — **locked to original** |
| `relic-guy` | Relic Guy | Squared buttons, tighter cards | Libre Baskerville display | Clearer photo veil, gold aura |
| `psychedelic-hippie` | Psychedelic Hippie | Extra-soft organic radii | Pacifico display | Violet night, magenta/lime aura, dreamy glass |
| `cursive-roman-empire` | Cursive Roman Empire | Near-rectilinear “tablet” corners | **Caveat**/Great Vibes large display + **Cinzel** body/UI | Marble / imperial gold |
| `ada-first` | ADA First | No radius | System UI | **White bg / black text**, max contrast, no chrome |
| `driver-guy` | Driver Guy | Motel-sign pills, tight chrome cards | **Mr Dafoe** script + **Rajdhani** HUD | Night asphalt, hot-pink titles, cyan city-light aura |

## What each theme owns

Not just colors. Token packs in `src/theme/palettes.ts` also set:

- **Radii** — `--radius-pill`, `--radius-card`, `--radius-media`, `--radius-control` (Tailwind `rounded-3xl` / `2xl` / `xl` map to these)
- **Hero glass** — scrim opacities, accent wash RGB + alpha (Cyber Blue keeps the original `rgba(56,189,248,0.15)` sky wash)
- **Hero photo** — `heroImage` on each palette (`null` for ADA First); `Hero` swaps the background when the theme changes
- **Quote panel** — glass fill alpha, blur, decorative aura colors/opacity
- **Cards** — surface alpha, border alpha, hover ring
- **Nav blur**, root font size, palette channels

Primitive classes in `src/app/globals.css`:

- `theme-hero-scrim` / `theme-hero-accent`
- `theme-glass` / `theme-quote-aura`
- `theme-card` / `theme-btn-shape`
- `theme-decorative` (hidden entirely in ADA)

## Entry point

`src/app/layout.tsx` → `ThemeProvider` → rules engine → `applyThemeTokens()` on `<html>` + `data-theme`.

Nav: **Options → Themes**.

## Fonts (careful rules)

- next/font CSS variables live on **`<html>`** (same node as `data-theme`).
- Cyberpunk leaves `--font-display` / `--font-sans` alone (Outfit / DM Sans).
- Relic Guy re-points display → adventure serif.
- Roman Empire: display → Caveat (large moments), sans → Cinzel (titles/UI/body).
- ADA: both slots → system-ui.
- Driver Guy: display → Mr Dafoe (Drive poster script), sans → Rajdhani (HUD / buttons).

Do **not** alias fonts through `:root` vars that resolve before next/font exists — that previously collapsed to Times New Roman.

## Accessibility (always on)

Modal layers use `useModalAccessibility` (not tied to the ADA theme):

- Scroll lock while open
- `#app-content` marked `inert` + `aria-hidden` so background controls are not tabbable
- Focus trap + Escape to close + focus restore
- Dialogs render via portal on `document.body` (outside `#app-content`)

Video/demo cards and recommendation CTAs carry descriptive `aria-label`s.
