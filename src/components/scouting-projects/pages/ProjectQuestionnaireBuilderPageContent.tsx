"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { useRouter } from "next/navigation";

import NoAccess from "@/components/auth/NoAccess";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { getCurrentUserIdToken } from "@/lib/firebase/client/auth";
import { useToast } from "@/lib/hooks/useToast";
import { questionnaireSchema } from "@/lib/scouting/questionnaire/schema";
import type {
  ProjectQuestionnaireDoc,
  ProjectQuestionnaireKind,
} from "@/lib/scouting-projects/questionnaires/types";
import {
  getProjectMemberRole,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  kind: ProjectQuestionnaireKind;
  activeQuestionnaireId?: string | null;
  editableQuestionnaire?: (ProjectQuestionnaireDoc & { id: string }) | null;
};

type BuilderTemplate = "default" | "scratch";

function getKindLabel(kind: ProjectQuestionnaireKind) {
  return kind === "match" ? "Match Scouting" : "Pit Scouting";
}

export default function ProjectQuestionnaireBuilderPageContent({
  project,
  kind,
  activeQuestionnaireId,
  editableQuestionnaire = null,
}: Props) {
  const { user, loading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const memberRole = getProjectMemberRole(project, user?.uid);
  const canManage = memberRole === "owner";

  const [isCreating, setIsCreating] = React.useState<BuilderTemplate | null>(
    null
  );
  const [name, setName] = React.useState(editableQuestionnaire?.name ?? "");
  const [definitionText, setDefinitionText] = React.useState(() =>
    editableQuestionnaire
      ? JSON.stringify(editableQuestionnaire.definition, null, 2)
      : ""
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setName(editableQuestionnaire?.name ?? "");
    setDefinitionText(
      editableQuestionnaire
        ? JSON.stringify(editableQuestionnaire.definition, null, 2)
        : ""
    );
    setSaveError(null);
  }, [editableQuestionnaire]);

  const handleCreateTemplate = async (template: BuilderTemplate) => {
    try {
      setIsCreating(template);
      const idToken = await getCurrentUserIdToken();

      if (!idToken) {
        throw new Error("You must be signed in as the project owner.");
      }

      const response = await fetch(
        `/api/scouting-projects/${project.id}/questionnaires`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ kind, template }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Could not create questionnaire.");
      }

      toast.success(
        template === "default"
          ? "Started from the default template."
          : "Started a blank questionnaire."
      );
      router.refresh();
    } catch (error) {
      console.error("Failed to create questionnaire template:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not create questionnaire."
      );
    } finally {
      setIsCreating(null);
    }
  };

  const handleSave = async () => {
    if (!editableQuestionnaire) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const idToken = await getCurrentUserIdToken();

      if (!idToken) {
        throw new Error("You must be signed in as the project owner.");
      }

      let parsedDefinition: unknown;

      try {
        parsedDefinition = JSON.parse(definitionText);
      } catch {
        throw new Error("Questionnaire JSON is not valid.");
      }

      const validatedDefinition = questionnaireSchema.parse(parsedDefinition);

      const response = await fetch(
        `/api/scouting-projects/${project.id}/questionnaires/${editableQuestionnaire.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            definition: validatedDefinition,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Could not save questionnaire.");
      }

      toast.success("Questionnaire saved.");
      router.refresh();
    } catch (error) {
      console.error("Failed to save questionnaire:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Could not save questionnaire.";
      setSaveError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!user) {
    return (
      <NoAccess
        title="Sign in to manage project questionnaires."
        description="Only the project owner can build match and pit scouting forms."
        ctaHref="/login"
        ctaLabel="Go to Login"
      />
    );
  }

  if (!canManage) {
    return (
      <NoAccess description="Only the project owner can open the questionnaire builder pages." />
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Link
          href={`/scouting-projects/${project.id}/settings`}
          style={{ textDecoration: "none", width: "fit-content" }}
        >
          <Button startIcon={<ArrowBackRoundedIcon />}>Back to Settings</Button>
        </Link>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {project.name} {getKindLabel(kind)} Builder
          </Typography>
          <Typography color="text.secondary">
            Build the questionnaire this project uses for{" "}
            {kind === "match" ? "match scouting" : "pit scouting"}.
          </Typography>
        </Box>
      </Stack>

      {!editableQuestionnaire ? (
        <Stack spacing={2}>
          <Alert severity="info">
            {activeQuestionnaireId
              ? "This project is still using the default built-in questionnaire. Choose how you want to start your custom version."
              : "No questionnaire is set up yet for this project. Choose how you want to start."}
          </Alert>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Paper sx={{ p: 3, flex: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <UploadFileRoundedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Start From Default Template
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  Copy the current built-in {getKindLabel(kind).toLowerCase()}{" "}
                  form and customize it for this project.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => void handleCreateTemplate("default")}
                  disabled={isCreating !== null}
                >
                  {isCreating === "default"
                    ? "Creating..."
                    : "Use Default Template"}
                </Button>
              </Stack>
            </Paper>

            <Paper sx={{ p: 3, flex: 1 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlaylistAddRoundedIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Start From Scratch
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  Start with an empty questionnaire definition and build every
                  section yourself.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => void handleCreateTemplate("scratch")}
                  disabled={isCreating !== null}
                >
                  {isCreating === "scratch"
                    ? "Creating..."
                    : "Start From Scratch"}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      ) : (
        <Stack spacing={2}>
          <Alert severity="info">
            This builder currently edits the questionnaire definition as JSON.
            It is owner-only and updates the active project questionnaire
            directly.
          </Alert>

          <Paper sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="Questionnaire Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                fullWidth
              />

              <TextField
                label="Questionnaire Definition (JSON)"
                value={definitionText}
                onChange={(event) => setDefinitionText(event.target.value)}
                multiline
                minRows={20}
                fullWidth
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                    fontSize: 13,
                  },
                }}
              />

              {saveError ? <Alert severity="error">{saveError}</Alert> : null}

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => void handleSave()}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Questionnaire"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      )}
    </Stack>
  );
}
