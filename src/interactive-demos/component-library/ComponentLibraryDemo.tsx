"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import {
  LIBRARY_KINDS,
  defaultPropsForStory,
  getLibraryStory,
  storiesForKind,
} from "@/component-library/catalog";
import { applyQuestBoardControl, hydrateQuestBoardLibraryProps } from "@/component-library/questBoardStory";
import {
  applyTestimonialControl,
  hydrateTestimonialLibraryProps,
  testimonialJsonNeedsHydration,
} from "@/component-library/testimonialStory";
import { applyEducationControl, educationJsonNeedsHydration, hydrateEducationLibraryProps } from "@/component-library/educationStory";
import { applyThemeCardControl, hydrateThemeCardLibraryProps, themeCardJsonNeedsHydration } from "@/component-library/themeCardStory";
import {
  applyCompareSliderControl,
  compareSliderJsonNeedsHydration,
  hydrateCompareSliderLibraryProps,
} from "@/component-library/compareSliderStory";
import { applyCareerTimelineControl, careerTimelineJsonNeedsHydration, hydrateCareerTimelineLibraryProps } from "@/component-library/careerTimelineStory";
import { applyLeaveSiteConfirmControl, hydrateLeaveSiteConfirmLibraryProps, leaveSiteConfirmJsonNeedsHydration } from "@/component-library/leaveSiteConfirmStory";
import { buildComponentPreviewSrc } from "@/component-library/previewUrl";
import {
  absorbCustomOptions,
  mergeControlOptions,
  parseStoryJson,
  stringifyStoryProps,
} from "@/component-library/storyJson";
import type { LibraryControl, LibraryControlOption, LibraryPropMap, LibraryStory } from "@/component-library/types";
import { Button, Preview, type PreviewSize } from "@/components/ui";
import { PreviewStage } from "@/component-library/PreviewStage";
import { DemoPanel } from "../shared/DemoPanel";
import { LibraryThemeSelect } from "./LibraryThemeSelect";
import { MODAL_CHROME_PAD_X } from "@/lib/modalLayout";

const JSON_DEBOUNCE_MS = 400;

function readStoryIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("item");
}

function ControlField({
  control,
  value,
  extras,
  onChange,
  fill = false,
  idPrefix = "library-control",
}: {
  control: LibraryControl;
  value: string;
  extras: Record<string, LibraryControlOption[]>;
  onChange: (key: string, next: string) => void;
  fill?: boolean;
  idPrefix?: string;
}) {
  const fieldId = `${idPrefix}-${control.key}`;
  const options = mergeControlOptions(control, extras);

  if (control.type === "select") {
    return (
      <label
        className={`flex flex-col gap-1 text-[11px] font-medium text-surface-400 ${
          fill ? "w-full min-w-0" : "min-w-[10rem]"
        }`}
      >
        {control.label}
        <select
          id={fieldId}
          value={value}
          onChange={(event) => onChange(control.key, event.target.value)}
          className={`theme-btn-shape border border-white/15 bg-surface-950 px-2.5 py-1.5 text-xs text-surface-100 ${
            fill ? "w-full" : ""
          }`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-[11px] font-medium text-surface-400">{control.label}</legend>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => {
          const optionId = `${fieldId}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className="inline-flex items-center gap-1.5 text-xs text-surface-200"
            >
              <input
                id={optionId}
                type="radio"
                name={fieldId}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(control.key, option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

function StoryIndex({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <div className="space-y-8">
      {LIBRARY_KINDS.map((kind) => {
        const stories = storiesForKind(kind.id);
        return (
          <section key={kind.id} aria-labelledby={`library-kind-${kind.id}`}>
            <header className="mb-3">
              <h3
                id={`library-kind-${kind.id}`}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-300/70"
              >
                {kind.label}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-surface-400">{kind.blurb}</p>
            </header>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {stories.map((story) => (
                <button
                  key={story.id}
                  type="button"
                  onClick={() => onOpen(story.id)}
                  className="theme-card p-4 text-left transition"
                >
                  <p className="text-sm font-semibold text-surface-100">{story.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-surface-400">{story.summary}</p>
                </button>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function JsonOverlay({
  value,
  error,
  onChange,
  onClose,
  onFocus,
  onBlur,
}: {
  value: string;
  error: string | null;
  onChange: (next: string) => void;
  onClose: () => void;
  onFocus: () => void;
  onBlur: () => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex p-3 sm:p-4">
      <div className="component-library-json-editor pointer-events-auto relative flex min-h-0 w-full flex-col bg-surface-950/55 shadow-lg shadow-black/30 backdrop-blur-[2px]">
        <div className="flex shrink-0 items-center justify-between gap-3 px-3 pt-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-400">JSON</p>
          <ModalCloseButton size="sm" ariaLabel="Close JSON editor" onClick={onClose} />
        </div>
        <label htmlFor="library-json-editor" className="sr-only">
          Component props JSON
        </label>
        <textarea
          id="library-json-editor"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          className="min-h-0 flex-1 resize-none bg-transparent px-3 py-2 font-mono text-[11px] leading-relaxed text-surface-100 outline-none"
        />
        {error ? (
          <p className="shrink-0 border-t border-red-400/30 bg-red-950/40 px-3 py-1.5 font-mono text-[10px] text-red-200">
            {error}
          </p>
        ) : (
          <p className="shrink-0 border-t border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
            Live JSON · debounce {JSON_DEBOUNCE_MS}ms
          </p>
        )}
      </div>
    </div>
  );
}

function PropGarden({
  controls,
  values,
  extras,
  onChange,
  trailing,
}: {
  controls: readonly LibraryControl[];
  values: LibraryPropMap;
  extras: Record<string, LibraryControlOption[]>;
  onChange: (key: string, next: string) => void;
  trailing?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const pick = (key: string, next: string) => {
    onChange(key, next);
    setOpen(false);
  };

  return (
    <div className="min-w-0">
      <div className="flex items-stretch gap-2">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="library-prop-garden"
          onClick={() => setOpen((current) => !current)}
          className="theme-btn-shape theme-nav-control theme-focus-ring inline-flex min-h-0 min-w-0 flex-1 items-center justify-between gap-2 self-stretch px-3 py-2 text-left text-xs font-semibold"
        >
          Prop Garden
          <span className="text-surface-500" aria-hidden>
            {open ? "▾" : "▸"}
          </span>
        </button>
        {trailing ? <div className="flex shrink-0 items-stretch">{trailing}</div> : null}
      </div>
      {open ? (
        <div
          id="library-prop-garden"
          className="mt-2 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-surface-950/80 p-3"
        >
          {controls.map((control) => {
            const options = mergeControlOptions(control, extras);
            const selected = values[control.key] ?? control.defaultValue;
            if (options.length > 2 || control.type === "select") {
              return (
                <ControlField
                  key={control.key}
                  control={{ ...control, type: "select" }}
                  extras={extras}
                  value={selected}
                  onChange={pick}
                  fill
                  idPrefix="library-garden"
                />
              );
            }
            return (
              <div key={control.key}>
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">
                  {control.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((option) => {
                    const active = option.value === selected;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => pick(control.key, option.value)}
                        className={`theme-btn-shape px-2.5 py-1.5 text-left text-xs transition ${
                          active
                            ? "bg-white/15 text-white"
                            : "bg-white/5 text-surface-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function applyStoryJson(
  story: LibraryStory,
  raw: string,
  setProps: (props: LibraryPropMap) => void,
  setExtras: (extras: Record<string, LibraryControlOption[]>) => void,
  extras: Record<string, LibraryControlOption[]>,
  setError: (error: string | null) => void,
) {
  const parsed = parseStoryJson(raw);
  if ("error" in parsed) {
    setError(parsed.error);
    return;
  }
  setError(null);
  setExtras(absorbCustomOptions(story, parsed.props, extras));
  const merged = { ...defaultPropsForStory(story), ...parsed.props };
  if (story.id === "quest-board-card" && !parsed.props.title) {
    setProps(hydrateQuestBoardLibraryProps(merged));
    return;
  }
  if (story.id === "testimonial-card" && testimonialJsonNeedsHydration(parsed.props)) {
    setProps(hydrateTestimonialLibraryProps(merged));
    return;
  }
  if (story.id === "education-card" && educationJsonNeedsHydration(parsed.props)) {
    setProps(hydrateEducationLibraryProps(merged));
    return;
  }
  if (story.id === "theme-card" && themeCardJsonNeedsHydration(parsed.props)) {
    setProps(hydrateThemeCardLibraryProps(merged));
    return;
  }
  if (story.id === "compare-slider" && compareSliderJsonNeedsHydration(parsed.props)) {
    setProps(hydrateCompareSliderLibraryProps(merged));
    return;
  }
  if (story.id === "career-timeline" && careerTimelineJsonNeedsHydration(parsed.props)) {
    setProps(hydrateCareerTimelineLibraryProps(merged));
    return;
  }
  if (story.id === "leave-site-confirm" && leaveSiteConfirmJsonNeedsHydration(parsed.props)) {
    setProps(hydrateLeaveSiteConfirmLibraryProps(merged));
    return;
  }
  setProps(merged);
}

function StoryWorkbench({
  storyId,
  onBack,
}: {
  storyId: string;
  onBack: () => void;
}) {
  const story = getLibraryStory(storyId);
  const [previewSize, setPreviewSize] = useState<PreviewSize>("phone");
  const [deviceAvailable, setDeviceAvailable] = useState<Record<PreviewSize, boolean>>({
    natural: true,
    fullscreen: true,
    tablet: true,
    phone: true,
  });
  const [props, setProps] = useState<LibraryPropMap>(() =>
    story ? defaultPropsForStory(story) : {},
  );
  const [extras, setExtras] = useState<Record<string, LibraryControlOption[]>>({});
  const [jsonOpen, setJsonOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);
  const jsonFocused = useRef(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!story) return;
    const next = defaultPropsForStory(story);
    setProps(next);
    setExtras({});
    setPreviewSize("phone");
    setJsonOpen(false);
    setJsonError(null);
    setJsonText(stringifyStoryProps(story, next));
  }, [story]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, []);

  const previewSrc = useMemo(
    () => (story ? buildComponentPreviewSrc(story.id, props) : ""),
    [props, story],
  );

  const onNatural = useCallback(() => setPreviewSize("natural"), []);
  const onFullscreen = useCallback(() => setPreviewSize("fullscreen"), []);
  const onTablet = useCallback(() => setPreviewSize("tablet"), []);
  const onPhone = useCallback(() => setPreviewSize("phone"), []);

  const onAvailabilityChange = useCallback((next: Record<PreviewSize, boolean>) => {
    setDeviceAvailable((current) =>
      current.natural === next.natural &&
      current.fullscreen === next.fullscreen &&
      current.tablet === next.tablet &&
      current.phone === next.phone
        ? current
        : next,
    );
  }, []);

  const commitProps = useCallback(
    (next: LibraryPropMap) => {
      if (!story) return;
      const withExtras = absorbCustomOptions(story, next, extras);
      setExtras(withExtras);
      setProps(next);
      if (!jsonFocused.current) {
        setJsonText(stringifyStoryProps(story, next));
        setJsonError(null);
      }
    },
    [extras, story],
  );

  const onControlChange = useCallback(
    (key: string, next: string) => {
      if (story?.id === "quest-board-card") {
        commitProps(applyQuestBoardControl(props, key, next));
        return;
      }
      if (story?.id === "testimonial-card") {
        commitProps(applyTestimonialControl(props, key, next));
        return;
      }
      if (story?.id === "education-card") {
        commitProps(applyEducationControl(props, key, next));
        return;
      }
      if (story?.id === "theme-card") {
        commitProps(applyThemeCardControl(props, key, next));
        return;
      }
      if (story?.id === "compare-slider") {
        commitProps(applyCompareSliderControl(props, key, next));
        return;
      }
      if (story?.id === "career-timeline") {
        commitProps(applyCareerTimelineControl(props, key, next));
        return;
      }
      if (story?.id === "leave-site-confirm") {
        commitProps(applyLeaveSiteConfirmControl(props, key, next));
        return;
      }
      commitProps({ ...props, [key]: next });
    },
    [commitProps, props, story],
  );

  const onJsonTextChange = useCallback(
    (raw: string) => {
      setJsonText(raw);
      if (!story) return;
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        applyStoryJson(story, raw, setProps, setExtras, extras, setJsonError);
      }, JSON_DEBOUNCE_MS);
    },
    [extras, story],
  );

  const toggleJson = useCallback(() => {
    setJsonOpen((open) => {
      const next = !open;
      if (next && story) {
        setJsonText(stringifyStoryProps(story, props));
        setJsonError(null);
      }
      return next;
    });
  }, [props, story]);

  if (!story) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-surface-400">Unknown component.</p>
        <Button role="ghost" size="sm" className="self-start" onClick={onBack}>
          Back to catalog
        </Button>
      </div>
    );
  }

  const advanced = story.kind === "advanced";
  const hasControls = story.controls.length > 0;

  const deviceSizeControl = (placement: "header" | "garden") => (
    <Preview
      label={placement === "header" ? "Device size" : ""}
      size={previewSize}
      naturalAvailable={deviceAvailable.natural}
      fullscreenAvailable={deviceAvailable.fullscreen}
      tabletAvailable={deviceAvailable.tablet}
      phoneAvailable={deviceAvailable.phone}
      onNatural={onNatural}
      onFullscreen={onFullscreen}
      onTablet={onTablet}
      onPhone={onPhone}
      name={`library-device-size-${placement}`}
      idPrefix={`library-device-size-${placement}`}
    />
  );

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className={`flex shrink-0 items-center gap-3 ${MODAL_CHROME_PAD_X}`}>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent-300/70">
            {story.kind === "simple" ? "Simple" : "Advanced"}
          </p>
          <h3 className="text-sm font-semibold text-surface-100">{story.name}</h3>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2">
          {advanced ? <div className="hidden md:block">{deviceSizeControl("header")}</div> : null}
          <Button
            role="nav"
            size="sm"
            aria-pressed={jsonOpen}
            onClick={toggleJson}
            className={jsonOpen ? "bg-white/15" : undefined}
          >
            JSON
          </Button>
          <LibraryThemeSelect />
          <ModalCloseButton size="sm" ariaLabel="Back to catalog" onClick={onBack} />
        </div>
      </div>

      {hasControls || advanced ? (
        <div className={`shrink-0 md:hidden ${MODAL_CHROME_PAD_X}`}>
          {hasControls ? (
            <PropGarden
              controls={story.controls}
              values={props}
              extras={extras}
              onChange={onControlChange}
              trailing={advanced ? deviceSizeControl("garden") : null}
            />
          ) : advanced ? (
            <div className="flex justify-end">{deviceSizeControl("garden")}</div>
          ) : null}
        </div>
      ) : null}

      {hasControls ? (
        <div
          className={`hidden shrink-0 space-y-4 border-b border-white/10 pb-4 md:block ${MODAL_CHROME_PAD_X}`}
        >
          <div className="flex flex-wrap gap-x-6 gap-y-4">
            {story.controls.map((control) => (
              <ControlField
                key={control.key}
                control={control}
                extras={extras}
                value={props[control.key] ?? control.defaultValue}
                onChange={onControlChange}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div className="relative min-h-0 min-w-0 flex-1">
        {advanced ? (
          <PreviewStage
            size={previewSize}
            onFullscreen={onFullscreen}
            onAvailabilityChange={onAvailabilityChange}
            className="h-full min-h-0"
          >
            <iframe
              key={previewSrc}
              title={`${story.name} preview`}
              src={previewSrc}
              className="component-library-preview-frame h-full w-full border-0 bg-surface-950"
            />
          </PreviewStage>
        ) : (
          <iframe
            key={previewSrc}
            title={`${story.name} preview`}
            src={previewSrc}
            className="component-library-preview-frame component-library-preview-frame--simple h-full min-h-[280px] w-full"
          />
        )}
        {jsonOpen ? (
          <JsonOverlay
            value={jsonText}
            error={jsonError}
            onChange={onJsonTextChange}
            onClose={() => setJsonOpen(false)}
            onFocus={() => {
              jsonFocused.current = true;
            }}
            onBlur={() => {
              jsonFocused.current = false;
            }}
          />
        ) : null}
      </div>
    </div>
  );
}

export function ComponentLibraryDemo() {
  const [storyId, setStoryId] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => setStoryId(readStoryIdFromUrl());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const openStory = useCallback((id: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("item", id);
    window.history.pushState(window.history.state, "", url);
    setStoryId(id);
  }, []);

  const closeStory = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("item")) {
      window.history.back();
      return;
    }
    setStoryId(null);
  }, []);

  return (
    <DemoPanel
      title={storyId ? undefined : "Component catalog"}
      actions={storyId ? undefined : <LibraryThemeSelect />}
    >
      {storyId ? (
        <StoryWorkbench storyId={storyId} onBack={closeStory} />
      ) : (
        <div className={`h-full min-h-0 overflow-y-auto overscroll-contain pr-1 ${MODAL_CHROME_PAD_X}`}>
          <StoryIndex onOpen={openStory} />
        </div>
      )}
    </DemoPanel>
  );
}
