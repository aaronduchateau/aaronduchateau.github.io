"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ModalChromeIconButton } from "@/components/ModalChromeIconButton";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { useModalLaunchClass } from "@/hooks/useModalLaunchClass";
import { getInteractiveDemoComponent } from "@/interactive-demos/registry";
import { INTERACTIVE_DEMO_REQUEST_CLOSE } from "@/lib/interactiveDemoClose";
import { MODAL_CHROME_PAD_X, MODAL_SPLIT_GRID_CLASS, MODAL_TOPBAR_PAD_X, MODAL_VIEWPORT_INNER } from "@/lib/modalLayout";
import { playBoundNavClick } from "@/theme/sounds";
import type { InteractiveModalConfig } from "@/types/interactive-modal";

type Props = {
  config: InteractiveModalConfig | null;
  onClose: () => void;
};

function InteractivePane({ config }: { config: InteractiveModalConfig }) {
  const { interactive } = config;

  if (interactive.type === "stub") {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center border border-dashed border-white/15 bg-black p-8 text-center">
        <p className="text-sm text-surface-400">{interactive.message ?? "Interactive demo coming soon."}</p>
      </div>
    );
  }

  const DemoComponent = getInteractiveDemoComponent(interactive.componentId);
  if (!DemoComponent) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center border border-red-500/30 bg-black p-8 text-center">
        <p className="text-sm text-red-300">Unknown demo: {interactive.componentId}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-black">
      <DemoComponent />
    </div>
  );
}

function ContextColumn({
  config,
  onContextAction,
}: {
  config: InteractiveModalConfig;
  onContextAction?: () => void;
}) {
  return (
    <>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-surface-500">{config.contextLabel}</p>
      <h2
        id="interactive-modal-title"
        className={`modal-display-heading mt-2 text-xl sm:text-2xl`}
      >
        <span className="modal-display-heading__text">{config.title}</span>
      </h2>
      <p className="mt-3 shrink-0 text-sm leading-relaxed text-surface-300">{config.intro}</p>
      {config.contextAction ? (
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent(config.contextAction!.event));
            onContextAction?.();
          }}
          className="mt-2 shrink-0 self-start text-sm font-semibold text-accent-300 underline decoration-accent-400/50 underline-offset-2 transition hover:text-accent-100 hover:decoration-accent-200"
        >
          {config.contextAction.label}
        </button>
      ) : null}
      {config.detail ? (
        <div className="mt-4 min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-white/10 pt-4 text-sm leading-relaxed text-surface-400">
          <div className="whitespace-pre-line">{config.detail}</div>
        </div>
      ) : null}
    </>
  );
}

export function InteractiveModal({ config, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [showMobileContext, setShowMobileContext] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { className: launchClass, onAnimationEnd } = useModalLaunchClass({
    openKey: config ? "open" : null,
  });
  useModalAccessibility(Boolean(config) && mounted, dialogRef, onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setShowMobileContext(false);
  }, [config?.title, config?.date]);

  useEffect(() => {
    if (!config) return;
    const onRequestClose = () => {
      playBoundNavClick();
      onClose();
    };
    window.addEventListener(INTERACTIVE_DEMO_REQUEST_CLOSE, onRequestClose);
    return () => window.removeEventListener(INTERACTIVE_DEMO_REQUEST_CLOSE, onRequestClose);
  }, [config, onClose]);

  if (!config || !mounted) return null;

  return createPortal(
    <div
      ref={dialogRef}
      className={`${launchClass} fixed inset-0 z-[120] flex h-dvh max-h-dvh w-full flex-col overflow-hidden bg-surface-950`}
      onAnimationEnd={onAnimationEnd}
      role="dialog"
      aria-modal="true"
      aria-labelledby="interactive-modal-title"
      tabIndex={-1}
    >
      <div className={MODAL_VIEWPORT_INNER}>
        <div
          className={`flex h-14 shrink-0 items-center justify-between border-b border-white/10 ${MODAL_TOPBAR_PAD_X}`}
        >
          <ModalCloseButton onClick={onClose} />
          <div className="flex items-center gap-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">{config.date}</p>
            <span className="lg:hidden">
              <ModalChromeIconButton
                icon={showMobileContext ? "back" : "info"}
                ariaLabel={showMobileContext ? "Back to demo" : "View context"}
                onClick={() => setShowMobileContext((open) => !open)}
              />
            </span>
          </div>
        </div>

        <div className={MODAL_SPLIT_GRID_CLASS}>
          <div
            className={`min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain py-2 sm:py-3 ${MODAL_CHROME_PAD_X} ${
              showMobileContext ? "flex" : "hidden lg:flex"
            }`}
          >
            <ContextColumn config={config} onContextAction={() => setShowMobileContext(false)} />
          </div>

          <div
            className={`min-h-0 flex-col overflow-hidden border-t border-white/10 bg-black lg:border-l lg:border-t-0 py-2 sm:py-3 ${
              showMobileContext ? "hidden lg:flex" : "flex"
            }`}
          >
            <InteractivePane config={config} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
