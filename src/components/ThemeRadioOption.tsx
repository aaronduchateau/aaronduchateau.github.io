"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

export type ThemeRadioChoice = {
  id: string;
  label: string;
  /** Short selection blurb — revealed under the option when selected. */
  description?: string;
};

type ThemeRadioOptionProps = {
  choice: ThemeRadioChoice;
  selected: boolean;
  onSelect: (id: string) => void;
  onArrowNavigate: (fromId: string, key: string) => void;
};

/** Keyboard-only ring on the shell — not on programmatic autofocus. */
const OPTION_FOCUS_RING =
  "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent-300";

const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"]);

/**
 * Theme-shaped radio control.
 * Tab visits every option; ↑/↓ move + select; Enter/Space select.
 * Selection blurb expands under the row: fixed ~24px corners (matches short
 * options); sides stay straight through the middle — not a tall pill.
 *
 * Focus ring uses `:has(:focus-visible)` on the shell so modal autofocus does
 * not paint a ring until the user actually tabs/arrows to an option.
 */
export function ThemeRadioOption({
  choice,
  selected,
  onSelect,
  onArrowNavigate,
}: ThemeRadioOptionProps) {
  const descId = useId();
  const hasBlurb = Boolean(choice.description);
  /**
   * Always open from 0fr → 1fr (including the default selected option on first
   * paint). Starting already at 1fr lets some engines stretch the row and fatten
   * the hairline; matching the post-selection path avoids that.
   */
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!selected || !hasBlurb) {
      setExpanded(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => setExpanded(true));
    return () => window.cancelAnimationFrame(frame);
  }, [selected, hasBlurb]);

  return (
    <div
      className={`overflow-hidden rounded-[24px] border transition-[border-color,background-color,box-shadow] duration-300 ${OPTION_FOCUS_RING} ${
        selected
          ? "border-accent-400/70 bg-accent-500/15 text-accent-100 shadow-lg shadow-accent-500/10"
          : "border-white/15 bg-white/5 text-surface-200 hover:border-accent-500/35 hover:bg-accent-950/25"
      }`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={selected}
        aria-describedby={selected && hasBlurb ? descId : undefined}
        data-radio-id={choice.id}
        onClick={() => onSelect(choice.id)}
        onKeyDown={(event) => {
          if (ARROW_KEYS.has(event.key)) {
            event.preventDefault();
            onArrowNavigate(choice.id, event.key);
            return;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(choice.id);
          }
        }}
        className="flex w-full cursor-pointer items-center gap-3 rounded-none bg-transparent px-3.5 py-2 text-left outline-none focus:outline-none focus-visible:outline-none"
      >
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
            selected ? "border-accent-300 bg-accent-400/30" : "border-white/35 bg-transparent"
          }`}
          aria-hidden
        >
          <span
            className={`h-2 w-2 rounded-full bg-accent-300 ${selected ? "opacity-100" : "opacity-0"}`}
          />
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{choice.label}</span>
      </button>

      {hasBlurb ? (
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            {/* h-fit so a 1fr row cannot stretch the panel and fatten the rule */}
            <div className="relative h-fit">
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10"
                style={{ height: 1 }}
                aria-hidden
              />
              <p
                id={descId}
                aria-hidden={!selected}
                className={`px-3.5 pb-2.5 pt-2.5 text-xs leading-relaxed text-surface-400 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
                  expanded ? "opacity-100" : "opacity-0"
                }`}
              >
                {choice.description}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

type ThemeRadioGroupProps = {
  title?: string;
  name: string;
  choices: readonly ThemeRadioChoice[];
  value: string;
  onChange: (id: string) => void;
  /** Accessible name when `title` is omitted (no visible legend). */
  ariaLabel?: string;
};

/**
 * Radiogroup: Tab through every option (explicit stops), and arrow keys move + select
 * per WAI-ARIA APG — both paths are intentional for this portfolio’s ADA proof.
 */
export function ThemeRadioGroup({
  title,
  name,
  choices,
  value,
  onChange,
  ariaLabel,
}: ThemeRadioGroupProps) {
  const titleId = useId();
  const labelledBy = title ? titleId : undefined;
  const listRef = useRef<HTMLDivElement>(null);

  const focusOption = useCallback((id: string) => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-radio-id="${id}"]`);
    el?.focus();
  }, []);

  const onArrowNavigate = useCallback(
    (fromId: string, key: string) => {
      if (choices.length === 0) return;
      const index = Math.max(
        0,
        choices.findIndex((c) => c.id === fromId),
      );
      let nextIndex = index;
      if (key === "ArrowDown" || key === "ArrowRight") {
        nextIndex = (index + 1) % choices.length;
      } else if (key === "ArrowUp" || key === "ArrowLeft") {
        nextIndex = (index - 1 + choices.length) % choices.length;
      } else if (key === "Home") {
        nextIndex = 0;
      } else if (key === "End") {
        nextIndex = choices.length - 1;
      }
      const next = choices[nextIndex];
      if (!next) return;
      onChange(next.id);
      requestAnimationFrame(() => focusOption(next.id));
    },
    [choices, focusOption, onChange],
  );

  const onGroupKeyDown = (event: ReactKeyboardEvent<HTMLFieldSetElement>) => {
    if (!ARROW_KEYS.has(event.key)) return;
    const active = document.activeElement;
    const fromId =
      active instanceof HTMLElement ? active.getAttribute("data-radio-id") : null;
    if (!fromId) return;
    event.preventDefault();
    onArrowNavigate(fromId, event.key);
  };

  return (
    <fieldset
      className="min-w-0 border-0 p-0"
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-label={title ? undefined : ariaLabel}
      data-name={name}
      onKeyDown={onGroupKeyDown}
    >
      {title ? (
        <legend id={titleId} className="intro-section-label mb-3 text-accent-300/80">
          {title}
        </legend>
      ) : (
        <legend className="sr-only">{ariaLabel}</legend>
      )}
      <div ref={listRef} className="flex flex-col gap-2">
        {choices.map((choice) => (
          <ThemeRadioOption
            key={choice.id}
            choice={choice}
            selected={value === choice.id}
            onSelect={onChange}
            onArrowNavigate={onArrowNavigate}
          />
        ))}
      </div>
    </fieldset>
  );
}
