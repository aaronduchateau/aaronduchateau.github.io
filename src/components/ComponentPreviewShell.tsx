"use client";

import { useLayoutEffect, type ReactNode } from "react";

/**
 * Catalog iframe shell — strip any leftover signature-boot class before paint
 * (root layout also skips adding it on this path via a sync script).
 */
export function ComponentPreviewShell({ children }: { children: ReactNode }) {
  useLayoutEffect(() => {
    document.documentElement.classList.remove("signature-booting");
    document.documentElement.dataset.componentPreview = "1";
    return () => {
      delete document.documentElement.dataset.componentPreview;
    };
  }, []);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html:
            "document.documentElement.classList.remove('signature-booting');document.documentElement.dataset.componentPreview='1';",
        }}
      />
      {children}
    </>
  );
}
