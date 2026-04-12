"use client";

import React from "react";
import { Button, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/app/providers/AuthProvider";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import { saveJoinedScoutingProject } from "@/lib/db/projects";
import type {
  ProjectAccessMode,
  ProjectDataMode,
  ProjectFormMode,
  ProjectStatus,
} from "@/lib/scouting-projects/types";
import { addJoinedProjectIdToUser } from "@/lib/firebase/client/users";
import { addScoutingProjectMemberClient } from "@/lib/firebase/client/projects";

type JoinableProjectSummary = {
  projectId: string;
  name: string;
  eventKey: string;
  year: number;
  status: ProjectStatus;
  accessMode: ProjectAccessMode;
  dataMode: ProjectDataMode;
  formMode: ProjectFormMode;
  inviteLinkToken: string;
};

type Props = {
  project: JoinableProjectSummary;
};

export default function JoinProjectPageClient({ project }: Props) {
  const router = useRouter();
  const toast = useToast();
  const { user, loading, signIn } = useAuth();
  const { effectiveOnline } = useSyncMode();

  const [isJoining, setIsJoining] = React.useState(false);

  const requiresAuth = project.accessMode === "authenticated";
  const needsSignIn = requiresAuth && !user;

  const handleJoin = async () => {
    if (!effectiveOnline) {
      toast.warning("Joining scouting projects is unavailable while offline.");
      return;
    }

    try {
      setIsJoining(true);

      if (needsSignIn) {
        await signIn();
        return;
      }

      await saveJoinedScoutingProject({
        projectId: project.projectId,
        name: project.name,
        eventKey: project.eventKey,
        year: project.year,
        status: project.status,
        accessMode: project.accessMode,
        dataMode: project.dataMode,
        formMode: project.formMode,
        inviteLinkToken: project.inviteLinkToken,
        joinedAt: new Date().toISOString(),
      });

      if (user) {
        await addScoutingProjectMemberClient(project.projectId, {
          uid: user.uid,
          role: "member",
        });
        await addJoinedProjectIdToUser(user.uid, project.projectId);
      }

      toast.success("Project added to this device.");
      router.push(`/scouting-projects/${project.projectId}`);
    } catch (error) {
      console.error("Failed to join project:", error);
      toast.error("Could not join project.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Paper sx={{ p: 4, minHeight: 320, display: "grid", placeItems: "center" }}>
      <Stack
        spacing={2.5}
        alignItems="center"
        textAlign="center"
        sx={{ maxWidth: 420 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {project.name}
        </Typography>

        <Typography color="text.secondary">
          Event: {project.eventKey} ({project.year})
        </Typography>

        <Typography color="text.secondary">
          This project uses {project.dataMode} scouting and {project.formMode}{" "}
          forms.
        </Typography>

        {!effectiveOnline ? (
          <Typography color="warning.main">
            Joining scouting projects is unavailable while offline.
          </Typography>
        ) : null}

        {requiresAuth && (
          <Typography color="text.secondary">
            This project requires authentication before joining.
          </Typography>
        )}

        <Button
          variant="contained"
          size="large"
          onClick={handleJoin}
          disabled={!effectiveOnline || loading || isJoining}
        >
          {loading
            ? "Loading..."
            : isJoining
              ? "Please wait..."
              : needsSignIn
                ? "Sign in to Join Project"
                : "Join Project"}
        </Button>
      </Stack>
    </Paper>
  );
}
