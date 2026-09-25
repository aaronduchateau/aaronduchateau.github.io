"use client";

import type { ReactNode } from "react";
import { FullscreenIcon, NaturalIcon, PhoneIcon, TabletIcon } from "./icons";

export type PreviewSize = "natural" | "fullscreen" | "tablet" | "phone";

export type PreviewProps = {
  label?: string;
  size: PreviewSize;
  onNatural: () => void;
  onFullscreen: () => void;
  onTablet: () => void;
  onPhone: () => void;
  className?: string;
  labelClassName?: string;
  name?: string;
  idPrefix?: string;
  naturalAvailable?: boolean;
  fullscreenAvailable?: boolean;
  tabletAvailable?: boolean;
  phoneAvailable?: boolean;
};

function SizeOption({
  id,
  name,
  optionLabel,
  checked,
  disabled,
  onSelect,
  children,
}: {
  id: string;
  name: string;
  optionLabel: string;
  checked: boolean;
  disabled: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      title={disabled ? "Not enough room in this pane to show that size" : optionLabel}
      className={`inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition ${
        disabled
          ? "cursor-not-allowed text-surface-600"
          : checked
            ? "bg-white/10 text-white"
            : "text-surface-400 hover:text-surface-100"
      }`}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={id}
        checked={checked}
        disabled={disabled}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span className="theme-focus-ring rounded-md peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-300">
        {children}
        <span className="sr-only">{optionLabel}</span>
      </span>
    </label>
  );
}

/** Segmented device-size control — label, icons, hidden radios, callbacks. */
export function Preview({
  label = "Device size",
  size,
  onNatural,
  onFullscreen,
  onTablet,
  onPhone,
  className,
  labelClassName,
  name = "preview-size",
  idPrefix = "preview-size",
  naturalAvailable = true,
  fullscreenAvailable = true,
  tabletAvailable = true,
  phoneAvailable = true,
}: PreviewProps) {
  const groupLabel = label.trim() || "Device size";
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`.trim()}>
      {label.trim() ? (
        <p
          className={`font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500 ${labelClassName ?? ""}`.trim()}
        >
          {label}
        </p>
      ) : null}
      <fieldset className="shrink-0">
        <legend className="sr-only">{groupLabel}</legend>
        <div
          role="radiogroup"
          aria-label={groupLabel}
          className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-0.5"
        >
          <SizeOption
            id={`${idPrefix}-natural`}
            name={name}
            optionLabel="Natural"
            checked={size === "natural"}
            disabled={!naturalAvailable}
            onSelect={onNatural}
          >
            <NaturalIcon />
          </SizeOption>
          <span className="mx-0.5 h-3.5 w-px bg-white/15" aria-hidden />
          <SizeOption
            id={`${idPrefix}-phone`}
            name={name}
            optionLabel="Phone"
            checked={size === "phone"}
            disabled={!phoneAvailable}
            onSelect={onPhone}
          >
            <PhoneIcon />
          </SizeOption>
          <span className="mx-0.5 h-3.5 w-px bg-white/15" aria-hidden />
          <SizeOption
            id={`${idPrefix}-tablet`}
            name={name}
            optionLabel="Tablet"
            checked={size === "tablet"}
            disabled={!tabletAvailable}
            onSelect={onTablet}
          >
            <TabletIcon />
          </SizeOption>
          <span className="mx-0.5 h-3.5 w-px bg-white/15" aria-hidden />
          <SizeOption
            id={`${idPrefix}-fullscreen`}
            name={name}
            optionLabel="Full screen"
            checked={size === "fullscreen"}
            disabled={!fullscreenAvailable}
            onSelect={onFullscreen}
          >
            <FullscreenIcon />
          </SizeOption>
        </div>
      </fieldset>
    </div>
  );
}
