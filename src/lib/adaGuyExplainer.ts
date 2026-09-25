export const ADA_GUY_EXPLAINER_EVENT = "portfolio:ada-guy-explainer";

/** Open the ADA Guy baseline note after a top-level theme pick. */
export function requestAdaGuyExplainer(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ADA_GUY_EXPLAINER_EVENT));
}
