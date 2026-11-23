"use client";

import { useRouter } from "next/navigation";
import { requestEasterEggBoard } from "@/activity/milestoneCelebration";
import { FeatureCallout } from "@/components/FeatureCallout";
import { PageSection, PaletteIcon, SectionHeading, SettingsGearIcon, TreasureChestIcon } from "@/components/ui";
import {
  THEME_PLAYGROUND_KEY,
  THEME_PLAYGROUND_NAMESPACE,
} from "@/lib/easterEggBoardRoute";
import { INTRO_PATH } from "@/lib/routes";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import { useTheme } from "@/theme/ThemeProvider";

/** Ways back into setup that already exists: loadout, theme, and the game. */
export function SiteOptionsSection() {
  const router = useRouter();
  const { playNavClick } = useTheme();

  return (
    <PageSection divider="top">
      <SectionHeading
        id="site-options"
        eyebrow="Site options"
        title="Site options"
        description="Pick a loadout, change the look of the site, or open the game."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <FeatureCallout
          title="Pick your loadout"
          description="Choose your Aaron, your sounds, and the preferences that follow you around the site."
          icon={SettingsGearIcon}
          onClick={() => {
            playNavClick();
            router.push(INTRO_PATH);
          }}
        />
        <FeatureCallout
          title="Pick your Theme"
          description="Swap the look of the whole site. These are the same themes as the ones in the header."
          icon={PaletteIcon}
          onClick={() => {
            playNavClick();
            navigateToRouteModal(THEME_PLAYGROUND_NAMESPACE, THEME_PLAYGROUND_KEY);
          }}
        />
        <FeatureCallout
          title="Play the game"
          description="Open the easter egg board and pick up the side quests."
          icon={TreasureChestIcon}
          onClick={() => {
            playNavClick();
            requestEasterEggBoard();
          }}
        />
      </div>
    </PageSection>
  );
}
