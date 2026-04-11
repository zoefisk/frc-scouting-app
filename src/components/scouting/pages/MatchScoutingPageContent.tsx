import MatchScoutingForm from "@/components/scouting/MatchScoutingForm";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

type Props = {
  projectId?: string;
  questionnaire?: QuestionnaireDefinition;
  defaultEventKey?: string;
  title?: string;
  description?: string;
};

export default function MatchScoutingPageContent({
  projectId,
  questionnaire = matchScoutingV1,
  defaultEventKey = "2026cthar",
  title,
  description,
}: Props) {
  return (
    <MatchScoutingForm
      projectId={projectId}
      questionnaire={questionnaire}
      defaultEventKey={defaultEventKey}
      title={title}
      description={description}
    />
  );
}
