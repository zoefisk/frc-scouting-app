import PageShell from "@/components/app/layout/PageShell";
import ProjectRequiredPageContent from "@/components/scouting-projects/pages/ProjectRequiredPageContent";

export default function AnalysisPage() {
  return (
    <PageShell width="md">
      <ProjectRequiredPageContent
        title="Analysis"
        description="Analysis is now scoped to a scouting project."
      />
    </PageShell>
  );
}
