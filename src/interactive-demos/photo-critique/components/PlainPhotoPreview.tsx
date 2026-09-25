"use client";

import {
  critiqueResultPhotoFrameClass,
  critiqueResultPhotoLabelClass,
} from "./photo-critique-layout";

type Props = {
  src: string;
  alt: string;
  /** Width / height — keeps letterboxing ≤ frame chrome. */
  imageAspect?: number;
};

export function PlainPhotoPreview({ src, alt, imageAspect }: Props) {
  const aspect = imageAspect && imageAspect > 0 ? imageAspect : undefined;

  return (
    <div
      className={`${critiqueResultPhotoFrameClass} w-full`}
      style={aspect ? { aspectRatio: aspect } : { minHeight: "7rem" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- blob/local URLs */}
      <img src={src} alt={alt} className="h-full w-full object-contain" />
      <span className={`${critiqueResultPhotoLabelClass} text-surface-300`}>Original</span>
    </div>
  );
}
