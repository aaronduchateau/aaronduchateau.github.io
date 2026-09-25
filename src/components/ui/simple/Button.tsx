"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";

export type ButtonRole = "primary" | "ghost" | "outline" | "nav";
export type ButtonSize = "sm" | "md" | "lg";

const SIZE_PAD: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-4 py-2.5 text-sm",
};

const FOCUS = "theme-focus-ring";

const ROLE_CLASS: Record<ButtonRole, string> = {
  primary:
    `theme-btn-shape theme-primary-cta inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`,
  ghost:
    `theme-btn-shape theme-ghost-cta inline-flex items-center justify-center font-semibold backdrop-blur transition disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`,
  outline:
    `theme-btn-shape inline-flex items-center justify-center border border-white/15 bg-white/5 font-semibold text-surface-200 transition hover:border-accent-500/40 hover:bg-accent-950/30 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`,
  nav: `theme-nav-control theme-btn-shape inline-flex items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`,
};

type Shared = {
  role?: ButtonRole;
  size?: ButtonSize;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  id?: string;
  tabIndex?: number;
  "aria-label"?: string;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "menu";
  "aria-controls"?: string;
  "aria-pressed"?: boolean;
  trackIgnore?: boolean;
};

type ButtonAsButton = Shared & {
  href?: undefined;
  type?: "button" | "submit";
};

type ButtonAsLink = Shared & {
  href: string;
  target?: string;
  rel?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

function classes(role: ButtonRole, size: ButtonSize, className?: string) {
  return `${ROLE_CLASS[role]} ${SIZE_PAD[size]} ${className ?? ""}`.trim();
}

function isExternalHref(href: string, target?: string) {
  return target === "_blank" || /^(https?:|mailto:|tel:)/i.test(href);
}

function extraAria(props: Shared) {
  return {
    id: props.id,
    tabIndex: props.tabIndex,
    "aria-label": props["aria-label"],
    "aria-expanded": props["aria-expanded"],
    "aria-haspopup": props["aria-haspopup"],
    "aria-controls": props["aria-controls"],
    "aria-pressed": props["aria-pressed"],
    ...(props.trackIgnore ? { "data-track-ignore": "" } : {}),
  };
}

/** Shared control — site surfaces and the component catalog import this. */
export function Button(props: ButtonProps) {
  const role = props.role ?? "primary";
  const size = props.size ?? "md";
  const className = classes(role, size, props.className);
  const aria = extraAria(props);

  if ("href" in props && props.href) {
    if (isExternalHref(props.href, props.target)) {
      return (
        <a
          href={props.href}
          target={props.target}
          rel={props.rel}
          onClick={props.onClick}
          className={className}
          {...aria}
        >
          {props.children}
        </a>
      );
    }

    return (
      <Link href={props.href} onClick={props.onClick} className={className} {...aria}>
        {props.children}
      </Link>
    );
  }

  const buttonProps = props as ButtonAsButton;
  return (
    <button
      type={buttonProps.type ?? "button"}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
      className={className}
      {...aria}
    >
      {buttonProps.children}
    </button>
  );
}
