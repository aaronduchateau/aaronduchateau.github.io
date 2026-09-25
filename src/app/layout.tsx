import type { Metadata } from "next";
import "./globals.css";
import { person } from "@/data/content";
import {
  fontAdventure,
  fontAtlantean,
  fontConspiracy,
  fontCaptainGuy,
  fontCursive,
  fontDisplay,
  fontGalaxy,
  fontHand,
  fontHippie,
  fontNerd,
  fontRoman,
  fontSans,
  fontRetroGuy,
  fontSurrealist,
  fontDogDaysGuy,
  fontPopArt,
  fontPopArtScript,
} from "@/lib/fonts";
import { ActivityProvider } from "@/activity/ActivityProvider";
import { AdaGuyExplainerHost } from "@/components/AdaGuyExplainerHost";
import { ThemeProvider } from "@/theme/ThemeProvider";

export const metadata: Metadata = {
  title: `${person.name} · Full Stack Developer`,
  description: person.tagline,
  openGraph: {
    title: `${person.name} — Portfolio`,
    description: person.tagline,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // next/font CSS variables must live on <html> (same node as data-theme /
  // theme token application). Putting them only on <body> broke aliases and
  // fell back to the browser serif (Times).
  const fontVariables = [
    fontDisplay.variable,
    fontSans.variable,
    fontAdventure.variable,
    fontCursive.variable,
    fontHand.variable,
    fontRoman.variable,
    fontHippie.variable,
    fontConspiracy.variable,
    fontGalaxy.variable,
    fontAtlantean.variable,
    fontCaptainGuy.variable,
    fontNerd.variable,
    fontPopArt.variable,
    fontPopArtScript.variable,
    fontSurrealist.variable,
    fontDogDaysGuy.variable,
    fontRetroGuy.variable,
  ].join(" ");

  return (
    <html
      lang="en"
      className={`scroll-smooth ${fontVariables}`}
      data-theme="cyberpunk"
    >
      <body className="font-sans antialiased">
        {/*
          Sync before paint: real pages get the signature plate class; catalog
          iframes (/component-preview/) must never sit under a black boot plate.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var p=location.pathname||'';if(p.indexOf('/component-preview')!==0){document.documentElement.classList.add('signature-booting');}})();",
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html.signature-booting,html.signature-booting body{background-color:#0c0c0c!important}",
          }}
        />
        <ThemeProvider>
          <ActivityProvider>
            <AdaGuyExplainerHost />
            {children}
          </ActivityProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
