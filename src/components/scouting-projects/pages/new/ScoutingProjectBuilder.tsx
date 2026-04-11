"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/hooks/useToast";
import { useAuth } from "@/components/app/providers/AuthProvider";
import {
  createScoutingProjectInputSchema,
  type CreateScoutingProjectInput,
} from "@/lib/scouting-projects/validation";
import { getCurrentUserIdToken } from "@/lib/firebase/client/auth";
import CreateExampleProjectButton from "@/components/scouting-projects/CreateExampleProjectButton";
import ProjectBuilderTeamKeysField from "@/components/scouting-projects/pages/new/ProjectBuilderTeamKeysField";
import UnsavedChangesGuard from "@/components/app/guards/UnsavedChangesGuard";
import { loadEventTeamsForScouting } from "@/lib/scouting/match/setupData";
import type { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

type FormState = {
  name: string;
  eventKey: string;
  year: string;
  accessMode: CreateScoutingProjectInput["accessMode"];
  dataMode: CreateScoutingProjectInput["dataMode"];
  matchCollectionMode: CreateScoutingProjectInput["matchCollectionMode"];
  formMode: CreateScoutingProjectInput["formMode"];
};

type FieldErrors = Partial<Record<keyof FormState | "teamKeys", string>>;

const INITIAL_FORM_STATE: FormState = {
  name: "",
  eventKey: "",
  year: String(new Date().getFullYear()),
  accessMode: "authenticated",
  dataMode: "match",
  matchCollectionMode: "robot",
  formMode: "custom",
};

function buildInput(
  form: FormState,
  selectedTeams: TeamOption[]
): CreateScoutingProjectInput {
  const usesMatchData = form.dataMode === "match" || form.dataMode === "both";

  return {
    name: form.name.trim(),
    eventKey: form.eventKey.trim(),
    year: Number(form.year),
    teamKeys: selectedTeams.map((team) => team.key),
    accessMode: form.accessMode,
    dataMode: form.dataMode,
    matchCollectionMode: usesMatchData ? form.matchCollectionMode : null,
    formMode: form.formMode,
  };
}

function isDirty(form: FormState) {
  return JSON.stringify(form) !== JSON.stringify(INITIAL_FORM_STATE);
}

export default function ScoutingProjectBuilder() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();

  const [form, setForm] = React.useState<FormState>(INITIAL_FORM_STATE);
  const [availableTeams, setAvailableTeams] = React.useState<TeamOption[]>([]);
  const [selectedTeams, setSelectedTeams] = React.useState<TeamOption[]>([]);
  const [teamsLoading, setTeamsLoading] = React.useState(false);
  const [includeNonAttendingTeams, setIncludeNonAttendingTeams] =
    React.useState(false);
  const [manualTeamNumber, setManualTeamNumber] = React.useState("");
  const [manualTeamLoading, setManualTeamLoading] = React.useState(false);
  const [manualTeamError, setManualTeamError] = React.useState<string | null>(
    null
  );
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hasSaved, setHasSaved] = React.useState(false);

  const usesMatchData = form.dataMode === "match" || form.dataMode === "both";
  const showUnsavedChangesGuard =
    (isDirty(form) || selectedTeams.length > 0) && !hasSaved;

  const updateForm = React.useCallback(
    <K extends keyof FormState>(field: K, value: FormState[K]) => {
      setForm((current) => ({ ...current, [field]: value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
      setSubmitError(null);
      setManualTeamError(null);
      setHasSaved(false);
    },
    []
  );

  React.useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      const nextEventKey = form.eventKey.trim();

      if (!nextEventKey) {
        setAvailableTeams([]);
        setSelectedTeams([]);
        return;
      }

      try {
        setTeamsLoading(true);
        const result = await loadEventTeamsForScouting(nextEventKey);

        if (cancelled) {
          return;
        }

        setAvailableTeams(result.data);
        setSelectedTeams((current) =>
          current.filter((team) =>
            result.data.some((availableTeam) => availableTeam.key === team.key)
          )
        );
      } catch (error) {
        console.error("Failed to load event teams for project builder:", error);
        if (!cancelled) {
          setAvailableTeams([]);
          setSelectedTeams([]);
        }
      } finally {
        if (!cancelled) {
          setTeamsLoading(false);
        }
      }
    }

    void loadTeams();

    return () => {
      cancelled = true;
    };
  }, [form.eventKey]);

  const handleAddNonAttendingTeam = React.useCallback(async () => {
    const parsedTeamNumber = Number(manualTeamNumber.trim());

    if (!Number.isInteger(parsedTeamNumber) || parsedTeamNumber <= 0) {
      setManualTeamError("Enter a valid team number.");
      return;
    }

    try {
      setManualTeamLoading(true);
      setManualTeamError(null);

      const response = await fetch(`/api/tba/team/${parsedTeamNumber}`);
      const data = (await response.json()) as TeamOption | { error?: string };

      if (!response.ok || !("key" in data) || !data.key) {
        throw new Error(
          "error" in data && data.error
            ? data.error
            : "Could not load that team from TBA."
        );
      }

      setAvailableTeams((current) => {
        if (current.some((team) => team.key === data.key)) {
          return current;
        }
        return [...current, data].sort((a, b) => a.team_number - b.team_number);
      });

      setSelectedTeams((current) => {
        if (current.some((team) => team.key === data.key)) {
          return current;
        }
        return [...current, data];
      });

      setErrors((current) => ({ ...current, teamKeys: undefined }));
      setManualTeamNumber("");
      setHasSaved(false);
      toast.success(`Added team ${data.team_number}.`);
    } catch (error) {
      console.error("Failed to add non-attending team:", error);
      setManualTeamError("Could not find that team in TBA.");
    } finally {
      setManualTeamLoading(false);
    }
  }, [manualTeamNumber, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const parsed = createScoutingProjectInputSchema.safeParse(
        buildInput(form, selectedTeams)
      );

      if (!parsed.success) {
        const nextErrors: FieldErrors = {};

        for (const issue of parsed.error.issues) {
          const path = issue.path[0];
          if (path === "teamKeys") {
            nextErrors.teamKeys = issue.message;
          } else if (path === "year") {
            nextErrors.year = issue.message;
          } else if (path === "matchCollectionMode") {
            nextErrors.matchCollectionMode = issue.message;
          } else if (typeof path === "string" && path in form) {
            nextErrors[path as keyof FormState] = issue.message;
          }
        }

        setErrors(nextErrors);
        return;
      }

      const idToken = await getCurrentUserIdToken();

      if (!user || !idToken) {
        setSubmitError("You must be signed in to create a scouting project.");
        return;
      }

      const response = await fetch("/api/scouting-projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok || !data?.projectId) {
        throw new Error(data?.error ?? "Failed to create scouting project.");
      }

      setHasSaved(true);
      toast.success("Scouting project created.");
      router.push(`/scouting-projects/${data.projectId}`);
    } catch (error) {
      console.error("Failed to create scouting project:", error);
      setSubmitError("Could not create scouting project.");
      toast.error("Could not create scouting project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack spacing={3}>
      <UnsavedChangesGuard when={showUnsavedChangesGuard} />

      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Create a New Scouting Project
        </Typography>

        <Typography color="text.secondary">
          Set up the event, decide how scouting data should be collected, and
          create the project workspace your team will use.
        </Typography>
      </Box>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          backgroundColor: "white",
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Project Details
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Project Name"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                error={Boolean(errors.name)}
                helperText={errors.name}
              />

              <TextField
                fullWidth
                label="Event Key"
                value={form.eventKey}
                onChange={(event) => {
                  updateForm("eventKey", event.target.value);
                  setSelectedTeams([]);
                }}
                error={Boolean(errors.eventKey)}
                helperText={errors.eventKey ?? "Example: 2026cthar"}
              />

              <TextField
                label="Year"
                value={form.year}
                onChange={(event) => updateForm("year", event.target.value)}
                error={Boolean(errors.year)}
                helperText={errors.year}
                sx={{ minWidth: { md: 160 } }}
              />
            </Stack>

            <ProjectBuilderTeamKeysField
              teams={availableTeams}
              value={selectedTeams}
              loading={teamsLoading}
              disabled={!form.eventKey.trim()}
              error={errors.teamKeys}
              onChange={(value) => {
                setSelectedTeams(value);
                setErrors((current) => ({ ...current, teamKeys: undefined }));
                setHasSaved(false);
              }}
            />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={includeNonAttendingTeams}
                    onChange={(event) => {
                      setIncludeNonAttendingTeams(event.target.checked);
                      setManualTeamError(null);
                    }}
                  />
                }
                label="My team is scouting this event, but not participating in it"
              />

              {includeNonAttendingTeams && (
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1.5}
                  sx={{ mt: 1.25, maxWidth: 560 }}
                >
                  <TextField
                    label="Add Team by Number"
                    value={manualTeamNumber}
                    onChange={(event) =>
                      setManualTeamNumber(event.target.value)
                    }
                    error={Boolean(manualTeamError)}
                    helperText={
                      manualTeamError ??
                      "Fetch one extra team from TBA without loading the full team list."
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleAddNonAttendingTeam();
                      }
                    }}
                  />

                  <Box sx={{ pt: { sm: 0.5 } }}>
                    <Button
                      variant="outlined"
                      onClick={() => void handleAddNonAttendingTeam()}
                      disabled={manualTeamLoading || !manualTeamNumber.trim()}
                    >
                      {manualTeamLoading ? "Adding..." : "Add Team"}
                    </Button>
                  </Box>
                </Stack>
              )}
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Scouting Setup
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Access Mode"
                value={form.accessMode}
                onChange={(event) =>
                  updateForm(
                    "accessMode",
                    event.target.value as FormState["accessMode"]
                  )
                }
              >
                <MenuItem value="authenticated">Authenticated</MenuItem>
                <MenuItem value="anonymous">Anonymous</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Data Mode"
                value={form.dataMode}
                onChange={(event) =>
                  updateForm(
                    "dataMode",
                    event.target.value as FormState["dataMode"]
                  )
                }
              >
                <MenuItem value="match">Match</MenuItem>
                <MenuItem value="pit">Pit</MenuItem>
                <MenuItem value="both">Both</MenuItem>
              </TextField>

              <TextField
                select
                fullWidth
                label="Form Mode"
                value={form.formMode}
                onChange={(event) =>
                  updateForm(
                    "formMode",
                    event.target.value as FormState["formMode"]
                  )
                }
              >
                <MenuItem value="custom">Custom</MenuItem>
                <MenuItem value="default">Default</MenuItem>
              </TextField>
            </Stack>

            {usesMatchData && (
              <TextField
                select
                fullWidth
                label="Match Collection Mode"
                value={form.matchCollectionMode ?? ""}
                onChange={(event) =>
                  updateForm(
                    "matchCollectionMode",
                    event.target.value as FormState["matchCollectionMode"]
                  )
                }
                error={Boolean(errors.matchCollectionMode)}
                helperText={
                  errors.matchCollectionMode ??
                  "Choose whether scouts collect one robot or a whole alliance."
                }
              >
                <MenuItem value="robot">Robot</MenuItem>
                <MenuItem value="alliance">Alliance</MenuItem>
              </TextField>
            )}
          </Stack>

          {submitError && <Alert severity="error">{submitError}</Alert>}

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Link href="/scouting-projects" style={{ textDecoration: "none" }}>
              <Button variant="text">Cancel</Button>
            </Link>

            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Scouting Project"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          border: "1px solid rgba(15,23,42,0.08)",
          borderRadius: 4,
          p: { xs: 2.5, md: 3 },
          backgroundColor: "white",
        }}
      >
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Developer Shortcut
          </Typography>

          <Typography color="text.secondary">
            Create a seeded example project for quick testing.
          </Typography>

          <Box>
            <CreateExampleProjectButton />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
