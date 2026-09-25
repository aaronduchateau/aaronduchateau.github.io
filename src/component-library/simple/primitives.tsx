"use client";

import { useEffect, useState } from "react";
import { InteractiveDemoBadge } from "@/components/InteractiveDemoBadge";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import {
  APP_ICON_CATALOG,
  Button,
  ModalFrame,
  PageSection,
  Preview,
  SectionHeading,
  type ButtonSize,
  type ModalFrameChrome,
  type PageSectionDivider,
  type PageSectionPadding,
  type PreviewSize,
} from "@/components/ui";
import { compileDemoHandler } from "../storyJson";

function asSize(size: string): ButtonSize {
  return size === "sm" || size === "lg" ? size : "md";
}

export function LibraryPrimaryCta({
  label,
  size,
  disabled,
  onClick,
}: {
  label: string;
  size: string;
  disabled: boolean;
  onClick?: string;
}) {
  return (
    <Button
      role="primary"
      size={asSize(size)}
      disabled={disabled}
      onClick={compileDemoHandler(onClick, "Primary CTA")}
    >
      {label}
    </Button>
  );
}

export function LibraryGhostButton({
  label,
  size,
  disabled,
  onClick,
}: {
  label: string;
  size: string;
  disabled: boolean;
  onClick?: string;
}) {
  return (
    <Button
      role="ghost"
      size={asSize(size)}
      disabled={disabled}
      onClick={compileDemoHandler(onClick, "Ghost button")}
    >
      {label}
    </Button>
  );
}

export function LibraryOutlineButton({
  label,
  size,
  disabled,
  onClick,
}: {
  label: string;
  size: string;
  disabled: boolean;
  onClick?: string;
}) {
  return (
    <Button
      role="outline"
      size={asSize(size)}
      disabled={disabled}
      onClick={compileDemoHandler(onClick, "Outline button")}
    >
      {label}
    </Button>
  );
}

export function LibraryNavControl({ label, onClick }: { label: string; onClick?: string }) {
  return (
    <Button role="nav" size="sm" onClick={compileDemoHandler(onClick, "Nav control")}>
      {label}
    </Button>
  );
}

export function LibraryModalClose({
  size,
  onClick,
}: {
  size: "sm" | "md" | "lg";
  onClick?: string;
}) {
  return (
    <ModalCloseButton
      size={size}
      onClick={compileDemoHandler(onClick, "Modal close")}
      ariaLabel="Close (preview)"
    />
  );
}

export function LibrarySectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="max-w-xl">
      <SectionHeading eyebrow={eyebrow} title={title} />
    </div>
  );
}

export function LibraryPageSection({
  divider,
  padding,
}: {
  divider: string;
  padding: string;
}) {
  const line: PageSectionDivider =
    divider === "top" || divider === "none" ? divider : "bottom";
  const pad: PageSectionPadding = padding === "md" ? "md" : "lg";
  return (
    <PageSection divider={line} padding={pad} className="w-full">
      <SectionHeading
        eyebrow="Education"
        title="University background"
        description="Degrees and studies from the University of Oregon that shaped both design thinking and technical execution."
      />
    </PageSection>
  );
}

export function LibraryModalFrame({
  chrome,
  onClose,
}: {
  chrome: string;
  onClose?: string;
}) {
  const frame: ModalFrameChrome =
    chrome === "board" || chrome === "list" ? chrome : "confirm";
  const close = compileDemoHandler(onClose, "Modal frame close");
  return (
    <ModalFrame open onClose={close} chrome={frame} labelledBy="library-modal-frame-title">
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={close} size="sm" />
      </div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
        {frame === "board" ? "Easter egg board" : frame === "list" ? "Work history" : "Confirm"}
      </p>
      <h2 id="library-modal-frame-title" className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl">
        <span className="modal-display-heading__text">
          {frame === "board"
            ? "The Aaron game"
            : frame === "list"
              ? "Career timeline"
              : "View full timeline?"}
        </span>
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-surface-300">
        Same overlay and glass panel the site uses. Overlay click plays the bound click.
      </p>
      {frame === "confirm" ? (
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button role="ghost" size="sm" onClick={close}>
            Not now
          </Button>
          <Button role="primary" size="sm" onClick={close}>
            Open timeline
          </Button>
        </div>
      ) : null}
    </ModalFrame>
  );
}

export function LibraryDemoBadge({ size }: { size: "card" | "list" }) {
  return <InteractiveDemoBadge size={size} />;
}

export function LibraryIcons({ size }: { size: string }) {
  const glyph = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <ul className="grid w-full grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
      {APP_ICON_CATALOG.map(({ id, label, Icon }) => (
        <li key={id}>
          <figure className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-3">
            <Icon className={`${glyph} shrink-0 text-surface-100`} />
            <figcaption className="text-center font-mono text-[9px] uppercase leading-tight tracking-wider text-surface-400">
              {label}
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}

export function LibraryPreview({
  label,
  size,
  onNatural,
  onFullscreen,
  onTablet,
  onPhone,
}: {
  label: string;
  size: string;
  onNatural?: string;
  onFullscreen?: string;
  onTablet?: string;
  onPhone?: string;
}) {
  const fromProps: PreviewSize =
    size === "tablet" || size === "fullscreen" || size === "natural" ? size : "phone";
  const [current, setCurrent] = useState<PreviewSize>(fromProps);

  useEffect(() => {
    setCurrent(fromProps);
  }, [fromProps]);

  return (
    <Preview
      label={label}
      size={current}
      onNatural={() => {
        setCurrent("natural");
        compileDemoHandler(onNatural, "Natural")();
      }}
      onFullscreen={() => {
        setCurrent("fullscreen");
        compileDemoHandler(onFullscreen, "Full screen")();
      }}
      onTablet={() => {
        setCurrent("tablet");
        compileDemoHandler(onTablet, "Tablet")();
      }}
      onPhone={() => {
        setCurrent("phone");
        compileDemoHandler(onPhone, "Phone")();
      }}
    />
  );
}
