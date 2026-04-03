"use client";

import React from "react";
import { Button, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";

const exampleProjectPayload = {
  name: "Example NE District Project",
  eventKey: "2026cthar",
  year: 2026,
  teamKeys: ["frc190", "frc195", "frc2370", "frc4909"],
  accessMode: "authenticated" as const,
  dataMode: "both" as const,
  matchCollectionMode: "alliance" as const,
  formMode: "default" as const,
};

export default function SeedExampleProjectButton() {
  const router = useRouter();
  const toast = useToast();
  const [isCreating, setIsCreating] = React.useState(false);

  const handleCreate = async () => {
    try {
      setIsCreating(true);

      const res = await fetch("/api/scouting-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exampleProjectPayload),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        projectId?: string;
      };

      if (!res.ok || !data.projectId) {
        throw new Error(
          data.error ?? "Failed to create example scouting project."
        );
      }

      toast.success("Example scouting project created.");
      router.push(`/scouting-projects/${data.projectId}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to create example scouting project."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Stack spacing={1.5} sx={{ mt: 3 }}>
      <Typography color="text.secondary">
        Temporary developer helper to seed one example scouting project.
      </Typography>

      <Button variant="contained" onClick={handleCreate} disabled={isCreating}>
        {isCreating ? "Creating Example Project..." : "Create Example Project"}
      </Button>
    </Stack>
  );
}
