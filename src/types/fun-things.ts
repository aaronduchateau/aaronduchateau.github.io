import type { MediaModalConfig } from "@/types/media-modal";

export type FunThingCard = {
  id: string;
  title: string;
  imageSrc: string;
  modal: MediaModalConfig;
};

export type FunThingsSectionConfig = {
  title: string;
  description: string;
  cards: readonly FunThingCard[];
};
