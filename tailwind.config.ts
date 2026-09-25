import type { Config } from "tailwindcss";

/** RGB-channel CSS vars so /opacity utilities match stock Tailwind behavior. */
const accentScale = {
  50: "rgb(var(--accent-50) / <alpha-value>)",
  100: "rgb(var(--accent-100) / <alpha-value>)",
  200: "rgb(var(--accent-200) / <alpha-value>)",
  300: "rgb(var(--accent-300) / <alpha-value>)",
  400: "rgb(var(--accent-400) / <alpha-value>)",
  500: "rgb(var(--accent-500) / <alpha-value>)",
  600: "rgb(var(--accent-600) / <alpha-value>)",
  700: "rgb(var(--accent-700) / <alpha-value>)",
  800: "rgb(var(--accent-800) / <alpha-value>)",
  900: "rgb(var(--accent-900) / <alpha-value>)",
  950: "rgb(var(--accent-950) / <alpha-value>)",
} as const;

const surfaceScale = {
  50: "rgb(var(--surface-50) / <alpha-value>)",
  100: "rgb(var(--surface-100) / <alpha-value>)",
  200: "rgb(var(--surface-200) / <alpha-value>)",
  300: "rgb(var(--surface-300) / <alpha-value>)",
  400: "rgb(var(--surface-400) / <alpha-value>)",
  500: "rgb(var(--surface-500) / <alpha-value>)",
  600: "rgb(var(--surface-600) / <alpha-value>)",
  700: "rgb(var(--surface-700) / <alpha-value>)",
  800: "rgb(var(--surface-800) / <alpha-value>)",
  900: "rgb(var(--surface-900) / <alpha-value>)",
  950: "rgb(var(--surface-950) / <alpha-value>)",
} as const;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/interactive-demos/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/component-library/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/theme/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontSize: {
        lg: ["1.125rem", { lineHeight: "1.5" }],
        xl: ["1.25rem", { lineHeight: "1.45" }],
        "2xl": ["1.5rem", { lineHeight: "1.4" }],
        "3xl": ["1.875rem", { lineHeight: "1.4" }],
        "4xl": ["2.25rem", { lineHeight: "1.38" }],
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      /** Theme-managed radii — cyberpunk defaults match stock Tailwind 2xl/3xl. */
      borderRadius: {
        "2xl": "var(--radius-media)",
        "3xl": "var(--radius-card)",
        xl: "var(--radius-control)",
      },
      keyframes: {
        careerSlideInFromRight: {
          "0%": { transform: "translateX(1rem)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        careerSlideInFromLeft: {
          "0%": { transform: "translateX(-1rem)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        careerTimerShrink: {
          "0%": { transform: "scaleX(1)" },
          "100%": { transform: "scaleX(0)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-2deg)" },
          "75%": { transform: "rotate(2deg)" },
        },
      },
      animation: {
        careerSlideInFromRight: "careerSlideInFromRight 0.28s ease-out both",
        careerSlideInFromLeft: "careerSlideInFromLeft 0.28s ease-out both",
        careerTimerShrink: "careerTimerShrink 8s linear forwards",
        wiggle: "wiggle 0.4s ease-in-out",
      },
      transitionTimingFunction: {
        card: "cubic-bezier(0.4, 0, 0.2, 1)",
        "card-reveal": "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        "card-zoom": "400ms",
        "card-reveal": "360ms",
      },
      transitionDelay: {
        "card-reveal": "360ms",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: accentScale,
        surface: surfaceScale,
      },
    },
  },
  plugins: [],
};
export default config;
