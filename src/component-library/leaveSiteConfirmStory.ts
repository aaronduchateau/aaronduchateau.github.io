import { majorProjects } from "@/data/content";
import type { LibraryPropMap } from "./types";

export const LEAVE_SITE_LIBRARY_PROJECTS = majorProjects.filter((row) => Boolean(row.url));

function rowById(id: string | undefined) {
  return LEAVE_SITE_LIBRARY_PROJECTS.find((row) => row.id === id) ?? LEAVE_SITE_LIBRARY_PROJECTS[0];
}

/** Parent lookup: project id → presentational leave-confirm card props. */
export function hydrateLeaveSiteConfirmLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const row = rowById(props.projectId);
  return {
    ...props,
    projectId: row.id,
    company: row.company,
    location: row.location,
    window: row.window,
    role: row.role,
    bullets: JSON.stringify(row.bullets),
    photo: row.photo,
    href: row.url ?? "",
    armed: props.armed === "true" ? "true" : "false",
  };
}

export function applyLeaveSiteConfirmControl(
  props: LibraryPropMap,
  key: string,
  value: string,
): LibraryPropMap {
  const next = { ...props, [key]: value };
  if (key === "projectId") return hydrateLeaveSiteConfirmLibraryProps(next);
  return next;
}

export function leaveSiteConfirmJsonNeedsHydration(props: LibraryPropMap): boolean {
  return !props.company || !props.href || !props.photo;
}
