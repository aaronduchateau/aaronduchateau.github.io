import type { LibraryStory } from "../types";

export const SIMPLE_STORIES: readonly LibraryStory[] = [
  {
    id: "icons",
    kind: "simple",
    name: "Icons",
    summary:
      "Every UI glyph used on the site — chevrons, chrome, device sizes, lock/speaker, play, and the rest — in one grid.",
    controls: [
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
    ],
  },
  {
    id: "primary-cta",
    kind: "simple",
    name: "Primary CTA",
    summary: "Filled call-to-action — Enter portfolio, LinkedIn, Visit Site.",
    controls: [
      {
        key: "label",
        label: "Label",
        type: "select",
        defaultValue: "Visit Site",
        options: [
          { value: "Visit Site", label: "Visit Site" },
          { value: "Enter portfolio", label: "Enter portfolio" },
          { value: "LinkedIn", label: "LinkedIn" },
          { value: "Continue", label: "Continue" },
        ],
      },
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
      {
        key: "disabled",
        label: "Disabled",
        type: "radio",
        defaultValue: "false",
        options: [
          { value: "false", label: "No" },
          { value: "true", label: "Yes" },
        ],
      },
    ],
  },
  {
    id: "ghost-button",
    kind: "simple",
    name: "Ghost button",
    summary: "Filled quiet control — GitHub, Not now, Print, dismiss.",
    controls: [
      {
        key: "label",
        label: "Label",
        type: "select",
        defaultValue: "Not now",
        options: [
          { value: "Not now", label: "Not now" },
          { value: "GitHub", label: "GitHub" },
          { value: "Print", label: "Print" },
        ],
      },
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
      {
        key: "disabled",
        label: "Disabled",
        type: "radio",
        defaultValue: "false",
        options: [
          { value: "false", label: "No" },
          { value: "true", label: "Yes" },
        ],
      },
    ],
  },
  {
    id: "outline-button",
    kind: "simple",
    name: "Outline button",
    summary: "Bordered secondary — Back, Go back, View all character options.",
    controls: [
      {
        key: "label",
        label: "Label",
        type: "select",
        defaultValue: "Go back",
        options: [
          { value: "Go back", label: "Go back" },
          { value: "Back", label: "Back" },
          { value: "View all character options", label: "View all" },
        ],
      },
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
      {
        key: "disabled",
        label: "Disabled",
        type: "radio",
        defaultValue: "false",
        options: [
          { value: "false", label: "No" },
          { value: "true", label: "Yes" },
        ],
      },
    ],
  },
  {
    id: "nav-control",
    kind: "simple",
    name: "Nav control",
    summary: "Nav chrome role — Options, sound toggle, compact header actions.",
    controls: [
      {
        key: "label",
        label: "Label",
        type: "select",
        defaultValue: "Options",
        options: [
          { value: "Options", label: "Options" },
          { value: "Work", label: "Work" },
          { value: "Sounds", label: "Sounds" },
        ],
      },
    ],
  },
  {
    id: "modal-close",
    kind: "simple",
    name: "Modal close",
    summary: "Icon-only close — circular chrome used on every content window.",
    controls: [
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
    ],
  },
  {
    id: "section-heading",
    kind: "simple",
    name: "Section heading",
    summary: "Eyebrow + display title — the same pair used on every homepage strip.",
    controls: [
      {
        key: "eyebrow",
        label: "Eyebrow",
        type: "select",
        defaultValue: "Interactive tools",
        options: [
          { value: "Interactive tools", label: "Interactive tools" },
          { value: "Motion & narrative", label: "Motion & narrative" },
          { value: "Building this thing", label: "Building this thing" },
        ],
      },
      {
        key: "title",
        label: "Title",
        type: "select",
        defaultValue: "Interactive things",
        options: [
          { value: "Interactive things", label: "Interactive things" },
          { value: "Animation and story telling", label: "Animation and story telling" },
          { value: "How this site works", label: "How this site works" },
        ],
      },
    ],
  },
  {
    id: "page-section",
    kind: "simple",
    name: "Page section",
    summary:
      "Same homepage strip chrome as Work, Education, and Fun things. Hairline divider and padding are props; inner max-width is the role.",
    controls: [
      {
        key: "divider",
        label: "Divider",
        type: "radio",
        defaultValue: "bottom",
        options: [
          { value: "bottom", label: "Bottom" },
          { value: "top", label: "Top" },
          { value: "none", label: "None" },
        ],
      },
      {
        key: "padding",
        label: "Padding",
        type: "radio",
        defaultValue: "lg",
        options: [
          { value: "lg", label: "Large" },
          { value: "md", label: "Medium" },
        ],
      },
    ],
  },
  {
    id: "modal-frame",
    kind: "simple",
    name: "Modal frame",
    summary:
      "Same glass overlay + panel as the easter-egg board, timeline confirms, and Options warnings. Overlay click plays the bound click and closes. Parent still owns accessibility.",
    controls: [
      {
        key: "chrome",
        label: "Chrome",
        type: "select",
        defaultValue: "confirm",
        options: [
          { value: "confirm", label: "Confirm" },
          { value: "board", label: "Board" },
          { value: "list", label: "List" },
        ],
      },
    ],
  },
  {
    id: "demo-badge",
    kind: "simple",
    name: "Demo badge",
    summary: "Interactive plate used on Interactive things cards and the mobile list.",
    controls: [
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "card",
        options: [
          { value: "card", label: "Card" },
          { value: "list", label: "List" },
        ],
      },
    ],
  },
  {
    id: "preview",
    kind: "simple",
    name: "Preview",
    summary: "Device-size control — label plus Natural, Phone, Tablet, and Full screen icons.",
    controls: [
      {
        key: "label",
        label: "Label",
        type: "select",
        defaultValue: "Device size",
        options: [
          { value: "Device size", label: "Device size" },
          { value: "Preview size", label: "Preview size" },
          { value: "Viewport", label: "Viewport" },
        ],
      },
      {
        key: "size",
        label: "Size",
        type: "radio",
        defaultValue: "phone",
        options: [
          { value: "natural", label: "Natural" },
          { value: "phone", label: "Phone" },
          { value: "tablet", label: "Tablet" },
          { value: "fullscreen", label: "Full screen" },
        ],
      },
    ],
  },
];
