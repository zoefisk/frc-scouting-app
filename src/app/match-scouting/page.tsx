import PageShell from "@/components/app/layout/PageShell";
import ProjectRequiredPageContent from "@/components/scouting-projects/pages/ProjectRequiredPageContent";

export default function MatchScoutingPage() {
  return (
    <PageShell width="md">
      <ProjectRequiredPageContent
        title="Match Scouting"
        description="Match scouting is now project-scoped."
      />
    </PageShell>
  );
}
