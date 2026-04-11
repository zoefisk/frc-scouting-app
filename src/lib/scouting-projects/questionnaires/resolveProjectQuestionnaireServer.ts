import "server-only";

import { getProjectQuestionnaireServer } from "@/lib/firebase/server/questionnaires";
import { getBuiltInQuestionnaireById } from "@/lib/scouting/questionnaire/registry";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

export async function resolveProjectQuestionnaireServer(
  questionnaireId: string | null | undefined
): Promise<QuestionnaireDefinition | null> {
  if (!questionnaireId) {
    return null;
  }

  const builtIn = getBuiltInQuestionnaireById(questionnaireId);
  if (builtIn) {
    return builtIn;
  }

  const projectQuestionnaire =
    await getProjectQuestionnaireServer(questionnaireId);
  return projectQuestionnaire?.definition ?? null;
}
