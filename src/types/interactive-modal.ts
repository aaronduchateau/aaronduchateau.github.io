export type InteractiveModalStubExperience = {
  type: "stub";
  id: string;
  message?: string;
};

export type InteractiveModalComponentExperience = {
  type: "component";
  id: string;
  componentId: string;
};

export type InteractiveModalExperience =
  | InteractiveModalStubExperience
  | InteractiveModalComponentExperience;

export type InteractiveModalConfig = {
  title: string;
  date: string;
  intro: string;
  detail?: string;
  contextLabel: string;
  /** Optional CTA under the context copy (e.g. jump into the demo’s upload flow). */
  contextAction?: {
    label: string;
    /** Dispatched as `window` CustomEvent name when the CTA is clicked. */
    event: string;
  };
  interactive: InteractiveModalExperience;
};
