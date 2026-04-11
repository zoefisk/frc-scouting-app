import MatchScoutingForm from "@/components/scouting/MatchScoutingForm";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";

export default function MatchScoutingPageContent() {
  return (
    <MatchScoutingForm
      questionnaire={matchScoutingV1}
      defaultEventKey="2026cthar"
    />
  );
}
