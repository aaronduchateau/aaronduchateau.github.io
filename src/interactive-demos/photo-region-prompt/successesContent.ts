export const successTryThisPhoto = {
  src: "/interactive-demos/photo-region-prompt/Aaron_DuChateau_window-painting.png",
  fileName: "Aaron_DuChateau_window-painting.png",
} as const;

export const successResultPhotos = [
  {
    src: "/interactive-demos/photo-region-prompt/Aaron_DuChateau_franklin-success-result-a.png",
    label: "Success result photo",
    alt: "Benjamin Franklin smoking, seated so his coat crosses the painted window frame, looking toward the viewer",
  },
  {
    src: "/interactive-demos/photo-region-prompt/Aaron_DuChateau_franklin-success-result-b.png",
    label: "Success result photo",
    alt: "Benjamin Franklin smoking, body overlapping the painted border, looking toward the viewer",
  },
] as const;

export const successMaskPhoto = {
  src: "/interactive-demos/photo-region-prompt/Aaron_DuChateau_franklin-success-mask.png",
  label: "Masked photo we sent",
  alt: "The original painting with a see-through overlay covering the left wall, painted border, and window where Franklin should be added",
} as const;

export const franklinMaskSuccessPrompt = `# Region edit prompt for AI

Photo 1 is the first attached image. It already includes a **semi-transparent mask** over the region to edit. There is no coordinate list and no second file. The mask is the only legal region.

## What
Benjamin franklin smoking a cigarette, he is looking opposite the direction the dog is looking (i.e. not toward the painting).

The new character or object must **expand to the confines of the mask** in photo 1 — every edge and every corner of that see-through overlay. The subject is allowed to be larger than a “natural” figure if that is what it takes to meet the mask.

## Do not invent borders

Do **not** assume a border, edge, or corner that is not part of the mask. Painted frames, window sashes, door openings, mats, canvas edges, picture-in-picture rectangles, and the corners of the photo or the painting are **not** the region unless the mask covers them.

Pay special attention to **edges and corners of the mask**. Meet those. Do not stop at a painted line that sits under or beside the overlay. Do not grow past the overlay to a photo corner or frame corner the mask does not include.

## Frame lines

If the mask clearly crosses a “frame line” (a painted sash, a picture frame, a window pane, the edge of a canvas), that is **intentional**. The injection must cross that line with the mask. Do not treat the frame as a wall.

**Small-margin exception:** if the mask only barely nicks a frame — a sliver, a hairline, an overlap that looks like a drawing miss — do not flood the whole frame. A clear, deliberate overlap is the instruction. A tiny miss is not.

## Reject
- Subject or fill sits only inside a painted window/frame while the mask still covers sash, wall, or frame → failed.
- Mask edges or corners left as original photo 1 while the middle changed → failed.
- Pixels clearly outside the overlay changed → failed.

## Operation
**Add**

## Ask
Edit photo 1 using the mask you can see on it. Expand the What to the confines of that overlay, including across any frame line the mask clearly covers. Return the edited image — not a plan.
`;
