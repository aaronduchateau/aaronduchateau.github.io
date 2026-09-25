import { education } from "@/data/content";
import type { LibraryPropMap } from "./types";

function rowByDegree(degree: string | undefined) {
  return education.find((row) => row.degree === degree) ?? education[0];
}

/** Parent lookup: degree row → presentational EducationCard props. */
export function hydrateEducationLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const row = rowByDegree(props.educationId || props.degree);
  return {
    ...props,
    educationId: row.degree,
    years: row.years,
    degree: row.degree,
    school: row.school,
    detail: row.detail,
    splash: JSON.stringify(row.accent),
  };
}

export function applyEducationControl(
  props: LibraryPropMap,
  key: string,
  value: string,
): LibraryPropMap {
  const next = { ...props, [key]: value };
  if (key === "educationId") return hydrateEducationLibraryProps(next);
  return next;
}

export function educationJsonNeedsHydration(props: LibraryPropMap): boolean {
  if (!props.degree || !props.splash) return true;
  try {
    const splash = JSON.parse(props.splash) as unknown;
    return !(splash && typeof splash === "object" && "from" in splash && "to" in splash);
  } catch {
    return true;
  }
}
