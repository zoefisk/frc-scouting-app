"use client";

import React from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PlaylistAddRoundedIcon from "@mui/icons-material/PlaylistAddRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { useRouter } from "next/navigation";
import { ZodError } from "zod";

import NoAccess from "@/components/auth/NoAccess";
import UnsavedChangesGuard from "@/components/app/guards/UnsavedChangesGuard";
import JsonEditor from "@/components/common/JsonEditor";
import AllianceMatchSetupTable from "@/components/scouting/form/AllianceMatchSetupTable";
import QuestionnaireForm from "@/components/scouting/form/QuestionnaireForm";
import PerformanceRatingsCard from "@/components/scouting/form/PerformanceRatingsCard";
import EventField from "@/components/scouting/form/fields/match-info/EventField";
import MatchNumberField from "@/components/scouting/form/fields/match-info/MatchNumberField";
import RobotPositionField from "@/components/scouting/form/fields/match-info/RobotPositionField";
import ScoutingPositionField, {
  type ScoutingPosition,
} from "@/components/scouting/form/fields/match-info/ScoutingPositionField";
import TeamAutocompleteField from "@/components/scouting/form/fields/match-info/TeamAutocompleteField";
import QuestionnaireBuilderChatWidget from "@/components/scouting-projects/pages/QuestionnaireBuilderChatWidget";
import QuestionnaireSchemaReference from "@/components/scouting-projects/pages/QuestionnaireSchemaReference";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { getCurrentUserIdToken } from "@/lib/firebase/client/auth";
import { useToast } from "@/lib/hooks/useToast";
import { questionnaireSchema } from "@/lib/scouting/questionnaire/schema";
import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import type { TeamOption } from "@/lib/scouting/tba/loadEventTeams";
import type {
  ProjectQuestionnaireDoc,
  ProjectQuestionnaireKind,
} from "@/lib/scouting-projects/questionnaires/types";
import {
  getProjectMemberRole,
  type MatchCollectionMode,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

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

const PREVIEW_MATCH_TEAMS: TeamOption[] = [
  {
    key: "frc155",
    team_number: 155,
    nickname: "The TechnoNuts",
    name: "The TechnoNuts",
  },
  {
    key: "frc230",
    team_number: 230,
    nickname: "Gaelhawks",
    name: "Gaelhawks",
  },
  {
    key: "frc195",
    team_number: 195,
    nickname: "CyberKnights",
    name: "CyberKnights",
  },
];

function getKindLabel(kind: ProjectQuestionnaireKind) {
  return kind === "match" ? "Match Scouting" : "Pit Scouting";
}

function QuestionnairePreviewSetupCard({
  kind,
  project,
}: {
  kind: ProjectQuestionnaireKind;
  project: ScoutingProjectDoc & { id: string };
}) {
  const matchCollectionMode: MatchCollectionMode =
    project.matchCollectionMode ?? "robot";
  const previewScoutingPosition: ScoutingPosition =
    matchCollectionMode === "alliance" ? "redAlliance" : "red2";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {kind === "match" ? "Match Setup" : "Setup"}
          </Typography>

          {kind === "match" ? (
            <>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <EventField
                  value={project.eventKey}
                  onChange={() => {}}
                  disabled
                />
                <MatchNumberField value="12" onChange={() => {}} disabled />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <ScoutingPositionField
                  value={previewScoutingPosition}
                  onChange={() => {}}
                  mode={matchCollectionMode}
                  disabled
                />
                {matchCollectionMode === "robot" ? (
                  <RobotPositionField
                    value="center"
                    onChange={() => {}}
                    disabled
                  />
                ) : (
                  <div style={{ flex: 1 }} />
                )}
              </Stack>

              {matchCollectionMode === "robot" ? (
                <>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                    <TextField
                      select
                      label="Team Presence"
                      value="present"
                      fullWidth
                      size="small"
                      disabled
                    >
                      <MenuItem value="present">Present</MenuItem>
                      <MenuItem value="absent">Absent</MenuItem>
                      <MenuItem value="surrogate">Surrogate</MenuItem>
                    </TextField>

                    <div style={{ flex: 1 }} />
                  </Stack>

                  <TeamAutocompleteField
                    teams={PREVIEW_MATCH_TEAMS}
                    selectedTeamKey="frc155"
                    loading={false}
                    disabled
                    onChange={() => {}}
                  />
                </>
              ) : (
                <AllianceMatchSetupTable
                  allianceColor="red"
                  rows={[
                    {
                      slot: 1,
                      team: PREVIEW_MATCH_TEAMS[0] ?? null,
                      teamPresence: "present",
                      robotPosition: "left",
                    },
                    {
                      slot: 2,
                      team: PREVIEW_MATCH_TEAMS[1] ?? null,
                      teamPresence: "present",
                      robotPosition: "center",
                    },
                    {
                      slot: 3,
                      team: PREVIEW_MATCH_TEAMS[2] ?? null,
                      teamPresence: "present",
                      robotPosition: "right",
                    },
                  ]}
                  onPresenceChange={() => {}}
                  onRobotPositionChange={() => {}}
                />
              )}
            </>
          ) : (
            <>
              <TextField
                label="Event"
                value={project.eventKey}
                InputProps={{ readOnly: true }}
                helperText="Pit scouting is tied to this project's event."
              />

              <TeamAutocompleteField
                teams={PREVIEW_MATCH_TEAMS}
                selectedTeamKey="frc155"
                loading={false}
                disabled
                onChange={() => {}}
              />
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function buildPreviewDefinition({
  name,
  definitionText,
}: {
  name: string;
  definitionText: string;
}): QuestionnaireDefinition {
  let parsedDefinition: unknown;

  try {
    parsedDefinition = JSON.parse(definitionText);
  } catch (error) {
    throw new Error(formatValidationError(error, definitionText));
  }

  const normalizedDefinition =
    parsedDefinition && typeof parsedDefinition === "object"
      ? {
          ...(parsedDefinition as Record<string, unknown>),
          name: name.trim() || "Preview Questionnaire",
        }
      : parsedDefinition;

  try {
    return questionnaireSchema.parse(normalizedDefinition);
  } catch (error) {
    throw new Error(formatValidationError(error));
  }
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
  const [liveValidationError, setLiveValidationError] = React.useState<
    string | null
  >(null);
  const [previewDefinition, setPreviewDefinition] =
    React.useState<QuestionnaireDefinition | null>(
      editableQuestionnaire?.definition ?? null
    );
  const [previewAnswers, setPreviewAnswers] =
    React.useState<QuestionnaireAnswers>({});
  const [previewError, setPreviewError] = React.useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);

  React.useEffect(() => {
    setName(editableQuestionnaire?.name ?? "");
    setDefinitionText(
      editableQuestionnaire
        ? JSON.stringify(editableQuestionnaire.definition, null, 2)
        : ""
    );
    setSaveError(null);
    setLiveValidationError(null);
    setPreviewDefinition(editableQuestionnaire?.definition ?? null);
    setPreviewAnswers({});
    setPreviewError(null);
    setPreviewLoading(false);
  }, [editableQuestionnaire]);

  React.useEffect(() => {
    if (!editableQuestionnaire) {
      setLiveValidationError(null);
      return;
    }

    try {
      buildPreviewDefinition({ name, definitionText });
      setLiveValidationError(null);
    } catch (error) {
      setLiveValidationError(
        error instanceof Error
          ? error.message
          : "Questionnaire definition is invalid."
      );
    }
  }, [definitionText, editableQuestionnaire, name]);

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

  const handleRefreshPreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewError(null);

      await new Promise((resolve) => window.setTimeout(resolve, 350));

      const nextDefinition = buildPreviewDefinition({ name, definitionText });
      setPreviewDefinition(nextDefinition);
      setPreviewAnswers({});
    } catch (error) {
      console.error("Failed to refresh questionnaire preview:", error);
      setPreviewError(
        error instanceof Error
          ? error.message
          : "Could not refresh questionnaire preview."
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClearPreview = () => {
    setPreviewAnswers({});
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
                  {kind === "match"
                    ? `Copy the current built-in ${
                        (project.matchCollectionMode ?? "robot") === "alliance"
                          ? "alliance-mode"
                          : "robot-mode"
                      } ${getKindLabel(kind).toLowerCase()} form and customize it for this project.`
                    : `Copy the current built-in ${getKindLabel(kind).toLowerCase()} form and customize it for this project.`}
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
        <Stack spacing={2}>
          {/* Editor */}
          <Accordion
            disableGutters
            defaultExpanded
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px !important",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  JSON Editor
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Edit the active project questionnaire definition directly.
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Alert severity="info">
                  This builder currently edits the questionnaire definition as
                  JSON. It is owner-only and updates the active project
                  questionnaire directly.
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
                      <JsonEditor
                        value={definitionText}
                        onChange={setDefinitionText}
                        disabled={!effectiveOnline || isSaving}
                        showLineNumbers
                      />
                    </Box>

                    {liveValidationError ? (
                      <Alert severity="warning" sx={{ whiteSpace: "pre-line" }}>
                        {liveValidationError}
                      </Alert>
                    ) : (
                      <Alert severity="success">
                        Questionnaire definition is valid.
                      </Alert>
                    )}

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
            </AccordionDetails>
          </Accordion>

          {/* Schema reference */}
          <Box
            sx={{
              width: "100%",
            }}
          >
            <QuestionnaireSchemaReference defaultExpanded />
          </Box>

          <Accordion
            disableGutters
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "12px !important",
              boxShadow: "none",
              "&:before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
              <Stack spacing={0.25}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Questionnaire Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Preview how this questionnaire will render for scouts.
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Typography color="text.secondary" sx={{ mr: "auto" }}>
                    Refresh the preview manually to render the current JSON
                    definition.
                  </Typography>

                  <Button
                    variant="outlined"
                    onClick={() => void handleRefreshPreview()}
                    disabled={previewLoading}
                  >
                    {previewLoading ? "Refreshing..." : "Refresh Preview"}
                  </Button>
                </Stack>

                {previewError ? (
                  <Alert severity="error" sx={{ whiteSpace: "pre-line" }}>
                    {previewError}
                  </Alert>
                ) : null}

                {previewLoading ? (
                  <Stack spacing={2}>
                    <Skeleton variant="rounded" height={84} />
                    <Skeleton variant="rounded" height={190} />
                    <Skeleton variant="rounded" height={190} />
                  </Stack>
                ) : previewDefinition ? (
                  <Stack spacing={2}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2.5, borderRadius: 2.5 }}
                    >
                      <Stack spacing={0.75}>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {previewDefinition.name}
                        </Typography>
                        {previewDefinition.description ? (
                          <Typography color="text.secondary">
                            {previewDefinition.description}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Paper>

                    <QuestionnairePreviewSetupCard
                      kind={kind}
                      project={project}
                    />

                    <QuestionnaireForm
                      definition={previewDefinition}
                      answers={previewAnswers}
                      onAnswersChange={setPreviewAnswers}
                      onSubmit={async () => {}}
                      showSubmitButton={false}
                    />

                    <PerformanceRatingsCard
                      answers={{}}
                      locked
                      mode={
                        kind === "match"
                          ? (project.matchCollectionMode ?? "robot")
                          : "robot"
                      }
                      teams={
                        kind === "match" &&
                        (project.matchCollectionMode ?? "robot") === "alliance"
                          ? PREVIEW_MATCH_TEAMS
                          : [PREVIEW_MATCH_TEAMS[0]]
                      }
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="outlined"
                        onClick={handleClearPreview}
                        disabled={Object.keys(previewAnswers).length === 0}
                      >
                        Clear
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <Alert severity="info">
                    Refresh the preview to render the current questionnaire
                    definition.
                  </Alert>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      )}

      {editableQuestionnaire ? (
        <QuestionnaireBuilderChatWidget
          projectId={project.id}
          kind={kind}
          questionnaireName={name}
          definitionText={definitionText}
        />
      ) : null}
    </Stack>
  );
}
