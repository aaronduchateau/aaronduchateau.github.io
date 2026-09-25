"use client";

import Image from "next/image";
import { HeroVideoWidget } from "@/components/HeroVideoWidget";
import { Button } from "@/components/ui";
import { person } from "@/data/content";
import { THEME_PALETTES } from "@/theme/palettes";
import { useTheme } from "@/theme/ThemeProvider";

export function Hero() {
  const { themeId, playNavClick } = useTheme();
  const heroImage = THEME_PALETTES[themeId].heroImage;
  const [firstName, ...lastNames] = person.name.split(" ");

  return (
    <header className="relative isolate overflow-x-clip border-b border-white/10">
      <div className="absolute inset-0 overflow-hidden">
        {heroImage ? (
          <Image
            key={heroImage}
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover object-left !inset-y-0 max-sm:!left-0 max-sm:!right-auto max-sm:!w-[175%] max-sm:!max-w-none sm:!inset-0 sm:!w-full shifted-left"
            sizes="100vw"
          />
        ) : null}
        <div className="theme-hero-scrim absolute inset-0" />
        <div className="theme-hero-accent absolute inset-0" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-28 sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:pb-24 lg:pt-32">
        <div className="max-w-xl space-y-6">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent-300/90">
            Portfolio · Full stack engineering
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            {firstName}
            <br className="md:hidden" />{" "}
            {lastNames.join(" ")}
          </h1>
          <p className="text-lg text-surface-300">{person.title}</p>
          <p className="text-sm leading-relaxed text-surface-400">{person.tagline}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              role="ghost"
              href={person.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playNavClick}
              className="gap-2 font-medium"
            >
              GitHub
            </Button>
            <Button
              role="primary"
              href={person.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={playNavClick}
              className="gap-2"
            >
              LinkedIn
            </Button>
          </div>
        </div>

        <HeroVideoWidget />
      </div>
    </header>
  );
}
