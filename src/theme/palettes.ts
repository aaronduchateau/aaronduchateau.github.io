import { flatSwatchScale, scaleFromSwatchFamily } from "./swatches";
import type { ThemeId, ThemeTokens } from "./types";

/**
 * Cyberpunk chrome — locked to the live pre-theme Hero / card recipes:
 * - scrim from-slate-950/70 via /85 to solid
 * - radial rgba(56,189,248,0.15) ≈ sky-400 (kept as intentional wash)
 * - quote glass bg-slate-950/80 + backdrop-blur-md
 * - aura cyan-400/40 → fuchsia-500/20, opacity 70%
 * - pills + rounded-3xl cards
 */
const CYBERPUNK: ThemeTokens = {
  id: "cyberpunk",
  background: "#020617",
  foreground: "#e2e8f0",
  heading: "#ffffff",
  rootFontSize: "100%",
  navBrandFontSize: "1.75rem",
  navBlur: "12px",
  heroImage: "/photos/Aaron_DuChateau_aaron.png",

  radiusPill: "9999px",
  radiusCard: "1.5rem",
  radiusMedia: "1rem",
  radiusControl: "0.75rem",
  radiusPlay: "9999px",

  heroScrimFrom: "0.7",
  heroScrimVia: "0.85",
  heroScrimTo: "1",
  /** Original hero wash used sky-400: rgba(56,189,248,0.15). */
  heroAccent: "56 189 248",
  heroAccentAlpha: "0.15",

  glassAlpha: "0.8",
  glassBlur: "12px",
  decorativeOpacity: "0.7",
  auraFrom: "34 211 238",
  auraFromAlpha: "0.4",
  auraVia: "217 70 239",
  auraViaAlpha: "0.2",

  borderAlpha: "0.1",
  cardSurfaceAlpha: "0.4",
  cardHoverBorderAlpha: "0.35",
  cardHoverRingAlpha: "0.2",

  // Slot name ≠ hue. Cyber’s surface *is* Tailwind slate; its accent *is* cyan.
  surface: scaleFromSwatchFamily("slate"),
  accent: scaleFromSwatchFamily("cyan"),
};

const RELIC_GUY: ThemeTokens = {
  id: "relic-guy",
  background: "#1a1208",
  foreground: "#f0e6d3",
  heading: "#fff8ec",
  rootFontSize: "100%",
  navBrandFontSize: "1.65rem",
  navBlur: "8px",
  heroImage: "/photos/Aaron_DuChateau_hero-relic-guy.png",

  /** Squared-off adventure UI — not pills. */
  radiusPill: "0.375rem",
  radiusCard: "0.75rem",
  radiusMedia: "0.5rem",
  radiusControl: "0.375rem",
  radiusPlay: "0.4rem",

  /** Slightly clearer photo through a warmer, lighter veil. */
  heroScrimFrom: "0.55",
  heroScrimVia: "0.72",
  heroScrimTo: "0.96",
  heroAccent: "232 185 35",
  heroAccentAlpha: "0.12",

  glassAlpha: "0.72",
  glassBlur: "10px",
  decorativeOpacity: "0.55",
  auraFrom: "232 185 35",
  auraFromAlpha: "0.35",
  auraVia: "180 83 9",
  auraViaAlpha: "0.18",

  borderAlpha: "0.14",
  cardSurfaceAlpha: "0.45",
  cardHoverBorderAlpha: "0.4",
  cardHoverRingAlpha: "0.22",

  surface: {
    "50": "250 246 239",
    "100": "243 234 217",
    "200": "228 210 176",
    "300": "203 178 136",
    "400": "168 144 104",
    "500": "138 115 79",
    "600": "107 86 60",
    "700": "79 62 44",
    "800": "53 40 24",
    "900": "36 26 16",
    "950": "26 18 8",
  },
  accent: {
    "50": "255 251 235",
    "100": "254 243 199",
    "200": "253 230 138",
    "300": "252 211 77",
    "400": "232 185 35",
    "500": "212 160 23",
    "600": "180 83 9",
    "700": "146 64 14",
    "800": "120 53 15",
    "900": "69 26 3",
    "950": "42 16 2",
  },
};

/**
 * Psychedelic Hippie — violet night, hot pink / lime accents,
 * soft organic radii, dreamy glass, groovy Pacifico display.
 */
const PSYCHEDELIC_HIPPIE: ThemeTokens = {
  id: "psychedelic-hippie",
  background: "#1a0b2e",
  foreground: "#f5e6ff",
  heading: "#ffe56b",
  rootFontSize: "100%",
  navBrandFontSize: "1.55rem",
  // Pacifico: unused ascent in the em box — see ThemeTokens.navBrandNudgeY.
  navBrandNudgeY: "0.06em",
  navBlur: "14px",
  heroImage: "/photos/Aaron_DuChateau_hero-psychedelic-hippie.png",

  /** Soft, blob-like corners — organic / groovy. */
  radiusPill: "9999px",
  radiusCard: "2rem",
  radiusMedia: "1.5rem",
  radiusControl: "1.25rem",
  radiusPlay: "1.1rem",

  /** Dreamier veil — more of the photo bleeds through. */
  heroScrimFrom: "0.45",
  heroScrimVia: "0.65",
  heroScrimTo: "0.92",
  heroAccent: "236 72 153",
  heroAccentAlpha: "0.22",

  glassAlpha: "0.62",
  glassBlur: "16px",
  decorativeOpacity: "0.85",
  auraFrom: "236 72 153",
  auraFromAlpha: "0.45",
  auraVia: "163 230 53",
  auraViaAlpha: "0.28",

  borderAlpha: "0.18",
  cardSurfaceAlpha: "0.38",
  cardHoverBorderAlpha: "0.5",
  cardHoverRingAlpha: "0.28",

  surface: {
    "50": "250 245 255",
    "100": "243 232 255",
    "200": "233 213 255",
    "300": "216 180 254",
    "400": "192 132 252",
    "500": "168 85 247",
    "600": "126 58 195",
    "700": "91 33 147",
    "800": "59 20 100",
    "900": "36 12 64",
    "950": "26 11 46",
  },
  /** Accents ride magenta → lime (reads as “cyan” utilities site-wide). */
  accent: {
    "50": "253 242 248",
    "100": "252 231 243",
    "200": "251 207 232",
    "300": "249 168 212",
    "400": "244 114 182",
    "500": "236 72 153",
    "600": "190 24 120",
    "700": "157 23 100",
    "800": "131 24 85",
    "900": "80 20 55",
    "950": "50 10 35",
  },
};

const CURSIVE_ROMAN: ThemeTokens = {
  id: "cursive-roman-empire",
  background: "#141018",
  foreground: "#ebe4d6",
  heading: "#f7f1e4",
  rootFontSize: "100%",
  navBrandFontSize: "2.05rem",
  // Great Vibes: unused ascent in the em box — see ThemeTokens.navBrandNudgeY.
  navBrandNudgeY: "0.1em",
  navBlur: "8px",
  heroImage: "/photos/Aaron_DuChateau_hero-cursive-roman-empire.png",

  /** Classical — tighter corners, almost tablet-like. */
  radiusPill: "0.2rem",
  radiusCard: "0.35rem",
  radiusMedia: "0.25rem",
  radiusControl: "0.2rem",
  /** Square play control with a slight round — Roman tablet feel. */
  radiusPlay: "0.35rem",

  heroScrimFrom: "0.62",
  heroScrimVia: "0.8",
  heroScrimTo: "1",
  heroAccent: "201 162 39",
  heroAccentAlpha: "0.1",

  glassAlpha: "0.78",
  glassBlur: "8px",
  decorativeOpacity: "0.45",
  auraFrom: "201 162 39",
  auraFromAlpha: "0.3",
  auraVia: "122 82 12",
  auraViaAlpha: "0.16",

  borderAlpha: "0.12",
  cardSurfaceAlpha: "0.42",
  cardHoverBorderAlpha: "0.38",
  cardHoverRingAlpha: "0.18",

  surface: {
    "50": "248 244 236",
    "100": "239 232 216",
    "200": "221 208 184",
    "300": "196 179 150",
    "400": "160 144 120",
    "500": "133 117 96",
    "600": "106 92 76",
    "700": "80 68 56",
    "800": "56 46 40",
    "900": "36 28 30",
    "950": "20 16 24",
  },
  accent: {
    "50": "253 244 240",
    "100": "248 228 216",
    "200": "236 196 168",
    "300": "212 160 110",
    "400": "201 162 39",
    "500": "184 134 11",
    "600": "154 107 10",
    "700": "122 82 12",
    "800": "92 61 16",
    "900": "61 40 12",
    "950": "36 22 8",
  },
};

/**
 * Software Only (id: professional) — stage keynote look from the hero plate:
 * warm charcoal field, paper-white type, speaker-ribbon cobalt as the accent.
 * Professional but distinct from cold “corporate slate + steel.”
 */
const PROFESSIONAL: ThemeTokens = {
  id: "professional",
  background: "#141210",
  foreground: "#e6e2da",
  heading: "#f7f4ee",
  rootFontSize: "100%",
  navBrandFontSize: "1.75rem",
  navBlur: "10px",
  heroImage: "/photos/Aaron_DuChateau_hero-software-only.jpg",

  /** Quiet geometry — modern, never playful pills. */
  radiusPill: "0.375rem",
  radiusCard: "0.5rem",
  radiusMedia: "0.375rem",
  radiusControl: "0.375rem",
  radiusPlay: "0.375rem",

  /** Let the stage photo read; type stays legible over a warm veil. */
  heroScrimFrom: "0.55",
  heroScrimVia: "0.78",
  heroScrimTo: "0.96",
  /** Speaker-ribbon cobalt */
  heroAccent: "37 99 235",
  heroAccentAlpha: "0.12",

  glassAlpha: "0.86",
  glassBlur: "10px",
  decorativeOpacity: "0.35",
  auraFrom: "37 99 235",
  auraFromAlpha: "0.1",
  auraVia: "30 41 59",
  auraViaAlpha: "0.06",

  borderAlpha: "0.16",
  cardSurfaceAlpha: "0.58",
  cardHoverBorderAlpha: "0.32",
  cardHoverRingAlpha: "0.14",

  /** Warm neutrals (stage wood / charcoal), not icy gray. */
  surface: {
    "50": "250 248 244",
    "100": "242 238 230",
    "200": "226 220 208",
    "300": "196 188 172",
    "400": "156 148 132",
    "500": "120 112 98",
    "600": "90 84 74",
    "700": "62 56 50",
    "800": "40 36 32",
    "900": "26 22 20",
    "950": "16 14 12",
  },
  /** Accent scale keyed off the ribbon blue — crisp, not neon cyan. */
  accent: {
    "50": "239 246 255",
    "100": "219 234 254",
    "200": "191 219 254",
    "300": "147 197 253",
    "400": "96 165 250",
    "500": "37 99 235",
    "600": "29 78 216",
    "700": "30 64 175",
    "800": "30 58 138",
    "900": "23 37 84",
    "950": "15 23 42",
  },
};

/**
 * ADA First — maximal contrast, minimal chrome.
 * White page + black type. Slate scale is inverted vs dark themes so
 * existing bg-slate-950 / text-slate-400 utilities flip to light surfaces
 * and dark type. Hard-coded text-white / border-white are corrected in CSS.
 */
const ADA_FIRST: ThemeTokens = {
  id: "ada-first",
  background: "#ffffff",
  foreground: "#000000",
  heading: "#000000",
  rootFontSize: "100%",
  navBrandFontSize: "1.7rem",
  navBlur: "0px",
  heroImage: null,

  radiusPill: "0",
  radiusCard: "0",
  radiusMedia: "0",
  radiusControl: "0",
  radiusPlay: "0",

  /** Fully opaque white veil — photo is not the content. */
  heroScrimFrom: "1",
  heroScrimVia: "1",
  heroScrimTo: "1",
  heroAccent: "0 0 0",
  heroAccentAlpha: "0",

  glassAlpha: "1",
  glassBlur: "0px",
  decorativeOpacity: "0",
  auraFrom: "0 0 0",
  auraFromAlpha: "0",
  auraVia: "0 0 0",
  auraViaAlpha: "0",

  borderAlpha: "1",
  cardSurfaceAlpha: "1",
  cardHoverBorderAlpha: "1",
  cardHoverRingAlpha: "0",

  /** Inverted: high steps = white surfaces, low steps = black type. */
  surface: {
    "50": "0 0 0",
    "100": "17 17 17",
    "200": "28 28 28",
    "300": "38 38 38",
    "400": "45 45 45",
    "500": "70 70 70",
    "600": "160 160 160",
    "700": "220 220 220",
    "800": "240 240 240",
    "900": "250 250 250",
    "950": "255 255 255",
  },
  /** Accents → black (links/CTAs read as ink on paper). */
  accent: flatSwatchScale("black"),
  componentSlots: {
    hairline: { rgb: "0 0 0" },
    "ghost-fill": { rgb: "0 0 0" },
    "ghost-ink": { rgb: "0 0 0" },
    "success-fill": { rgb: "0 0 0" },
    "success-ink": { rgb: "0 0 0" },
  },
};

/**
 * Conspiracy Theorist — evidence-board noir (True Detective / X-Files energy):
 * corkboard browns, parchment type, red-string accents, CRT amber in the aura.
 */
const CONSPIRACY_THEORIST: ThemeTokens = {
  id: "conspiracy-theorist",
  background: "#120e0b",
  foreground: "#e8dcc8",
  heading: "#f3e6c8",
  rootFontSize: "100%",
  navBrandFontSize: "1.65rem",
  navBlur: "6px",
  heroImage: "/photos/Aaron_DuChateau_hero-conspiracy-theorist.jpg",

  /** Taped scraps / dymo labels — squared, never pills. */
  radiusPill: "0.2rem",
  radiusCard: "0.35rem",
  radiusMedia: "0.25rem",
  radiusControl: "0.2rem",
  radiusPlay: "0.25rem",

  /** Dim office lamp over a busy wall — photo readable, corners sink into shadow. */
  heroScrimFrom: "0.62",
  heroScrimVia: "0.82",
  heroScrimTo: "0.97",
  /** Warm desk-lamp wash */
  heroAccent: "212 160 72",
  heroAccentAlpha: "0.14",

  glassAlpha: "0.88",
  glassBlur: "8px",
  decorativeOpacity: "0.55",
  /** Red yarn + CRT amber */
  auraFrom: "196 48 42",
  auraFromAlpha: "0.22",
  auraVia: "212 160 72",
  auraViaAlpha: "0.1",

  borderAlpha: "0.22",
  cardSurfaceAlpha: "0.62",
  cardHoverBorderAlpha: "0.45",
  cardHoverRingAlpha: "0.18",

  /** Corkboard / coffee / night desk neutrals */
  surface: {
    "50": "244 236 220",
    "100": "232 220 196",
    "200": "210 192 160",
    "300": "176 156 124",
    "400": "140 122 96",
    "500": "108 94 74",
    "600": "82 70 56",
    "700": "58 48 40",
    "800": "38 30 26",
    "900": "24 18 16",
    "950": "14 10 8",
  },
  /** “Cyan” slot = red string / classified stamp accents */
  accent: {
    "50": "254 242 242",
    "100": "254 226 226",
    "200": "254 202 202",
    "300": "252 165 165",
    "400": "220 72 64",
    "500": "196 48 42",
    "600": "164 36 32",
    "700": "132 28 26",
    "800": "100 24 24",
    "900": "72 20 20",
    "950": "42 12 12",
  },
};

/**
 * Galaxy Guy — holographic bridge HUD (gesture glass + starship console):
 * deep space navy, electric cyan,
 * magenta nebula wash, capsule controls.
 */
const GALAXY_GUY: ThemeTokens = {
  id: "galaxy-guy",
  background: "#050510",
  foreground: "#d7eefc",
  heading: "#f0fbff",
  rootFontSize: "100%",
  navBrandFontSize: "1.5rem",
  navBlur: "14px",
  heroImage: "/photos/Aaron_DuChateau_hero-galaxy-guy.jpg",

  /** Capsule command chips + soft HUD panels. */
  radiusPill: "9999px",
  radiusCard: "0.85rem",
  radiusMedia: "0.75rem",
  radiusControl: "9999px",
  radiusPlay: "9999px",

  /** Keep the holo console readable; space fades at the edges. */
  heroScrimFrom: "0.45",
  heroScrimVia: "0.72",
  heroScrimTo: "0.96",
  heroAccent: "0 210 255",
  heroAccentAlpha: "0.18",

  glassAlpha: "0.72",
  glassBlur: "16px",
  decorativeOpacity: "0.85",
  auraFrom: "0 210 255",
  auraFromAlpha: "0.35",
  auraVia: "138 43 226",
  auraViaAlpha: "0.22",

  borderAlpha: "0.28",
  cardSurfaceAlpha: "0.45",
  cardHoverBorderAlpha: "0.55",
  cardHoverRingAlpha: "0.28",

  /** Deep space navy neutrals */
  surface: {
    "50": "236 248 255",
    "100": "214 238 252",
    "200": "170 214 240",
    "300": "120 178 214",
    "400": "88 140 178",
    "500": "64 108 148",
    "600": "44 78 118",
    "700": "30 54 90",
    "800": "18 34 64",
    "900": "10 18 40",
    "950": "5 5 16",
  },
  /** Electric holograph cyan */
  accent: {
    "50": "236 253 255",
    "100": "207 250 254",
    "200": "165 243 252",
    "300": "103 232 249",
    "400": "0 210 255",
    "500": "0 180 230",
    "600": "0 148 196",
    "700": "14 116 164",
    "800": "21 94 132",
    "900": "22 70 100",
    "950": "8 40 58",
  },
};

/**
 * Atlantic Guy — deep-sea command hologram:
 * abyssal navy, bioluminescent teal, trident bronze accents, waypoint pills.
 */
const ATLANTEAN: ThemeTokens = {
  id: "atlantean",
  background: "#050a0f",
  foreground: "#c8e8f0",
  heading: "#e8f8ff",
  rootFontSize: "100%",
  navBrandFontSize: "2rem",
  navBlur: "12px",
  heroImage: "/photos/Aaron_DuChateau_hero-atlantean.jpg",

  /** Waypoint pills + softly rounded status panels. */
  radiusPill: "9999px",
  radiusCard: "0.65rem",
  radiusMedia: "0.55rem",
  radiusControl: "9999px",
  radiusPlay: "9999px",

  /** Keep the course hologram lit; abyss closes the frame. */
  heroScrimFrom: "0.5",
  heroScrimVia: "0.78",
  heroScrimTo: "0.97",
  heroAccent: "0 229 255",
  heroAccentAlpha: "0.16",

  glassAlpha: "0.78",
  glassBlur: "14px",
  decorativeOpacity: "0.7",
  auraFrom: "0 229 255",
  auraFromAlpha: "0.28",
  auraVia: "197 160 89",
  auraViaAlpha: "0.14",

  borderAlpha: "0.26",
  cardSurfaceAlpha: "0.5",
  cardHoverBorderAlpha: "0.5",
  cardHoverRingAlpha: "0.22",

  /** Abyss / kelp / foam neutrals */
  surface: {
    "50": "236 248 252",
    "100": "210 236 244",
    "200": "168 214 228",
    "300": "120 184 204",
    "400": "88 148 168",
    "500": "64 116 136",
    "600": "44 86 104",
    "700": "30 60 76",
    "800": "18 40 54",
    "900": "10 24 34",
    "950": "5 10 15",
  },
  /** Bioluminescent teal / cyan */
  accent: {
    "50": "236 254 255",
    "100": "207 250 254",
    "200": "165 243 252",
    "300": "103 232 249",
    "400": "0 229 255",
    "500": "0 163 196",
    "600": "0 132 164",
    "700": "14 108 138",
    "800": "21 86 112",
    "900": "22 68 90",
    "950": "8 40 54",
  },
};

/**
 * Captain Guy — navigation hologram:
 * burnt umber stone, candlelit amber bloom, ivory light, soft ritual panels.
 */
const CAPTAIN_GUY: ThemeTokens = {
  id: "captain-guy",
  background: "#1a120b",
  foreground: "#e8dcc4",
  heading: "#ffe2a0",
  rootFontSize: "100%",
  navBrandFontSize: "1.7rem",
  navBlur: "11px",
  heroImage: "/photos/Aaron_DuChateau_hero-captain-guy.jpg",

  /** Soft ritual tablets — generous outer glass, tighter inner readouts. */
  radiusPill: "0.7rem",
  radiusCard: "1.4rem",
  radiusMedia: "0.85rem",
  radiusControl: "0.55rem",
  radiusPlay: "0.65rem",

  /** Keep the amber course lit; abyss + candle smoke close the frame. */
  heroScrimFrom: "0.42",
  heroScrimVia: "0.74",
  heroScrimTo: "0.96",
  heroAccent: "255 176 0",
  heroAccentAlpha: "0.2",

  glassAlpha: "0.76",
  glassBlur: "13px",
  decorativeOpacity: "0.75",
  auraFrom: "255 176 0",
  auraFromAlpha: "0.32",
  auraVia: "230 138 0",
  auraViaAlpha: "0.16",

  borderAlpha: "0.3",
  cardSurfaceAlpha: "0.52",
  cardHoverBorderAlpha: "0.55",
  cardHoverRingAlpha: "0.26",

  /** Burnt umber / sepia stone neutrals */
  surface: {
    "50": "245 240 228",
    "100": "232 220 196",
    "200": "210 190 158",
    "300": "176 152 118",
    "400": "140 116 86",
    "500": "108 88 64",
    "600": "78 62 44",
    "700": "54 42 30",
    "800": "36 28 20",
    "900": "26 18 12",
    "950": "16 12 8",
  },
  /** Candlelit amber / holy gold (maps to accent “cyan” channels) */
  accent: {
    "50": "255 248 230",
    "100": "255 236 190",
    "200": "255 214 130",
    "300": "255 192 64",
    "400": "255 176 0",
    "500": "230 138 0",
    "600": "196 110 0",
    "700": "158 86 8",
    "800": "120 64 12",
    "900": "86 46 14",
    "950": "48 26 8",
  },
};

/**
 * Nerd — basement sanctuary (CRT + star-map HUD): charcoal den, phosphor green
 * readouts, holo cyan glass, beige “keyboard key” controls.
 */
const NERD: ThemeTokens = {
  id: "nerd",
  background: "#0c0e12",
  foreground: "#b8f5c8",
  heading: "#00ff41",
  rootFontSize: "100%",
  navBrandFontSize: "2.05rem",
  navBlur: "10px",
  heroImage: "/photos/Aaron_DuChateau_hero-nerd.jpg",

  /** CRT bezels + chunky keycaps — soft monitors, squared keys. */
  radiusPill: "0.35rem",
  radiusCard: "0.7rem",
  radiusMedia: "0.55rem",
  radiusControl: "0.3rem",
  radiusPlay: "0.35rem",

  /** Keep the star-map hologram lit; den shadows close the frame. */
  heroScrimFrom: "0.48",
  heroScrimVia: "0.76",
  heroScrimTo: "0.97",
  heroAccent: "0 204 255",
  heroAccentAlpha: "0.18",

  glassAlpha: "0.74",
  glassBlur: "12px",
  decorativeOpacity: "0.8",
  auraFrom: "0 204 255",
  auraFromAlpha: "0.3",
  auraVia: "0 255 65",
  auraViaAlpha: "0.14",

  borderAlpha: "0.32",
  cardSurfaceAlpha: "0.48",
  cardHoverBorderAlpha: "0.58",
  cardHoverRingAlpha: "0.28",

  /** Basement charcoal / beige-hardware neutrals */
  surface: {
    "50": "236 240 244",
    "100": "214 222 232",
    "200": "176 190 208",
    "300": "130 148 170",
    "400": "96 114 138",
    "500": "72 88 110",
    "600": "52 64 84",
    "700": "36 46 62",
    "800": "24 30 42",
    "900": "14 18 26",
    "950": "8 10 14",
  },
  /** Holo cyan (interactive chrome); phosphor green lives in headings/CSS */
  accent: {
    "50": "230 252 255",
    "100": "190 246 255",
    "200": "140 236 255",
    "300": "80 222 255",
    "400": "0 204 255",
    "500": "0 170 220",
    "600": "0 140 188",
    "700": "12 112 154",
    "800": "18 88 122",
    "900": "20 68 96",
    "950": "8 40 58",
  },
};

/**
 * Pop Art Guy — Ben-Day lithograph: electric cyan field, hot
 * magenta + canary yellow punches, razor-flat cutouts (zero radius).
 */
const POP_ART_GUY: ThemeTokens = {
  id: "pop-art-guy",
  background: "#0e1f24",
  foreground: "#fff6ff",
  heading: "#ffed4a",
  rootFontSize: "100%",
  navBrandFontSize: "1.5rem",
  navBlur: "0px",
  heroImage: "/photos/Aaron_DuChateau_hero-pop-art-guy.jpg",

  /** Screen-print cutouts — sharp corners, poster rectangles. */
  radiusPill: "0px",
  radiusCard: "0px",
  radiusMedia: "0px",
  radiusControl: "0px",
  radiusPlay: "0px",

  /** Keep Marilyn / soup cans readable; ink-black closes the frame. */
  heroScrimFrom: "0.35",
  heroScrimVia: "0.7",
  heroScrimTo: "0.94",
  heroAccent: "255 43 214",
  heroAccentAlpha: "0.22",

  glassAlpha: "0.82",
  glassBlur: "0px",
  decorativeOpacity: "0.9",
  auraFrom: "255 43 214",
  auraFromAlpha: "0.35",
  auraVia: "0 200 214",
  auraViaAlpha: "0.22",

  borderAlpha: "0.95",
  cardSurfaceAlpha: "0.72",
  cardHoverBorderAlpha: "1",
  cardHoverRingAlpha: "0.15",

  /** Ink + cyan-field neutrals (poster blacks, teal screens) */
  surface: {
    "50": "255 248 255",
    "100": "255 230 250",
    "200": "230 250 255",
    "300": "160 220 230",
    "400": "90 160 175",
    "500": "50 110 125",
    "600": "30 75 90",
    "700": "20 50 60",
    "800": "14 36 44",
    "900": "10 24 30",
    "950": "6 14 18",
  },
  /** Hot magenta / print pink (accent “cyan” channels) */
  accent: {
    "50": "255 240 252",
    "100": "255 210 245",
    "200": "255 150 235",
    "300": "255 90 225",
    "400": "255 43 214",
    "500": "220 20 180",
    "600": "180 10 150",
    "700": "140 8 120",
    "800": "100 10 90",
    "900": "70 12 64",
    "950": "40 8 38",
  },
};

/**
 * Dream Guy — dream parlor: burgundy velvet, antique brass, desert ochre,
 * melting asymmetric radii (soft clocks / levitating glass).
 */
const SURREALIST: ThemeTokens = {
  id: "surrealist",
  background: "#1a1210",
  foreground: "#e8d8c4",
  heading: "#f0d9a0",
  rootFontSize: "100%",
  navBrandFontSize: "1.7rem",
  navBlur: "14px",
  heroImage: "/photos/Aaron_DuChateau_hero-surrealist.jpg",

  /** Melting soft-clock silhouettes — elliptical / dripping corners. */
  radiusPill: "2rem 1.15rem 2.55rem 0.85rem / 1.35rem 2.15rem 0.95rem 1.9rem",
  radiusCard: "1.9rem 2.7rem 3.1rem 1.15rem / 2.5rem 1.35rem 2.9rem 1.55rem",
  radiusMedia: "1.6rem 2.2rem 2.6rem 1rem / 2.1rem 1.2rem 2.4rem 1.4rem",
  radiusControl: "1.4rem 0.9rem 1.8rem 0.7rem / 1.1rem 1.6rem 0.8rem 1.5rem",
  radiusPlay: "58% 42% 62% 38% / 48% 58% 42% 52%",
  /** Hover sag — same motion as former `--surreal-*-melt-deep` CSS vars. */
  radiusPillHover: "1.6rem 1.4rem 3.4rem 0.55rem / 1.8rem 2.6rem 0.7rem 2.5rem",
  radiusCardHover: "2.2rem 2.4rem 3.8rem 0.9rem / 2.8rem 1.6rem 3.4rem 1.3rem",
  radiusMediaHover: "1.9rem 2.0rem 3.2rem 0.75rem / 2.4rem 1.4rem 2.9rem 1.15rem",
  radiusControlHover: "1.6rem 1.4rem 3.4rem 0.55rem / 1.8rem 2.6rem 0.7rem 2.5rem",
  radiusPlayHover: "48% 52% 70% 30% / 55% 45% 60% 40%",

  /** Keep the brass lamp + desert canvases lit; parlor dark closes the frame. */
  heroScrimFrom: "0.4",
  heroScrimVia: "0.72",
  heroScrimTo: "0.96",
  heroAccent: "196 150 72",
  heroAccentAlpha: "0.2",

  glassAlpha: "0.7",
  glassBlur: "16px",
  decorativeOpacity: "0.85",
  auraFrom: "196 150 72",
  auraFromAlpha: "0.28",
  auraVia: "110 28 48",
  auraViaAlpha: "0.22",

  borderAlpha: "0.35",
  cardSurfaceAlpha: "0.55",
  cardHoverBorderAlpha: "0.55",
  cardHoverRingAlpha: "0.2",

  /** Ochre / dusty parlor neutrals */
  surface: {
    "50": "245 236 220",
    "100": "232 216 190",
    "200": "210 186 150",
    "300": "176 148 112",
    "400": "140 112 80",
    "500": "108 84 58",
    "600": "78 58 40",
    "700": "54 40 28",
    "800": "36 26 20",
    "900": "26 18 16",
    "950": "16 12 10",
  },
  /** Antique brass / gold (accent “cyan” channels); burgundy in CSS */
  accent: {
    "50": "250 242 220",
    "100": "242 224 180",
    "200": "228 198 130",
    "300": "212 174 90",
    "400": "196 150 72",
    "500": "168 120 48",
    "600": "140 96 36",
    "700": "112 74 28",
    "800": "86 56 22",
    "900": "64 42 18",
    "950": "36 24 12",
  },
};

/**
 * Dog Days Guy — animation bay: warm wood, denim blue, soft toy
 * radii, sunny orange accents with viewport cyan highlights.
 */
const DOG_DAYS_GUY: ThemeTokens = {
  id: "dog-days-guy",
  background: "#1c1410",
  foreground: "#f3e6d4",
  heading: "#ffe08a",
  rootFontSize: "100%",
  navBrandFontSize: "1.7rem",
  navBlur: "12px",
  heroImage: "/photos/Aaron_DuChateau_hero-dog-days-guy.jpg",

  /** Soft toy bulbs — generous rounds, never sharp. */
  radiusPill: "9999px",
  radiusCard: "1.75rem",
  radiusMedia: "1.35rem",
  radiusControl: "9999px",
  radiusPlay: "9999px",

  /** Keep the golden-hour desk lit; studio dark closes the frame. */
  heroScrimFrom: "0.38",
  heroScrimVia: "0.7",
  heroScrimTo: "0.95",
  heroAccent: "255 140 48",
  heroAccentAlpha: "0.22",

  glassAlpha: "0.72",
  glassBlur: "14px",
  decorativeOpacity: "0.85",
  auraFrom: "255 140 48",
  auraFromAlpha: "0.3",
  auraVia: "64 148 220",
  auraViaAlpha: "0.18",

  borderAlpha: "0.28",
  cardSurfaceAlpha: "0.5",
  cardHoverBorderAlpha: "0.5",
  cardHoverRingAlpha: "0.24",

  /** Warm wood / denim-night neutrals */
  surface: {
    "50": "250 244 234",
    "100": "240 226 206",
    "200": "220 196 168",
    "300": "188 158 122",
    "400": "150 118 86",
    "500": "116 88 62",
    "600": "86 64 44",
    "700": "60 44 30",
    "800": "40 30 22",
    "900": "28 20 16",
    "950": "16 12 10",
  },
  /** Sunny orange / Andy-buzz accent (maps to “cyan” channels) */
  accent: {
    "50": "255 246 230",
    "100": "255 228 186",
    "200": "255 198 120",
    "300": "255 168 72",
    "400": "255 140 48",
    "500": "230 110 28",
    "600": "196 88 20",
    "700": "158 68 16",
    "800": "120 52 14",
    "900": "86 38 12",
    "950": "48 22 8",
  },
};

/**
 * Retro Guy — retro arcade beach bay: pipe green,
 * coin gold, arcade-red punches, chunky cylindrical radii.
 */
const RETRO_GUY: ThemeTokens = {
  id: "retro-guy",
  background: "#1a0f18",
  foreground: "#fff4e0",
  heading: "#ffd700",
  rootFontSize: "100%",
  navBrandFontSize: "1.45rem",
  // Luckiest Guy: glyphs sit high in a tall em box — see ThemeTokens.navBrandNudgeY.
  navBrandNudgeY: "0.22em",
  navBlur: "10px",
  heroImage: "/photos/Aaron_DuChateau_hero-retro-guy.jpg",

  /** Pipe cylinders + chunky block buttons — very round. */
  radiusPill: "9999px",
  radiusCard: "1.85rem",
  radiusMedia: "1.5rem",
  radiusControl: "9999px",
  radiusPlay: "9999px",

  /** Keep the sunset desk lit; dusk closes the frame. */
  heroScrimFrom: "0.36",
  heroScrimVia: "0.68",
  heroScrimTo: "0.95",
  heroAccent: "255 215 0",
  heroAccentAlpha: "0.22",

  glassAlpha: "0.7",
  glassBlur: "12px",
  decorativeOpacity: "0.9",
  auraFrom: "255 215 0",
  auraFromAlpha: "0.32",
  auraVia: "60 184 37",
  auraViaAlpha: "0.2",

  borderAlpha: "0.35",
  cardSurfaceAlpha: "0.52",
  cardHoverBorderAlpha: "0.55",
  cardHoverRingAlpha: "0.28",

  /** Sunset dusk / overalls-night neutrals */
  surface: {
    "50": "255 248 236",
    "100": "255 230 200",
    "200": "255 200 160",
    "300": "220 150 120",
    "400": "170 100 110",
    "500": "120 70 100",
    "600": "80 45 75",
    "700": "54 30 55",
    "800": "36 20 40",
    "900": "26 15 28",
    "950": "14 8 16",
  },
  /** Coin gold (accent “cyan” channels); pipe green + arcade red in CSS */
  accent: {
    "50": "255 252 230",
    "100": "255 244 180",
    "200": "255 230 100",
    "300": "255 220 40",
    "400": "255 215 0",
    "500": "230 180 0",
    "600": "196 140 0",
    "700": "158 110 8",
    "800": "120 84 12",
    "900": "86 60 14",
    "950": "48 34 8",
  },
};

/**
 * Driver Guy — night-drive cinema: asphalt black, hot-pink neon,
 * cyan city-light aura, sleek chrome radii, Mr Dafoe titles.
 */
const DRIVER_GUY: ThemeTokens = {
  id: "driver-guy",
  background: "#07040c",
  foreground: "#f3e8f0",
  heading: "#ff4d9a",
  rootFontSize: "100%",
  navBrandFontSize: "1.95rem",
  // Mr Dafoe: unused ascent in the em box — see ThemeTokens.navBrandNudgeY.
  navBrandNudgeY: "0.08em",
  navBlur: "14px",
  heroImage: "/photos/Aaron_DuChateau_hero-driver-guy.png",

  /** Motel-sign pills + tight chrome panels. */
  radiusPill: "9999px",
  radiusCard: "0.5rem",
  radiusMedia: "0.35rem",
  radiusControl: "0.3rem",
  radiusPlay: "9999px",

  /** Keep the night overlook readable; pink wash at the edges. */
  heroScrimFrom: "0.38",
  heroScrimVia: "0.7",
  heroScrimTo: "0.96",
  heroAccent: "255 45 149",
  heroAccentAlpha: "0.16",

  glassAlpha: "0.78",
  glassBlur: "14px",
  decorativeOpacity: "0.82",
  auraFrom: "255 45 149",
  auraFromAlpha: "0.38",
  auraVia: "0 229 255",
  auraViaAlpha: "0.2",

  borderAlpha: "0.28",
  cardSurfaceAlpha: "0.48",
  cardHoverBorderAlpha: "0.5",
  cardHoverRingAlpha: "0.28",

  /** Asphalt / midnight navy neutrals */
  surface: {
    "50": "244 240 246",
    "100": "220 214 228",
    "200": "176 168 188",
    "300": "128 120 142",
    "400": "88 80 104",
    "500": "64 56 78",
    "600": "46 40 58",
    "700": "32 26 42",
    "800": "20 16 28",
    "900": "12 8 18",
    "950": "7 4 12",
  },
  /** Hot neon pink (accent “cyan” channels); cyan city lights in CSS */
  accent: {
    "50": "255 241 248",
    "100": "255 214 232",
    "200": "255 176 210",
    "300": "255 120 180",
    "400": "255 45 149",
    "500": "232 20 120",
    "600": "196 12 96",
    "700": "158 10 78",
    "800": "112 8 56",
    "900": "72 6 38",
    "950": "40 4 22",
  },
};

export const THEME_PALETTES: Record<ThemeId, ThemeTokens> = {
  cyberpunk: CYBERPUNK,
  "relic-guy": RELIC_GUY,
  "psychedelic-hippie": PSYCHEDELIC_HIPPIE,
  "cursive-roman-empire": CURSIVE_ROMAN,
  "ada-first": ADA_FIRST,
  professional: PROFESSIONAL,
  "conspiracy-theorist": CONSPIRACY_THEORIST,
  "galaxy-guy": GALAXY_GUY,
  atlantean: ATLANTEAN,
  "captain-guy": CAPTAIN_GUY,
  nerd: NERD,
  "pop-art-guy": POP_ART_GUY,
  surrealist: SURREALIST,
  "dog-days-guy": DOG_DAYS_GUY,
  "retro-guy": RETRO_GUY,
  "driver-guy": DRIVER_GUY,
};
