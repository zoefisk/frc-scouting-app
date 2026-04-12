"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { getScoutingProjectClient } from "@/lib/firebase/client/projects";
import { addJoinedProjectIdToUser } from "@/lib/firebase/client/users";
import { saveJoinedScoutingProject } from "@/lib/db/projects";
import {
  getCurrentUserIdToken,
  signInWithGoogle,
} from "@/lib/firebase/client/auth";

export default function CreateExampleProjectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const handleClick = async () => {
    try {
      setLoading(true);

      let idToken = await getCurrentUserIdToken();

      if (!idToken) {
        await signInWithGoogle();
        idToken = await getCurrentUserIdToken();
      }

      if (!idToken) {
        throw new Error("You must be signed in to create an example project.");
      }

      const res = await fetch("/api/dev/create-example-project", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.projectId || !data?.questionnaireId) {
        throw new Error("Project or questionnaire creation failed");
      }

      const project = await getScoutingProjectClient(data.projectId);

      if (project) {
        await saveJoinedScoutingProject({
          projectId: project.id,
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
      }

      if (user) {
        await addJoinedProjectIdToUser(user.uid, data.projectId);
      }

      toast.success("Example project created");
      router.push(`/scouting-projects/${data.projectId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create example project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="contained" onClick={handleClick} disabled={loading}>
      {loading ? "Creating..." : "Create Example Project"}
    </Button>
  );
}
