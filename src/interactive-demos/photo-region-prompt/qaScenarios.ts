import { buildPromptFromParts } from "./buildPromptMarkdown";
import { getDemoSample, type DemoSampleId } from "./demoSamples";

export type QaThreadId = DemoSampleId;

export type QaMessage =
  | {
      role: "user";
      kind: "prompt";
      markdown: string;
    }
  | {
      role: "assistant";
      kind: "image";
      alt: string;
      src?: string;
    };

export type QaThread = {
  sampleId: QaThreadId;
  label: string;
  description: string;
  originalSrc: string;
  width: number;
  height: number;
  messages: QaMessage[];
};

const STUB_SIZE: Record<DemoSampleId, { width: number; height: number }> = {
  mistyHillside: { width: 1600, height: 1064 },
  gardenTomatoes: { width: 1600, height: 1200 },
  astronautMural: { width: 1600, height: 1064 },
  farmPigs: { width: 1600, height: 1064 },
  busyFountain: { width: 1600, height: 1064 },
  coupleThrones: { width: 1600, height: 1064 },
};

const qaIds: DemoSampleId[] = [
  "mistyHillside",
  "gardenTomatoes",
  "astronautMural",
  "farmPigs",
  "busyFountain",
  "coupleThrones",
];

export const qaThreads: QaThread[] = qaIds.map((id) => {
  const sample = getDemoSample(id);
  const size = STUB_SIZE[id];
  const markdown = buildPromptFromParts({
    width: size.width,
    height: size.height,
    points: sample.points,
    operation: sample.operation,
    instruction: sample.instruction,
    kind: "mask",
  });
  const appliedAlt =
    sample.operation === "add"
      ? `Placeholder: ${sample.instruction}`
      : `Placeholder: ${sample.instruction}`;

  return {
    sampleId: id,
    label: sample.label,
    description: sample.description,
    originalSrc: sample.src,
    width: size.width,
    height: size.height,
    messages: [
      { role: "user", kind: "prompt", markdown },
      { role: "assistant", kind: "image", alt: appliedAlt },
    ],
  };
});

export function getQaThread(id: QaThreadId): QaThread | undefined {
  return qaThreads.find((t) => t.sampleId === id);
}
