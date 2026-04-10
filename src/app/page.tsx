import MatchScoutingForm from "@/components/scouting/MatchScoutingForm";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";
import PageShell from "@/components/app/layout/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <MatchScoutingForm
        questionnaire={matchScoutingV1}
        defaultEventKey="2026cthar"
      />
    </PageShell>
  );
}
