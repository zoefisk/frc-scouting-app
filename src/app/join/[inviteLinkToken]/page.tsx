import { notFound } from "next/navigation";
import PageShell from "@/components/app/layout/PageShell";
import JoinProjectPageClient from "@/components/scouting-projects/JoinProjectPageClient";
import { getScoutingProjectByInviteLinkTokenServer } from "@/lib/firebase/server/projects";

type Props = {
  params: Promise<{
    inviteLinkToken: string;
  }>;
};

export default async function JoinProjectPage({ params }: Props) {
  const { inviteLinkToken } = await params;

  const project =
    await getScoutingProjectByInviteLinkTokenServer(inviteLinkToken);

  if (!project) {
    notFound();
  }

  return (
    <PageShell width="sm">
      <JoinProjectPageClient
        project={{
          projectId: project.projectId,
          name: project.name,
          eventKey: project.eventKey,
          year: project.year,
          status: project.status,
          accessMode: project.accessMode,
          dataMode: project.dataMode,
          inviteLinkToken: project.inviteLinkToken,
        }}
      />
    </PageShell>
  );
}
