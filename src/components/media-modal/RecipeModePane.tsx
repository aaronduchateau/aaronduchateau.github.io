"use client";

import Image from "next/image";
import { useState } from "react";
import { MODAL_CHROME_PAD_X } from "@/lib/modalLayout";
import type { MediaModalRecipeItem } from "@/types/media-modal";

type Props = {
  recipe: MediaModalRecipeItem;
  forceBw?: boolean;
};

/**
 * Full recipe reading surface — fills the media column (no bottom strip).
 * Photos + overlaid thumbs on the left; description beside; ingredients/steps below.
 */
export function RecipeModePane({ recipe, forceBw }: Props) {
  const photos = recipe.photos.length > 0 ? recipe.photos : [recipe.cover];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = photos[Math.min(activeIndex, photos.length - 1)] ?? recipe.cover;
  const bw = forceBw ? "grayscale" : "";

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col overflow-y-auto overscroll-contain bg-surface-950 ${MODAL_CHROME_PAD_X} py-3 sm:py-4`}
    >
      <header className="shrink-0">
        <h2 id="media-modal-title" className="modal-display-heading text-xl sm:text-2xl">
          <span className="modal-display-heading__text">{recipe.title}</span>
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-surface-300">{recipe.subtitle}</p>
      </header>

      <div className={`mt-4 grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] ${bw}`}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-black ring-1 ring-white/10 sm:aspect-[5/4]">
          <Image
            src={active.src}
            alt={active.alt ?? recipe.title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 45vw"
            priority
          />
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
                    className={`relative h-12 w-16 shrink-0 overflow-hidden rounded ring-2 transition sm:h-14 sm:w-20 ${
                      selected
                        ? "ring-accent-400"
                        : "ring-white/20 opacity-80 hover:opacity-100 hover:ring-accent-400/70"
                    }`}
                  >
                    <Image
                      src={photo.src}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="min-h-0 text-sm leading-relaxed text-surface-300">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            About this recipe
          </p>
          <p className="mt-2 whitespace-pre-line">{recipe.description}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 border-t border-white/10 pt-5 sm:grid-cols-2">
        <section aria-labelledby="recipe-ingredients-heading">
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
        <section aria-labelledby="recipe-steps-heading">
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
