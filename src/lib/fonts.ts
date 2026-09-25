import {
  Archivo_Black,
  Caveat,
  Cinzel,
  Cormorant_Garamond,
  DM_Sans,
  Fredoka,
  Great_Vibes,
  IM_Fell_English,
  Libre_Baskerville,
  Luckiest_Guy,
  Orbitron,
  Oswald,
  Outfit,
  Pacifico,
  Permanent_Marker,
  Special_Elite,
  VT323,
} from "next/font/google";

/** Display/heading font (replaced Syne — its metrics clipped g/y/p descenders). */
export const fontDisplay = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

/** Relic Guy — adventure serif display. */
export const fontAdventure = Libre_Baskerville({
  subsets: ["latin"],
  variable: "--font-adventure",
  display: "swap",
  weight: ["400", "700"],
});

/**
 * Cursive Roman Empire — elegant script for h1/h2 display moments.
 * Caveat remains available as --font-hand for softer handwritten accents.
 */
export const fontCursive = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-cursive",
  display: "swap",
  weight: "400",
});

/** Optional handwritten accent (not the primary Roman display face). */
export const fontHand = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
  display: "swap",
  weight: ["500", "600", "700"],
});

export const fontRoman = Cinzel({
  subsets: ["latin"],
  variable: "--font-roman",
  display: "swap",
  weight: ["400", "600", "700"],
});

/** Psychedelic Hippie — groovy display script. */
export const fontHippie = Pacifico({
  subsets: ["latin"],
  variable: "--font-hippie",
  display: "swap",
  weight: "400",
});

/** Conspiracy Theorist — typewriter / classified-document display. */
export const fontConspiracy = Special_Elite({
  subsets: ["latin"],
  variable: "--font-conspiracy",
  display: "swap",
  weight: "400",
});

/** Galaxy Guy — wide HUD / starship display. */
export const fontGalaxy = Orbitron({
  subsets: ["latin"],
  variable: "--font-galaxy",
  display: "swap",
  weight: ["500", "600", "700"],
});

/** Atlantic Guy — classical sea-king display. */
export const fontAtlantean = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-atlantean",
  display: "swap",
  weight: ["500", "600", "700"],
});

/** Captain Guy — stark condensed title-card / helm HUD display. */
export const fontCaptainGuy = Oswald({
  subsets: ["latin"],
  variable: "--font-captain-guy",
  display: "swap",
  weight: ["500", "600", "700"],
});

/** Nerd — CRT terminal / phosphor readout display. */
export const fontNerd = VT323({
  subsets: ["latin"],
  variable: "--font-nerd",
  display: "swap",
  weight: "400",
});

/** Pop Art Guy — blocky screen-print display. */
export const fontPopArt = Archivo_Black({
  subsets: ["latin"],
  variable: "--font-pop-art",
  display: "swap",
  weight: "400",
});

/** Pop Art Guy — brush-marker signature accent. */
export const fontPopArtScript = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-pop-art-script",
  display: "swap",
  weight: "400",
});

/** Dream Guy — distressed hand-inked parlor display. */
export const fontSurrealist = IM_Fell_English({
  subsets: ["latin"],
  variable: "--font-surrealist",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

/** Dog Days Guy — soft rounded display type. */
export const fontDogDaysGuy = Fredoka({
  subsets: ["latin"],
  variable: "--font-dog-days-guy",
  display: "swap",
  weight: ["500", "600", "700"],
});

/** Retro Guy — chunky arcade display type. */
export const fontRetroGuy = Luckiest_Guy({
  subsets: ["latin"],
  variable: "--font-retro-guy",
  display: "swap",
  weight: "400",
});
