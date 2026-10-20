import { modalSharePath } from "@/lib/modalSharePath";
import { isIntroPath } from "@/lib/routes";
import {
  navigateToOptions,
  optionsHref,
  type OptionsRouteState,
} from "@/lib/optionsRoute";
import { navigateToRouteModal } from "@/lib/useRouteModal";
import type { MediaModalItem } from "@/types/media-modal";
import type { UnlockedContentTarget } from "./unlockFeatures";

function onIntroRoute(): boolean {
  return typeof window !== "undefined" && isIntroPath(window.location.pathname);
}

function modalHref(target: Extract<UnlockedContentTarget, { kind: "modal" }>): string {
  return modalSharePath({
    namespace: target.namespace,
    key: target.key,
    path: target.path ?? [],
    item: target.item ?? null,
  });
}

function goToMainSite(href: string) {
  window.location.assign(href);
}

/** Open a granted prize on the main site (query-param routes only). */
export function navigateToUnlockedContent(target: UnlockedContentTarget) {
  if (typeof window === "undefined") return;

  if (target.kind === "options") {
    const state: OptionsRouteState = {
      panel: target.panel,
      soundCategory: target.soundCategory ?? null,
    };
    if (onIntroRoute()) {
      goToMainSite(optionsHref(state));
      return;
    }
    navigateToOptions(state, { clearModal: true });
    return;
  }

  if (onIntroRoute()) {
    goToMainSite(modalHref(target));
    return;
  }

  navigateToRouteModal(target.namespace, target.key, {
    path: target.path,
    selection: target.item ?? null,
  });
}

/** Apply prize feature gates onto catalog `locked` flags. */
export function applyFeatureGates(
  items: MediaModalItem[],
  featureIds: ReadonlySet<string>,
): MediaModalItem[] {
  return items.map((item) => {
    const locked = item.gatedByFeature
      ? !featureIds.has(item.gatedByFeature)
      : Boolean(item.locked);
    if (item.type === "collection") {
      return { ...item, locked, items: applyFeatureGates(item.items, featureIds) };
    }
    // Recipes are leaves (photos live on the item, not as nested MediaModalItems).
    return { ...item, locked };
  });
}
