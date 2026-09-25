import { testimonials } from "@/data/content";
import type { LibraryPropMap } from "./types";

function letterById(letterId: string | undefined) {
  return testimonials.find((row) => row.id === letterId) ?? testimonials[0];
}

/** Parent lookup: letter id → presentational card props. Never an id in `quote`. */
export function hydrateTestimonialLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const fromQuoteId = testimonials.find((row) => row.id === props.quote);
  const letter = letterById(props.letterId || fromQuoteId?.id);
  return {
    ...props,
    letterId: letter.id,
    name: letter.name,
    title: letter.title,
    quote: letter.quote,
    photo: letter.photo,
  };
}

export function applyTestimonialControl(
  props: LibraryPropMap,
  key: string,
  value: string,
): LibraryPropMap {
  const next = { ...props, [key]: value };
  if (key === "letterId") return hydrateTestimonialLibraryProps(next);
  return next;
}

export function testimonialJsonNeedsHydration(props: LibraryPropMap): boolean {
  const quote = props.quote ?? "";
  if (!quote) return true;
  return testimonials.some((row) => row.id === quote);
}
