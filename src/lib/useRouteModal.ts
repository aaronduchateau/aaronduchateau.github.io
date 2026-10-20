"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordActivity } from "@/activity/tracker";
import {
  modalSharePath,
  parseModalLocation,
  portfolioHomePath,
  slugify,
  type ModalLocation,
} from "@/lib/modalSharePath";
import { normalizePathname } from "@/lib/routes";
import { primeTestimonialPlaybackGesture } from "@/lib/testimonialPlaybackPreload";

export { slugify };

/** When `1`, testimonials (and similar) auto-enter play once assets are ready. */
export const PLAY_PARAM = "play";

/** Fired after an external push so the owning `useRouteModal` treats Close as history.back(). */
export const ROUTE_MODAL_PUSHED_EVENT = "portfolio:route-modal-pushed";

function writePlay(url: URL, play: boolean) {
  if (play) url.searchParams.set(PLAY_PARAM, "1");
  else url.searchParams.delete(PLAY_PARAM);
}

function locationToUrl(loc: ModalLocation, play: boolean): URL {
  const url = new URL(modalSharePath(loc), window.location.origin);
  writePlay(url, play);
  return url;
}

/** Drop `play` from the URL without closing the modal. */
export function clearRouteModalPlay() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has(PLAY_PARAM)) return;
  url.searchParams.delete(PLAY_PARAM);
  window.history.replaceState(window.history.state, "", url);
}

function isActivityReportModal(namespace: string, key: string) {
  return namespace === "demos" && key === "my-events";
}

function trackModalOpen(namespace: string, key: string) {
  if (isActivityReportModal(namespace, key)) return;
  void recordActivity({
    type: "modal.open",
    contentId: `${namespace}:${key}`,
    label: `Open ${namespace}/${key}`,
    meta: { namespace, key },
  });
}

function trackModalClose(namespace: string, key: string) {
  if (isActivityReportModal(namespace, key)) return;
  void recordActivity({
    type: "modal.close",
    contentId: `${namespace}:${key}`,
    label: `Close ${namespace}/${key}`,
    meta: { namespace, key },
  });
}

/**
 * Syncs an open modal to the URL so refresh reopens it.
 *
 * Canonical form is a real path (`/portfolio-launched/open/<namespace>/<key>/`,
 * plus `view/` and `item/` when a strip selection is in the address bar) so
 * each view is its own static HTML file with Open Graph tags. Older
 * `?modal=<namespace>:<key>` links still open, then the address bar is
 * replaced with that path. `play=1` stays a query flag.
 *
 * `namespace` must be unique per section so only the matching section restores.
 */
export function useRouteModal<T>(
  namespace: string,
  resolve: (key: string) => T | null,
): {
  active: T | null;
  activeKey: string | null;
  /** Drill-down stack of collection ids inside the open modal. */
  path: string[];
  /** Selected item id within the current view (config-derived), or null. */
  selection: string | null;
  /** True when URL asks the modal to enter play once ready. */
  play: boolean;
  open: (
    key: string,
    config: T,
    opts?: {
      path?: string[];
      selection?: string | null;
      replace?: boolean;
      play?: boolean;
    },
  ) => void;
  /** Update the current view (collection path + selected item) in place. */
  setView: (path: string[], selection: string | null) => void;
  /** Clear `play` from the URL without closing. */
  clearPlay: () => void;
  close: () => void;
} {
  const [active, setActive] = useState<T | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [path, setPath] = useState<string[]>([]);
  const [selection, setSelectionState] = useState<string | null>(null);
  const [play, setPlay] = useState(false);
  const resolveRef = useRef(resolve);
  resolveRef.current = resolve;
  const didPushRef = useRef(false);
  const activeKeyRef = useRef<string | null>(null);

  const prefix = `${namespace}:`;

  const clearModalState = useCallback(() => {
    activeKeyRef.current = null;
    didPushRef.current = false;
    setActive(null);
    setActiveKey(null);
    setPath([]);
    setSelectionState(null);
    setPlay(false);
  }, []);

  const syncFromUrl = useCallback(() => {
    if (typeof window === "undefined") return;
    const loc = parseModalLocation(window.location.href);
    if (loc && loc.namespace === namespace) {
      const config = resolveRef.current(loc.key);
      if (config) {
        activeKeyRef.current = loc.key;
        setActive(config);
        setActiveKey(loc.key);
        setPath(loc.path);
        setSelectionState(loc.item);
        setPlay(loc.play);
        const canonical = modalSharePath(loc);
        if (normalizePathname(window.location.pathname) !== normalizePathname(canonical)) {
          const url = locationToUrl(loc, loc.play);
          window.history.replaceState({ modal: `${namespace}:${loc.key}` }, "", url);
        }
        return;
      }
    }
    const closingKey = activeKeyRef.current;
    if (closingKey) {
      trackModalClose(namespace, closingKey);
    }
    clearModalState();
  }, [namespace, clearModalState]);

  useEffect(() => {
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    const onPushed = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (typeof detail === "string" && detail.startsWith(prefix)) {
        didPushRef.current = true;
      }
    };
    window.addEventListener(ROUTE_MODAL_PUSHED_EVENT, onPushed);
    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(ROUTE_MODAL_PUSHED_EVENT, onPushed);
    };
  }, [syncFromUrl, prefix]);

  const clearPlay = useCallback(() => {
    setPlay(false);
    clearRouteModalPlay();
  }, []);

  const open = useCallback(
    (
      key: string,
      config: T,
      opts?: {
        path?: string[];
        selection?: string | null;
        replace?: boolean;
        play?: boolean;
      },
    ) => {
      const nextPath = opts?.path ?? [];
      const sel = opts?.selection ?? null;
      const nextPlay = Boolean(opts?.play);
      if (nextPlay) {
        primeTestimonialPlaybackGesture();
      }
      activeKeyRef.current = key;
      setActive(config);
      setActiveKey(key);
      setPath(nextPath);
      setSelectionState(sel);
      setPlay(nextPlay);
      if (typeof window === "undefined") return;
      const url = locationToUrl(
        { namespace, key, path: nextPath, item: sel },
        nextPlay,
      );
      const state = { modal: `${namespace}:${key}` };
      if (opts?.replace) {
        window.history.replaceState(state, "", url);
      } else {
        window.history.pushState(state, "", url);
        didPushRef.current = true;
      }
      trackModalOpen(namespace, key);
    },
    [namespace],
  );

  const setView = useCallback(
    (nextPath: string[], sel: string | null) => {
      setPath(nextPath);
      setSelectionState(sel);
      if (typeof window === "undefined") return;
      const key = activeKeyRef.current;
      const current = parseModalLocation(window.location.href);
      if (!key || !current || current.namespace !== namespace) return;
      const url = locationToUrl(
        { namespace, key, path: nextPath, item: sel },
        current.play,
      );
      window.history.replaceState(window.history.state, "", url);
    },
    [namespace],
  );

  const close = useCallback(() => {
    const key = activeKeyRef.current;
    if (typeof window === "undefined") {
      clearModalState();
      return;
    }
    const current = parseModalLocation(window.location.href);
    if (!current || current.namespace !== namespace) {
      clearModalState();
      return;
    }
    // Clear ref before history.back() so popstate sync does not double-count close.
    activeKeyRef.current = null;
    setActive(null);
    setActiveKey(null);
    setPath([]);
    setSelectionState(null);
    setPlay(false);
    if (key) trackModalClose(namespace, key);
    if (didPushRef.current) {
      didPushRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState({}, "", portfolioHomePath());
    }
  }, [namespace, clearModalState]);

  return { active, activeKey, path, selection, play, open, setView, clearPlay, close };
}

/**
 * Open a route modal from outside its section (e.g. hero CTA).
 * Pushes URL state and emits popstate so the owning `useRouteModal` syncs.
 */
export function navigateToRouteModal(
  namespace: string,
  key: string,
  opts?: {
    replace?: boolean;
    path?: string[];
    selection?: string | null;
    play?: boolean;
  },
) {
  if (typeof window === "undefined") return;
  // Learn-more / deep-link autoplay speaks after modal open timers — prime TTS
  // and the intro sting while we still have the opening click gesture (iOS).
  if (opts?.play) {
    primeTestimonialPlaybackGesture();
  }
  trackModalOpen(namespace, key);
  const nextPath = opts?.path ?? [];
  const url = locationToUrl(
    {
      namespace,
      key,
      path: nextPath,
      item: opts?.selection ?? null,
    },
    Boolean(opts?.play),
  );
  const state = { modal: `${namespace}:${key}` };
  if (opts?.replace) {
    window.history.replaceState(state, "", url);
  } else {
    window.history.pushState(state, "", url);
    window.dispatchEvent(
      new CustomEvent(ROUTE_MODAL_PUSHED_EVENT, { detail: `${namespace}:${key}` }),
    );
  }
  window.dispatchEvent(new PopStateEvent("popstate"));
}
