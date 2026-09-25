import type { Metadata } from "next";
import { IntroGameModal } from "@/components/intro/IntroGameModal";
import { person } from "@/data/content";

export const metadata: Metadata = {
  title: `Intro · ${person.name}`,
  description: "Player setup — pick a character, browse sound kits, and peek at side quests.",
};

/**
 * Theme-aware video-game-style intro. Uses a dedicated IntroGameModal shell
 * (not MediaModal / InteractiveModal): card on desktop, full viewport on mobile.
 */
export default function IntroPage() {
  return <IntroGameModal />;
}
