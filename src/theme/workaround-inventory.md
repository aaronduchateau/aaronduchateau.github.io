# Theme workaround inventory

Living list of `[data-theme]` / hard-coded paint paths. **Do not delete a row until a slot or role absorbs it and that theme’s four roles still look distinct.**

Classification:

- **Font / type** — next/font rebinding. Keep as `[data-theme]`.
- **Texture / effect** — halftone, bevel, melt, filters. Keep as role CSS until non-color tokens exist.
- **Role skin** — per-theme `theme-primary-cta` / `theme-card` / `theme-btn-shape` color. Absorb into slots later.
- **ADA hammer** — attribute selectors that force black/white. Stay until `text-white` / `border-white` are gone.
- **Intro clamp** — loadout title size. Type CSS, not a color slot.

## Cross-cutting

- Intro loadout titles (`html[data-theme] .intro-loadout-title`, plus Galaxy / Pop Art / Roman / Conspiracy clamps) — **intro clamp**
- Intro section labels — **font / type**
- Hero video widget per-theme chrome — **role skin** (widget), do not fold into CTA slots
- ADA `.text-white`, `[class*="border-white"]`, `[class*="bg-white/"]`, gradient wipes — **ADA hammer**
- ADA play button / triangle `!important` — **role skin** + hammer

## Per theme (color skins in globals.css)

Each of these has `[data-theme] .theme-primary-cta` and/or blanket `.theme-btn-shape` / `.theme-card` / `.theme-nav` / `.modal-launch` skins. Absorb into `primaryCta.*` / card / nav slots only after visual QA.

- `relic-guy` — Relic: gold accents, squared chrome — **role skin** + **font**
- `psychedelic-hippie` — organic radii, magenta/lime — **role skin** + **font**
- `cursive-roman-empire` — tablet corners, imperial gold — **role skin** + **font**
- `ada-first` — paper/ink, zero radius — **ADA hammer** + **font**
- `professional` — quieter geometry (mostly tokens) — light **role skin**
- `conspiracy-theorist` — corkboard, typewriter heads — **role skin** + **font** + **texture**
- `galaxy-guy` — holo HUD CTA — **role skin** + **font**
- `atlantean` — bioluminescent CTA — **role skin** + **font**
- `captain-guy` — amber/stone CTA — **role skin** + **font**
- `nerd` — CRT phosphor CTA — **role skin** + **font**
- `pop-art-guy` — halftone fill — **texture** + **role skin** + **font**
- `surrealist` — velvet/brass CTA — **role skin** + **font**
- `dog-days-guy` — toy radii, denim CTA — **role skin** + **font**
- `retro-guy` — coin gold / pipe / bevel — **texture** + **role skin** + **font**

## Hard-coded classes (not theme CSS)

`text-white`, `bg-black/50`, leftover `border-white/10` in Hero, Options flyouts, and some modal innards. These do **not** follow `--accent-*`. Homepage strip chrome, ghost CTA, heading roles, hairlines on page sections / modal panels, and success badges now use slots (`hairline`, `ghost-*`, `success-*`, `--heading`). ADA Guy overrides those slots to black. Seek bars and contribution photo veils read `--accent-*` / `--surface-*` via roles. Leftover `text-accent-*` / `bg-surface-*` utilities are honest scale names. The `--cyan-*` / `--slate-*` shim is gone.

## Rules engine

[`src/theme/rules.ts`](rules.ts) only selects the pack (`apply-theme`) plus visibility and sounds. Do not add per-color events here.
