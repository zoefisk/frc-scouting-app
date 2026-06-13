import MatchScoutingForm from "@/components/scouting/MatchScoutingForm";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";

type Props = {
  projectId?: string;
  questionnaire?: QuestionnaireDefinition;
  defaultEventKey?: string;
  defaultMatchNumber?: string;
  defaultScoutingPosition?:
    | "blueAlliance"
    | "blue1"
    | "blue2"
    | "blue3"
    | "redAlliance"
    | "red1"
    | "red2"
    | "red3";
  matchCollectionMode?: "robot" | "alliance";
  lockEvent?: boolean;
  enableDraftHydration?: boolean;
  title?: string;
  description?: string;
};

export default function MatchScoutingPageContent({
  projectId,
  questionnaire = matchScoutingV1,
  defaultEventKey = "2026cthar",
  defaultMatchNumber,
  defaultScoutingPosition,
  matchCollectionMode = "robot",
  lockEvent = false,
  enableDraftHydration = true,
  title,
  description,
}: Props) {
  return (
    <MatchScoutingForm
      projectId={projectId}
      questionnaire={questionnaire}
      defaultEventKey={defaultEventKey}
      defaultMatchNumber={defaultMatchNumber}
      defaultScoutingPosition={defaultScoutingPosition}
      matchCollectionMode={matchCollectionMode}
      lockEvent={lockEvent}
      enableDraftHydration={enableDraftHydration}
      title={title}
      description={description}
    />
  );
}
