import PageShell from "@/components/app/layout/PageShell";
import React from "react";
import NewScoutingProjectPageContent from "@/components/scouting-projects/pages/NewScoutingProjectPageContent";
import { Stack } from "@mui/material";
import ScoutingProjectBreadcrumbs from "@/components/scouting-projects/ScoutingProjectBreadcrumbs";

export default function NewScoutingProjectPage() {
  return (
    <PageShell>
      <Stack spacing={2}>
        <ScoutingProjectBreadcrumbs
          items={[
            { label: "Scouting Projects", href: "/scouting-projects" },
            { label: "New Project" },
          ]}
        />
        <NewScoutingProjectPageContent />
      </Stack>
    </PageShell>
  );
}
