import type { MediaModalItem } from "@/types/media-modal";

export type DevStudioSession = {
  modalTitle: string;
  path: string[];
  pathLabels: string[];
  items: MediaModalItem[];
};

export type DevStudioExportPayload = {
  exportedAt: string;
  modalTitle: string;
  path: string[];
  pathLabels: string[];
  itemIds: string[];
  items: ReturnType<typeof stubItem>[];
};

function stubItem(item: MediaModalItem) {
  const locked = item.locked ? { locked: true as const } : {};
  switch (item.type) {
    case "photo":
      return { type: "photo" as const, id: item.id, src: item.src, alt: item.alt, ...locked };
    case "slideReveal":
      return {
        type: "slideReveal" as const,
        id: item.id,
        before: item.before.src,
        after: item.after.src,
        ...locked,
      };
    case "collection":
      return {
        type: "collection" as const,
        id: item.id,
        title: item.title,
        cover: item.cover.src,
        itemCount: item.items.length,
        ...locked,
      };
    case "video":
      return {
        type: "video" as const,
        id: item.id,
        youtubeId: item.youtubeId,
        startSeconds: item.startSeconds,
        ...locked,
      };
    case "testimonial":
      return {
        type: "testimonial" as const,
        id: item.id,
        attribution: item.attribution,
        ...locked,
      };
  }
}

export function buildStudioExport(session: DevStudioSession): DevStudioExportPayload {
  return {
    exportedAt: new Date().toISOString(),
    modalTitle: session.modalTitle,
    path: session.path,
    pathLabels: session.pathLabels,
    itemIds: session.items.map((item) => item.id),
    items: session.items.map(stubItem),
  };
}

/** Log ordered media JSON for pasting into content files. */
export function dumpStudioExport(session: DevStudioSession): void {
  const payload = buildStudioExport(session);
  console.log("%cMedia modal sort order", "font-weight:bold;color:#22d3ee");
  console.log(payload);
  console.log(JSON.stringify(payload, null, 2));
}
