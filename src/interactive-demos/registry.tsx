import type { ComponentType } from "react";
import { ComponentLibraryDemo } from "./component-library/ComponentLibraryDemo";
import { MyEventsDemo } from "./my-events/MyEventsDemo";
import { NpmAuditDemo } from "./npm-audit/NpmAuditDemo";
import { PhotoCritiqueDemo } from "./photo-critique/PhotoCritiqueDemo";
import { PhotoRegionPromptDemo } from "./photo-region-prompt/PhotoRegionPromptDemo";
import { ThemePickerDemo } from "./theme-picker/ThemePickerDemo";

export type InteractiveDemoId =
  | "npmAudit"
  | "photoCritique"
  | "photoRegionPrompt"
  | "themePicker"
  | "myEvents"
  | "componentLibrary";

export const interactiveDemoRegistry: Record<InteractiveDemoId, ComponentType> = {
  npmAudit: NpmAuditDemo,
  photoCritique: PhotoCritiqueDemo,
  photoRegionPrompt: PhotoRegionPromptDemo,
  themePicker: ThemePickerDemo,
  myEvents: MyEventsDemo,
  componentLibrary: ComponentLibraryDemo,
};

export function getInteractiveDemoComponent(id: string): ComponentType | null {
  return (interactiveDemoRegistry as Record<string, ComponentType>)[id] ?? null;
}
