"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { recordActivity } from "@/activity/tracker";
import { primeTestimonialPlaybackGesture } from "@/lib/testimonialPlaybackPreload";

const PARAM = "modal";
const PATH_PARAM = "path";
const ITEM_PARAM = "item";
/** When `1`, testimonials (and similar) auto-enter play once assets are ready. */
export const PLAY_PARAM = "play";
const PATH_SEP = "~";

/** Fired after an external push so the owning `useRouteModal` treats Close as history.back(). */
export const ROUTE_MODAL_PUSHED_EVENT = "portfolio:route-modal-pushed";

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function parsePath(value: string | null): string[] {
  if (!value) return [];
  return value.split(PATH_SEP).filter(Boolean);
}

function parsePlay(value: string | null): boolean {
  return value === "1" || value === "true";
}

function writePlay(url: URL, play: boolean) {
  if (play) url.searchParams.set(PLAY_PARAM, "1");
  else url.searchParams.delete(PLAY_PARAM);
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
 * Syncs an open-modal to the URL so the modal is route-driven: refreshing the
 * page reopens (and remounts) it. Params owned here:
 *  - `modal=<namespace>:<key>` — which modal is open
 *  - `path=<colId>~<colId>...` — drill-down stack of collection ids inside it
 *  - `item=<id>`               — selected item id within the current view
 *  - `play=1`                  — optional auto-play request (e.g. testimonials)
 *
 * Works with static export since it only uses the History API on the client.
 * `namespace` must be unique per section instance so only the matching section
 * restores its modal from the shared URL params.
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
    const params = new URLSearchParams(window.location.search);
    const value = params.get(PARAM);
    if (value && value.startsWith(prefix)) {
      const key = value.slice(prefix.length);
      const config = resolveRef.current(key);
      if (config) {
        activeKeyRef.current = key;
        setActive(config);
        setActiveKey(key);
        setPath(parsePath(params.get(PATH_PARAM)));
        setSelectionState(params.get(ITEM_PARAM));
        setPlay(parsePlay(params.get(PLAY_PARAM)));
        return;
      }
    }
    const closingKey = activeKeyRef.current;
    if (closingKey) {
      trackModalClose(namespace, closingKey);
    }
    clearModalState();
  }, [prefix, namespace, clearModalState]);

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

  const writeView = useCallback(
    (url: URL, nextPath: string[], sel: string | null) => {
      if (nextPath.length > 0) {
        url.searchParams.set(PATH_PARAM, nextPath.join(PATH_SEP));
      } else {
        url.searchParams.delete(PATH_PARAM);
      }
      if (sel) {
        url.searchParams.set(ITEM_PARAM, sel);
      } else {
        url.searchParams.delete(ITEM_PARAM);
      }
    },
    [],
  );

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
      const url = new URL(window.location.href);
      url.searchParams.set(PARAM, `${namespace}:${key}`);
      writeView(url, nextPath, sel);
      writePlay(url, nextPlay);
      const state = { [PARAM]: `${namespace}:${key}` };
      if (opts?.replace) {
        window.history.replaceState(state, "", url);
      } else {
        window.history.pushState(state, "", url);
        didPushRef.current = true;
      }
      trackModalOpen(namespace, key);
    },
    [namespace, writeView],
  );

  const setView = useCallback(
    (nextPath: string[], sel: string | null) => {
      setPath(nextPath);
      setSelectionState(sel);
      if (typeof window === "undefined") return;
      const value = new URLSearchParams(window.location.search).get(PARAM);
      if (!value || !value.startsWith(prefix)) return;
      const url = new URL(window.location.href);
      writeView(url, nextPath, sel);
      window.history.replaceState(window.history.state, "", url);
    },
    [prefix, writeView],
  );

  const close = useCallback(() => {
    const key = activeKeyRef.current;
    if (typeof window === "undefined") {
      clearModalState();
      return;
    }
    const value = new URLSearchParams(window.location.search).get(PARAM);
    if (!value || !value.startsWith(prefix)) {
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
      const url = new URL(window.location.href);
      url.searchParams.delete(PARAM);
      url.searchParams.delete(PATH_PARAM);
      url.searchParams.delete(ITEM_PARAM);
      url.searchParams.delete(PLAY_PARAM);
      window.history.replaceState({}, "", url);
    }
  }, [prefix, namespace, clearModalState]);

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
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, `${namespace}:${key}`);
  const nextPath = opts?.path ?? [];
  if (nextPath.length > 0) {
    url.searchParams.set(PATH_PARAM, nextPath.join(PATH_SEP));
  } else {
    url.searchParams.delete(PATH_PARAM);
  }
  if (opts?.selection) {
    url.searchParams.set(ITEM_PARAM, opts.selection);
  } else {
    url.searchParams.delete(ITEM_PARAM);
  }
  writePlay(url, Boolean(opts?.play));
  url.searchParams.delete("options");
  url.searchParams.delete("optionsSound");
  const state = { [PARAM]: `${namespace}:${key}` };
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
