import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ComponentPreviewShell } from "@/components/ComponentPreviewShell";

export const metadata: Metadata = {
  title: "Component preview",
  robots: { index: false, follow: false },
};

export default function ComponentPreviewLayout({ children }: { children: ReactNode }) {
  return <ComponentPreviewShell>{children}</ComponentPreviewShell>;
}
