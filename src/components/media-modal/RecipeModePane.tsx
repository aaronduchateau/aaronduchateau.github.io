"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui";
import { MODAL_CHROME_PAD_X } from "@/lib/modalLayout";
import type { MediaModalRecipeItem } from "@/types/media-modal";

type Props = {
  recipe: MediaModalRecipeItem;
  forceBw?: boolean;
  onGoBack: () => void;
  backLabel: string;
};

/**
 * Full recipe reading surface — fills the modal body (no left column, no bottom strip).
 * Narrow: single column stack. md+: photo + description side by side; ingredients/steps below.
 */
export function RecipeModePane({ recipe, forceBw, onGoBack, backLabel }: Props) {
  const photos = recipe.photos.length > 0 ? recipe.photos : [recipe.cover];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[Math.min(activeIndex, photos.length - 1)] ?? recipe.cover;
  const bw = forceBw ? "grayscale" : "";

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain bg-surface-950 ${MODAL_CHROME_PAD_X} py-3 sm:py-4`}
    >
      <div className="shrink-0">
        <Button role="ghost" className="px-3 py-1.5 text-xs sm:text-sm" onClick={onGoBack}>
          ← {backLabel}
        </Button>
      </div>

      <header className="mt-3 shrink-0 sm:mt-4">
        <h2 id="media-modal-title" className="modal-display-heading text-xl sm:text-2xl">
          <span className="modal-display-heading__text">{recipe.title}</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-surface-300">{recipe.subtitle}</p>
      </header>

      {/*
        Stack by default. From md (recipe mode is already full-bleed — no left
        context column), photo left / description right. Below md everything
        stacks: title → photo → description → ingredients → steps.
      */}
      <div className={`mt-4 flex flex-col gap-4 md:flex-row md:items-start md:gap-6 ${bw}`}>
        <div className="relative w-full shrink-0 overflow-hidden rounded-md bg-black ring-1 ring-white/10 md:w-[min(100%,22rem)] lg:w-[min(100%,26rem)]">
          <div className="relative aspect-[4/3] w-full max-h-[min(42dvh,22rem)] sm:max-h-[min(48dvh,26rem)]">
            <Image
              src={active.src}
              alt={active.alt ?? recipe.title}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 26rem"
              priority
            />
          </div>
          {photos.length > 1 ? (
            <div
              className="absolute bottom-2 left-2 right-2 z-10 flex gap-1.5 overflow-x-auto overscroll-contain rounded-md bg-black/55 p-1.5 backdrop-blur-sm"
              role="listbox"
              aria-label="Recipe photos"
            >
              {photos.map((photo, index) => {
                const selected = index === activeIndex;
                return (
                  <button
                    key={`${photo.src}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-label={photo.alt ?? `Photo ${index + 1}`}
                    onClick={() => setActiveIndex(index)}
                    className={`relative h-11 w-14 shrink-0 overflow-hidden rounded ring-2 transition sm:h-12 sm:w-16 ${
                      selected
                        ? "ring-accent-400"
                        : "ring-white/20 opacity-80 hover:opacity-100 hover:ring-accent-400/70"
                    }`}
                  >
                    <Image src={photo.src} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="min-w-0 flex-1 text-sm leading-relaxed text-surface-300 md:pt-0.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            About this recipe
          </p>
          <p className="mt-2 whitespace-pre-line">{recipe.description}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-6 border-t border-white/10 pt-5 md:flex-row md:gap-8">
        <section className="min-w-0 flex-1" aria-labelledby="recipe-ingredients-heading">
          <h3
            id="recipe-ingredients-heading"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-300/90"
          >
            Ingredients
          </h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-surface-300">
            {recipe.ingredients.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
        <section className="min-w-0 flex-1" aria-labelledby="recipe-steps-heading">
          <h3
            id="recipe-steps-heading"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-300/90"
          >
            Steps
          </h3>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-surface-300">
            {recipe.steps.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
