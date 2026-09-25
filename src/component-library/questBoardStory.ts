import type { LibraryPropMap } from "./types";
import { questBoardCardPropsFromQuest, resolveIntroQuest } from "@/components/questBoardModel";

/** Parent lookup: quest id → presentational card props for the catalog iframe. */
export function hydrateQuestBoardLibraryProps(props: LibraryPropMap): LibraryPropMap {
  const complete = props.complete === "true";
  const questId = props.questId || "quiz-caveman";
  const model = questBoardCardPropsFromQuest(resolveIntroQuest(questId, complete));
  return {
    ...props,
    questId,
    title: model.title,
    bounty: model.bounty,
    unlockItems: JSON.stringify(model.unlockItems),
    card: model.card ? JSON.stringify(model.card) : "",
  };
}

export function applyQuestBoardControl(
  props: LibraryPropMap,
  key: string,
  value: string,
): LibraryPropMap {
  const next = { ...props, [key]: value };
  if (key === "questId") return hydrateQuestBoardLibraryProps(next);
  return next;
}
