import PageShell from "@/components/app/layout/PageShell";
import React from "react";
import ScoutingProjectsIndexPage from "@/components/scouting-projects/pages/ScoutingProjectsIndexPage";

export default function ScoutingProjectsPage() {
  return (
    <PageShell width="xl">
      <ScoutingProjectsIndexPage />
    </PageShell>
  );
}
