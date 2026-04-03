"use client";

import { useState } from "react";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";

export default function CreateExampleProjectButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const handleClick = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/dev/create-example-project", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.projectId || !data?.questionnaireId) {
        throw new Error("Project or questionnaire creation failed");
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
