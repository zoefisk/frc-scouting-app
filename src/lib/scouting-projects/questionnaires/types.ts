import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

export type ProjectQuestionnaireKind = "match" | "pit";
export type ProjectQuestionnaireSource = "builtin" | "custom";

export type ProjectQuestionnaireDoc = {
  questionnaireId: string;
  projectId: string;
  kind: ProjectQuestionnaireKind;

  name: string;
  version: number;
  isActive: boolean;

  source: ProjectQuestionnaireSource;
  basedOnQuestionnaireId?: string | null;

  definition: QuestionnaireDefinition;

  createdByUid: string;
  createdAt: string;
  updatedAt: string;
};
