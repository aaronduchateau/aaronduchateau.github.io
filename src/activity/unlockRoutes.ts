import { PORTFOLIO_PATH, isIntroPath } from "@/lib/routes";
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
  const url = new URL("https://example.invalid");
  url.pathname = PORTFOLIO_PATH;
  url.searchParams.set("modal", `${target.namespace}:${target.key}`);
  if (target.path && target.path.length > 0) {
    url.searchParams.set("path", target.path.join("~"));
  }
  if (target.item) url.searchParams.set("item", target.item);
  return `${url.pathname}${url.search}`;
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
    return { ...item, locked };
  });
}
