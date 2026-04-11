import PageShell from "@/components/app/layout/PageShell";
import ProjectRequiredPageContent from "@/components/scouting-projects/pages/ProjectRequiredPageContent";

export default function AlliancePickerPage() {
  return (
    <PageShell width="md">
      <ProjectRequiredPageContent
        title="Alliance Selector"
        description="Alliance selection is now tied to a scouting project."
      />
    </PageShell>
  );
}
