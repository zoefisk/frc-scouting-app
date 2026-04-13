"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";

import NoAccess from "@/components/auth/NoAccess";
import UnsavedChangesGuard from "@/components/app/guards/UnsavedChangesGuard";
import QuestionnaireSchemaReference from "@/components/scouting-projects/pages/QuestionnaireSchemaReference";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
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

// ─── Line-number JSON editor ──────────────────────────────────────────────────

const LINE_HEIGHT = 20;
const V_PAD = 8;

function JsonEditorWithLineNumbers({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);

  const lineCount = Math.max(1, value.split("\n").length);
  const contentHeight = lineCount * LINE_HEIGHT + V_PAD * 2;
  const editorHeight = Math.min(620, Math.max(400, contentHeight));

  const syncScroll = React.useCallback(() => {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        height: editorHeight,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: `${LINE_HEIGHT}px`,
        transition: "height 0.1s ease",
        "&:focus-within": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -1,
        },
      }}
    >
      {/* Gutter */}
      <Box
        ref={gutterRef}
        aria-hidden
        sx={{
          flexShrink: 0,
          width: 44,
          overflowY: "hidden",
          bgcolor: "rgba(15,23,42,0.04)",
          borderRight: "1px solid",
          borderColor: "divider",
          pt: `${V_PAD}px`,
          pb: `${V_PAD}px`,
          pr: 1,
          textAlign: "right",
          userSelect: "none",
          color: "text.disabled",
          fontSize: 12,
          lineHeight: `${LINE_HEIGHT}px`,
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <div key={i}>{i + 1}</div>
        ))}
      </Box>

      {/* Textarea */}
      <Box
        component="textarea"
        ref={textareaRef}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(e.target.value)
        }
        onScroll={syncScroll}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        sx={{
          flex: 1,
          height: "100%",
          resize: "none",
          border: "none",
          outline: "none",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: `${LINE_HEIGHT}px`,
          p: `${V_PAD}px 12px`,
          overflowY: "auto",
          bgcolor: disabled ? "rgba(15,23,42,0.02)" : "background.paper",
          color: "text.primary",
        }}
      />
    </Box>
  );
}

// ─── Validation error formatting ─────────────────────────────────────────────

function formatValidationError(error: unknown, jsonText?: string): string {
  if (error instanceof SyntaxError && jsonText != null) {
    const posMatch = error.message.match(/position (\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const before = jsonText.slice(0, pos);
      const line = before.split("\n").length;
      const col = pos - before.lastIndexOf("\n");
      return `JSON syntax error on line ${line}, col ${col}: ${error.message}`;
    }
    return `JSON syntax error: ${error.message}`;
  }

  if (error instanceof ZodError) {
    const lines = error.issues.slice(0, 6).map((issue) => {
      const path = issue.path
        .map((p) => (typeof p === "number" ? `[${p}]` : p))
        .join(".")
        .replace(/\.\[/g, "[");
      return path ? `${path}: ${issue.message}` : issue.message;
    });
    if (error.issues.length > 6) {
      lines.push(`…and ${error.issues.length - 6} more issue(s)`);
    }
    return lines.join("\n");
  }

  return error instanceof Error ? error.message : "Unknown error.";
}

// ─── Component ────────────────────────────────────────────────────────────────

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
  const { effectiveOnline } = useSyncMode();
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

  const isDirty = React.useMemo(() => {
    if (!editableQuestionnaire) return false;
    const savedDef = JSON.stringify(editableQuestionnaire.definition, null, 2);
    return name !== editableQuestionnaire.name || definitionText !== savedDef;
  }, [editableQuestionnaire, name, definitionText]);

  const handleCreateTemplate = async (template: BuilderTemplate) => {
    if (!effectiveOnline) {
      toast.warning("Questionnaire changes are unavailable while offline.");
      return;
    }

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
    if (!editableQuestionnaire) return;

    if (!effectiveOnline) {
      setSaveError("Go online before editing project questionnaires.");
      toast.warning("Questionnaire changes are unavailable while offline.");
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
      } catch (err) {
        throw new Error(formatValidationError(err, definitionText));
      }

      let validatedDefinition: ReturnType<typeof questionnaireSchema.parse>;
      try {
        validatedDefinition = questionnaireSchema.parse(parsedDefinition);
      } catch (err) {
        throw new Error(formatValidationError(err));
      }

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

  if (!effectiveOnline) {
    return (
      <NoAccess
        title="Go online to edit questionnaires."
        description="Creating and editing scouting project questionnaires is unavailable while offline."
        ctaHref={`/scouting-projects/${project.id}/settings`}
        ctaLabel="Back to Settings"
      />
    );
  }

  const setupChips: { label: string; value: string }[] = [
    { label: "Event", value: `${project.eventKey} (${project.year})` },
    { label: "Data mode", value: project.dataMode },
    { label: "Form mode", value: project.formMode },
    { label: "Access", value: project.accessMode },
    ...(kind === "match" && project.matchCollectionMode
      ? [{ label: "Collection mode", value: project.matchCollectionMode }]
      : []),
  ];

  return (
    <Stack spacing={3}>
      <UnsavedChangesGuard when={isDirty} />

      {/* Header */}
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

      {/* Locked setup */}
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 2.5, bgcolor: "rgba(15,23,42,0.02)" }}
      >
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <LockOutlinedIcon
              fontSize="small"
              sx={{ color: "text.secondary", fontSize: 17 }}
            />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Locked project setup
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            These values were fixed when the project was created and cannot be
            changed from the questionnaire builder.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {setupChips.map((chip) => (
              <Chip
                key={chip.label}
                label={
                  <span>
                    <span style={{ opacity: 0.6, marginRight: 4 }}>
                      {chip.label}:
                    </span>
                    <strong>{chip.value}</strong>
                  </span>
                }
                size="small"
                variant="outlined"
                sx={{ fontFamily: "inherit", fontSize: 12.5 }}
              />
            ))}
          </Stack>
        </Stack>
      </Paper>

      {/* Template selector or editor + schema reference */}
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
                  disabled={!effectiveOnline || isCreating !== null}
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
                  disabled={!effectiveOnline || isCreating !== null}
                >
                  {isCreating === "scratch"
                    ? "Creating..."
                    : "Start From Scratch"}
                </Button>
              </Stack>
            </Paper>
          </Stack>

          <QuestionnaireSchemaReference />
        </Stack>
      ) : (
        <Stack
          direction={{ xs: "column", xl: "row" }}
          spacing={2}
          alignItems="flex-start"
        >
          {/* Editor */}
          <Stack flex={1} minWidth={0} spacing={2}>
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
                  onChange={(e) => setName(e.target.value)}
                  disabled={!effectiveOnline || isSaving}
                  fullWidth
                />

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5, ml: 0.25 }}
                  >
                    Questionnaire Definition (JSON)
                  </Typography>
                  <JsonEditorWithLineNumbers
                    value={definitionText}
                    onChange={setDefinitionText}
                    disabled={!effectiveOnline || isSaving}
                  />
                </Box>

                {saveError ? (
                  <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                    {saveError}
                  </Alert>
                ) : null}

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => void handleSave()}
                    disabled={!effectiveOnline || isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Questionnaire"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>

          {/* Schema reference — sidebar on xl, stacked below on smaller */}
          <Box
            sx={{
              width: { xs: "100%", xl: 420 },
              flexShrink: 0,
              position: { xl: "sticky" },
              top: { xl: 16 },
              maxHeight: { xl: "calc(100vh - 32px)" },
              overflowY: { xl: "auto" },
            }}
          >
            <QuestionnaireSchemaReference defaultExpanded />
          </Box>
        </Stack>
      )}
    </Stack>
  );
}
