import MatchScoutingPage from "@/components/scouting/MatchScoutingPage";
import MatchScoutingActionBar from "@/components/scouting/submission/MatchScoutingActionBar";
import { matchScoutingV1 } from "@/lib/scouting/questionnaire/builtins/matchScoutingV1";
import PageShell from "@/components/layout/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <MatchScoutingPage
        questionnaire={matchScoutingV1}
        defaultEventKey="2026cthar"
      />
    </PageShell>
  );
}
