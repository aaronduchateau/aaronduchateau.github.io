import type { Metadata } from "next";
import { IntroGameModal } from "@/components/intro/IntroGameModal";
import { IntroSplashModal } from "@/components/intro/IntroSplashModal";
import { person } from "@/data/content";

export const metadata: Metadata = {
  title: `Your Experience · ${person.name}`,
  description: "Choose an experience after starting over.",
};

/**
 * Your Experience, reached from Start over. Continue goes to loadout or the portfolio.
 */
export default function IntroSplashPage() {
  return (
    <>
      <IntroGameModal backgroundOnly />
      <IntroSplashModal />
    </>
  );
}
