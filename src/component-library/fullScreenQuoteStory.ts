import { frescoQuote } from "@/data/content";
import type { LibraryPropMap } from "./types";

/** Parent lookup: homepage Fresco quote → presentational plate props. */
export function hydrateFullScreenQuoteLibraryProps(props: LibraryPropMap): LibraryPropMap {
  return {
    ...props,
    quote: props.quote || frescoQuote.text,
    attribution: props.attribution || frescoQuote.attribution,
    photo: props.photo || frescoQuote.photoSrc,
    photoAlt: props.photoAlt || frescoQuote.photoAlt,
  };
}
