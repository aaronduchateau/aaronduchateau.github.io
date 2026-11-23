"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BLOG_PATH, isBlogPath, isPortfolioPath, PORTFOLIO_PATH } from "@/lib/routes";

export type SectionLink = {
  href: string;
  label: string;
  requiresFunThings?: boolean;
};

/** Homepage sections under the Work menu. Hash links, in scroll order. */
export const workSectionLinks: readonly SectionLink[] = [
  { href: "#interactive-things", label: "Interactive things" },
  { href: "#new-software-demos", label: "A few software demos" },
  { href: "#work", label: "Career timeline" },
  { href: "#projects", label: "Major projects" },
  { href: "#hackathons", label: "Hackathon Contributions" },
  { href: "#older-videos", label: "Archives" },
];

/**
 * Top-level destinations. Blog is its own page. The rest are homepage sections.
 */
export const primarySectionLinks: readonly SectionLink[] = [
  { href: BLOG_PATH, label: "Blog" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#education", label: "Education" },
  { href: "#human-things", label: "Human things", requiresFunThings: true },
];

export function useSectionPathname(): string {
  return usePathname() || "/";
}

/** Hash links only scroll on the portfolio page. Elsewhere they target that page. */
export function resolveSectionHref(href: string, pathname: string): string {
  if (href.startsWith("#") && !isPortfolioPath(pathname)) {
    return `${PORTFOLIO_PATH}${href}`;
  }
  return href;
}

export function isSectionLinkCurrent(href: string, pathname: string): boolean {
  return href === BLOG_PATH && isBlogPath(pathname);
}

export function SectionNavLink({
  href,
  pathname,
  className,
  onClick,
  children,
  role,
}: {
  href: string;
  pathname: string;
  className?: string;
  onClick?: () => void;
  children: ReactNode;
  role?: string;
}) {
  const resolved = resolveSectionHref(href, pathname);
  const current = isSectionLinkCurrent(href, pathname);
  if (resolved.startsWith("/")) {
    return (
      <Link
        href={resolved}
        role={role}
        onClick={onClick}
        aria-current={current ? "page" : undefined}
        className={className}
      >
        {children}
      </Link>
    );
  }
  return (
    <a href={resolved} role={role} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
