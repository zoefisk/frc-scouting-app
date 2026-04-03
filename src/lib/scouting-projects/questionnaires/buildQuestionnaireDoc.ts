// src/lib/scouting-projects/questionnaires/buildQuestionnaireDoc.ts

import type { ProjectQuestionnaireDoc } from "@/lib/scouting-projects/questionnaires/types";
import type { CreateProjectQuestionnaireInput } from "@/lib/scouting-projects/questionnaires/validation";

type BuildProjectQuestionnaireDocArgs = {
  input: CreateProjectQuestionnaireInput;
  questionnaireId: string;
  createdByUid: string;
  now?: string;
};

export function buildProjectQuestionnaireDoc({
  input,
  questionnaireId,
  createdByUid,
  now = new Date().toISOString(),
}: BuildProjectQuestionnaireDocArgs): ProjectQuestionnaireDoc {
  return {
    questionnaireId,
    projectId: input.projectId.trim(),
    kind: input.kind,

    name: input.name.trim(),
    version: input.version,
    isActive: input.isActive ?? false,

    source: input.source ?? "custom",
    basedOnQuestionnaireId: input.basedOnQuestionnaireId ?? null,

    definition: input.definition,

    createdByUid,
    createdAt: now,
    updatedAt: now,
  };
}
