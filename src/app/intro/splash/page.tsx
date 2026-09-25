import type { Metadata } from "next";
import { IntroGameModal } from "@/components/intro/IntroGameModal";
import { IntroSplashModal } from "@/components/intro/IntroSplashModal";
import { person } from "@/data/content";

export const metadata: Metadata = {
  title: `Welcome · ${person.name}`,
  description: "Quick start choice before portfolio loadout.",
};

/**
 * Splash layered on the intro game shell — `/intro` remains underneath;
 * Continue navigates to `/intro/` or `/portfolio-launched/` by experience.
 */
export default function IntroSplashPage() {
  return (
    <>
      <IntroGameModal backgroundOnly />
      <IntroSplashModal />
    </>
  );
}
