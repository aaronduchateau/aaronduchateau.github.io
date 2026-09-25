/** Ask the open interactive modal to close (theme playground → home). */
export const INTERACTIVE_DEMO_REQUEST_CLOSE = "interactive-demo:request-close";

export function requestInteractiveDemoClose() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(INTERACTIVE_DEMO_REQUEST_CLOSE));
}
