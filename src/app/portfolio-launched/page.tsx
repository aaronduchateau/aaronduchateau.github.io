import { Education } from "@/components/Education";
import { Employment } from "@/components/Employment";
import { HackathonContributions } from "@/components/HackathonContributions";
import { Hero } from "@/components/Hero";
import { HeroLearnMoreModalHost } from "@/components/HeroLearnMoreModalHost";
import { InteractiveDemoCardSection } from "@/components/InteractiveDemoCardSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { Testimonials } from "@/components/Testimonials";
import { ThemeGatedSections } from "@/components/ThemeGatedSections";
import { WorkHistory } from "@/components/WorkHistory";
import { YouTubeCardSection } from "@/components/YouTubeCardSection";
import { FrescoQuoteSection } from "@/components/FrescoQuoteSection";
import { interactiveDemosSection, videoShowcaseSection } from "@/data/content";
import { APP_CONTENT_ID } from "@/hooks/useModalAccessibility";

/** Main portfolio surface — entered after intro/splash (or by direct URL). */
export default function PortfolioLaunchedPage() {
  return (
    <div id={APP_CONTENT_ID} className="min-h-screen bg-surface-950 text-surface-200">
      <SiteNav />
      <main id="main-content">
        <Hero />
        <HeroLearnMoreModalHost />
        <InteractiveDemoCardSection {...interactiveDemosSection} />
        <YouTubeCardSection {...videoShowcaseSection} />
        <Testimonials />
        <WorkHistory />
        <Education />
        <Employment />
        <HackathonContributions />
        <ThemeGatedSections />
        <FrescoQuoteSection />
      </main>
      <SiteFooter />
    </div>
  );
}
