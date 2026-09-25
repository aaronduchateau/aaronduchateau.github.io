import type {
  MediaModalCollectionItem,
  MediaModalItem,
  MediaModalPhotoItem,
} from "@/types/media-modal";
import type { ModalStructurePolicy } from "./types";

export function lastTopLevelPhoto(items: MediaModalItem[]): MediaModalPhotoItem | null {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item?.type === "photo") return item;
  }
  return null;
}

/** Cover shown on the parent strip / Open surface — policy may override JSON. */
export function resolveCollectionCover(
  collection: MediaModalCollectionItem,
  policy: ModalStructurePolicy,
): { src: string; alt?: string } {
  if (policy.coverFromFinalPhoto) {
    const finalPhoto = lastTopLevelPhoto(collection.items);
    if (finalPhoto) {
      return {
        src: finalPhoto.src,
        alt: finalPhoto.alt ?? collection.cover.alt ?? collection.title,
      };
    }
  }
  return collection.cover;
}

/** Id of the photo that should show the Final result badge, if any. */
export function finalResultPhotoIdForView(
  collection: MediaModalCollectionItem | null,
  items: MediaModalItem[],
  policy: ModalStructurePolicy,
): string | null {
  if (!collection || !policy.badgeFinalPhotoInNestedCollections) return null;
  return lastTopLevelPhoto(items)?.id ?? null;
}

/** Strip index to select when entering a nested collection. */
export function enterCollectionIndex(
  items: MediaModalItem[],
  policy: ModalStructurePolicy,
  firstViewableIndex: (items: MediaModalItem[]) => number,
): number {
  if (policy.enterCollectionAt === "final") {
    const finalPhoto = lastTopLevelPhoto(items);
    if (finalPhoto) {
      const idx = items.findIndex((it) => it.id === finalPhoto.id);
      if (idx >= 0) return idx;
    }
  }
  return firstViewableIndex(items);
}
