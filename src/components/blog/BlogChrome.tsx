import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteNav } from "@/components/SiteNav";
import { APP_CONTENT_ID } from "@/hooks/useModalAccessibility";

/** Blog pages share the portfolio nav and footer. */
export function BlogChrome({ children }: { children: ReactNode }) {
  return (
    <div id={APP_CONTENT_ID} className="min-h-screen bg-surface-950 text-surface-200">
      <SiteNav />
      <main id="main-content">{children}</main>
      <SiteFooter />
    </div>
  );
}
