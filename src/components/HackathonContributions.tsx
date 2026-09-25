import { hackathonContributionsSection } from "@/data/content";
import { ProjectContributionsSection } from "@/components/ProjectContributionsSection";

export function HackathonContributions() {
  return <ProjectContributionsSection {...hackathonContributionsSection} />;
}
