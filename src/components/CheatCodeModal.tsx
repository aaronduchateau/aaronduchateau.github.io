"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useActivity, type UnlockAllCheatStatus } from "@/activity";
import { ModalCloseButton } from "@/components/ModalCloseButton";
import { Button, ModalFrame } from "@/components/ui";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import { playBoundNavClick } from "@/theme/sounds";

type CheatCodeModalProps = {
  open: boolean;
  onClose: () => void;
};

function statusCopy(status: UnlockAllCheatStatus | null): string | null {
  if (!status) return null;
  if (status === "applied") {
    return "Code accepted. Everything is unlocked, and +2500 points were added to your score.";
  }
  if (status === "alreadyApplied") {
    return "This code was already used in this browser — unlocks and the +2500 bonus stay as they are.";
  }
  return "That code wasn’t accepted. Check the spelling and try again.";
}

/**
 * Confirm-style cheat entry — unlock-all is applied silently (no prize toast cascade).
 */
export function CheatCodeModal({ open, onClose }: CheatCodeModalProps) {
  const titleId = useId();
  const descId = useId();
  const inputId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { applyUnlockAllCheat } = useActivity();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<UnlockAllCheatStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useModalAccessibility(open, dialogRef, onClose);

  useEffect(() => {
    if (!open) {
      setCode("");
      setStatus(null);
      setSubmitting(false);
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(id);
  }, [open]);

  const submit = async () => {
    if (submitting) return;
    playBoundNavClick();
    setSubmitting(true);
    try {
      const next = await applyUnlockAllCheat(code);
      setStatus(next);
    } finally {
      setSubmitting(false);
    }
  };

  const feedback = statusCopy(status);
  const feedbackTone =
    status === "rejected" ? "text-amber-200" : status ? "text-accent-200" : null;

  return (
    <ModalFrame
      open={open}
      onClose={onClose}
      chrome="confirm"
      role="alertdialog"
      labelledBy={titleId}
      describedBy={descId}
      dialogRef={dialogRef}
    >
      <div className="absolute right-3 top-3">
        <ModalCloseButton onClick={onClose} size="sm" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-300/80">
        Secret code
      </p>
      <h2 id={titleId} className="modal-display-heading mt-2 pr-10 text-xl sm:text-2xl">
        <span className="modal-display-heading__text">Enter a code</span>
      </h2>
      <p id={descId} className="mt-3 text-sm leading-relaxed text-surface-300">
        Type a valid unlock code to open every easter-egg prize and add a score bonus.
      </p>

      <label htmlFor={inputId} className="mt-4 block text-xs font-semibold uppercase tracking-wider text-surface-400">
        Code
      </label>
      <input
        ref={inputRef}
        id={inputId}
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={code}
        disabled={submitting}
        onChange={(event) => {
          setCode(event.target.value);
          if (status) setStatus(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
        }}
        className="theme-btn-shape mt-1.5 w-full border border-white/15 bg-surface-950/60 px-3 py-2 font-mono text-sm text-white outline-none transition placeholder:text-surface-500 focus:border-accent-400/50"
        placeholder="Enter code"
      />

      {feedback && feedbackTone ? (
        <p className={`mt-3 text-sm leading-relaxed ${feedbackTone}`} role="status">
          {feedback}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          role="ghost"
          size="sm"
          onClick={() => {
            playBoundNavClick();
            onClose();
          }}
        >
          {status === "applied" || status === "alreadyApplied" ? "Done" : "Cancel"}
        </Button>
        {status === "applied" || status === "alreadyApplied" ? null : (
          <Button role="primary" size="sm" disabled={submitting || !code.trim()} onClick={() => void submit()}>
            Submit
          </Button>
        )}
      </div>
    </ModalFrame>
  );
}
