import { PORTFOLIO_PATH } from "@/lib/routes";

export const OPTIONS_PARAM = "options";
export const OPTIONS_SOUND_PARAM = "optionsSound";

export const OPEN_OPTIONS_MENU_EVENT = "portfolio:open-options-menu";

export type OptionsPanelId = "themes" | "versions" | "sounds" | "my-events";
export type OptionsSoundId = "base-clicks" | "content-windows";

export type OptionsRouteState = {
  panel: OptionsPanelId | null;
  soundCategory: OptionsSoundId | null;
};

const PANELS = new Set<string>(["themes", "versions", "sounds", "my-events"]);
const SOUND_PANELS = new Set<string>(["base-clicks", "content-windows"]);

export function parseOptionsSearch(search: string): OptionsRouteState {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const rawPanel = params.get(OPTIONS_PARAM);
  const rawSound = params.get(OPTIONS_SOUND_PARAM);
  const panel = rawPanel && PANELS.has(rawPanel) ? (rawPanel as OptionsPanelId) : null;
  const soundCategory =
    panel === "sounds" && rawSound && SOUND_PANELS.has(rawSound)
      ? (rawSound as OptionsSoundId)
      : null;
  return { panel, soundCategory };
}

export function writeOptionsSearch(url: URL, state: OptionsRouteState): void {
  if (state.panel) {
    url.searchParams.set(OPTIONS_PARAM, state.panel);
  } else {
    url.searchParams.delete(OPTIONS_PARAM);
  }
  if (state.panel === "sounds" && state.soundCategory) {
    url.searchParams.set(OPTIONS_SOUND_PARAM, state.soundCategory);
  } else {
    url.searchParams.delete(OPTIONS_SOUND_PARAM);
  }
}

export function optionsHref(state: OptionsRouteState, origin?: string): string {
  const url = new URL(origin ?? "https://example.invalid");
  url.pathname = PORTFOLIO_PATH;
  url.search = "";
  writeOptionsSearch(url, state);
  return `${url.pathname}${url.search}`;
}

/** Open the Options dropdown (optional deep-link into a panel). */
export function requestOptionsMenu(state?: OptionsRouteState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OptionsRouteState | null>(OPEN_OPTIONS_MENU_EVENT, {
      detail: state ?? null,
    }),
  );
}

export function navigateToOptions(
  state: OptionsRouteState,
  opts?: { replace?: boolean; clearModal?: boolean },
) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (opts?.clearModal) {
    url.searchParams.delete("modal");
    url.searchParams.delete("path");
    url.searchParams.delete("item");
  }
  writeOptionsSearch(url, state);
  const method = opts?.replace ? "replaceState" : "pushState";
  window.history[method]({ ...window.history.state, options: state }, "", url);
  requestOptionsMenu(state);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function clearOptionsSearch(opts?: { replace?: boolean }) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(OPTIONS_PARAM) && !url.searchParams.has(OPTIONS_SOUND_PARAM)) {
    return;
  }
  url.searchParams.delete(OPTIONS_PARAM);
  url.searchParams.delete(OPTIONS_SOUND_PARAM);
  const method = opts?.replace ? "replaceState" : "pushState";
  window.history[method](window.history.state, "", url);
}
