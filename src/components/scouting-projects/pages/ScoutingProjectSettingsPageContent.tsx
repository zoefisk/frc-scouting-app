"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import NoAccess from "@/components/auth/NoAccess";
import ArchivedProjectContent from "@/components/scouting-projects/ArchivedProjectContent";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { getCurrentUserIdToken } from "@/lib/firebase/client/auth";
import { updateScoutingProjectClient } from "@/lib/firebase/client/projects";
import { getUserProfile } from "@/lib/firebase/client/users";
import {
  removeJoinedScoutingProject,
  restoreArchivedScoutingProjectLocally,
  unpinScoutingProject,
} from "@/lib/db/projects";
import { useToast } from "@/lib/hooks/useToast";
import {
  getMatchCollectionModeDescription,
  getMatchCollectionModeLabel,
  getProjectMemberRole,
  hasMatchData,
  hasPitData,
  type MatchCollectionMode,
  type ProjectAllianceSelectorRole,
  type ProjectDataMode,
  type ProjectMemberRole,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  hasMatchScoutingData?: boolean;
  hasPitScoutingData?: boolean;
};

type MemberListItem = {
  uid: string;
  role: ProjectMemberRole;
  allianceSelectorRole: ProjectAllianceSelectorRole | null;
  displayName: string;
  email: string;
};

const ROLE_ORDER: Record<ProjectMemberRole, number> = {
  owner: 0,
  admin: 1,
  member: 2,
};

function getRoleChipColor(role: ProjectMemberRole) {
  if (role === "owner") return "warning";
  if (role === "admin") return "primary";
  return "default";
}

export default function ScoutingProjectSettingsPageContent({
  project,
  hasMatchScoutingData = false,
  hasPitScoutingData = false,
}: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const { effectiveOnline } = useSyncMode();
  const memberRole = getProjectMemberRole(project, user?.uid);
  const canManageProject = memberRole === "owner" || memberRole === "admin";
  const canReassignRoles = memberRole === "owner";
  const canDeleteProject = memberRole === "owner";
  const canChangeDataMode = memberRole === "owner";
  const [projectStatus, setProjectStatus] = React.useState(project.status);
  const [projectDataMode, setProjectDataMode] = React.useState(
    project.dataMode
  );
  const [projectMatchCollectionMode, setProjectMatchCollectionMode] =
    React.useState<MatchCollectionMode | null>(project.matchCollectionMode);
  const showsMatchBuilder = hasMatchData(projectDataMode);
  const showsPitBuilder = hasPitData(projectDataMode);
  const [allowMemberInvites, setAllowMemberInvites] = React.useState(
    project.allowMemberInvites
  );
  const [lockAllianceSelectorEditing, setLockAllianceSelectorEditing] =
    React.useState(project.lockAllianceSelectorEditing);
  const [isSavingStatus, setIsSavingStatus] = React.useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = React.useState(false);
  const [isDeletingProject, setIsDeletingProject] = React.useState(false);
  const [projectMembers, setProjectMembers] = React.useState(project.members);
  const [updatingMemberUid, setUpdatingMemberUid] = React.useState<
    string | null
  >(null);

  const visibleMembers = React.useMemo(() => {
    const members =
      project.accessMode === "authenticated"
        ? projectMembers
        : projectMembers.filter((member) => member.role !== "member");

    return [...members].sort((a, b) => {
      const roleOrder = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
      if (roleOrder !== 0) return roleOrder;
      return a.uid.localeCompare(b.uid);
    });
  }, [project.accessMode, projectMembers]);

  const [members, setMembers] = React.useState<MemberListItem[]>([]);
  const [loadingMembers, setLoadingMembers] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;

    async function loadMembers() {
      setLoadingMembers(true);

      try {
        const nextMembers = await Promise.all(
          visibleMembers.map(async (member) => {
            const profile = await getUserProfile(member.uid);

            return {
              uid: member.uid,
              role: member.role,
              allianceSelectorRole: member.allianceSelectorRole ?? null,
              displayName:
                profile?.displayName?.trim() || "Unknown team member",
              email: profile?.email?.trim() || "",
            };
          })
        );

        if (!cancelled) {
          setMembers(nextMembers);
        }
      } catch (error) {
        console.error("Failed to load project members:", error);

        if (!cancelled) {
          setMembers(
            visibleMembers.map((member) => ({
              uid: member.uid,
              role: member.role,
              allianceSelectorRole: member.allianceSelectorRole ?? null,
              displayName: "Unknown team member",
              email: "",
            }))
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingMembers(false);
        }
      }
    }

    void loadMembers();

    return () => {
      cancelled = true;
    };
  }, [visibleMembers]);

  React.useEffect(() => {
    setProjectStatus(project.status);
  }, [project.status]);

  React.useEffect(() => {
    setProjectDataMode(project.dataMode);
  }, [project.dataMode]);

  React.useEffect(() => {
    setProjectMatchCollectionMode(project.matchCollectionMode);
  }, [project.matchCollectionMode]);

  React.useEffect(() => {
    setAllowMemberInvites(project.allowMemberInvites);
  }, [project.allowMemberInvites]);

  React.useEffect(() => {
    setLockAllianceSelectorEditing(project.lockAllianceSelectorEditing);
  }, [project.lockAllianceSelectorEditing]);

  React.useEffect(() => {
    setProjectMembers(project.members);
  }, [project.members]);

  const handleAllowMemberInvitesChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.checked;
    const previousValue = allowMemberInvites;

    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    setAllowMemberInvites(nextValue);
    setIsSavingPermissions(true);

    try {
      await updateScoutingProjectClient(project.id, {
        allowMemberInvites: nextValue,
      });
      toast.success("Invite permissions updated.");
    } catch (error) {
      console.error("Failed to update invite permissions:", error);
      setAllowMemberInvites(previousValue);
      toast.error("Could not update invite permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleProjectStatusChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.value as ScoutingProjectDoc["status"];
    const previousValue = projectStatus;

    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    setProjectStatus(nextValue);
    setIsSavingStatus(true);

    try {
      await updateScoutingProjectClient(project.id, {
        status: nextValue,
      });
      toast.success("Project status updated.");
    } catch (error) {
      console.error("Failed to update project status:", error);
      setProjectStatus(previousValue);
      toast.error("Could not update project status.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleProjectDataModeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.value as ProjectDataMode;
    const previousValue = projectDataMode;

    if (!canChangeDataMode) {
      return;
    }

    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    const removesMatchData =
      hasMatchData(project.dataMode) &&
      !hasMatchData(nextValue) &&
      hasMatchScoutingData;
    const removesPitData =
      hasPitData(project.dataMode) &&
      !hasPitData(nextValue) &&
      hasPitScoutingData;

    if (removesMatchData || removesPitData) {
      const deletedKinds = [
        removesMatchData ? "match scouting entries" : null,
        removesPitData ? "pit scouting entries" : null,
      ]
        .filter(Boolean)
        .join(" and ");

      const firstConfirmed = window.confirm(
        `Changing this scouting mode will delete existing ${deletedKinds} that no longer fit this project. Do you want to continue?`
      );

      if (!firstConfirmed) {
        return;
      }

      const secondConfirmed = window.confirm(
        `Please confirm again: existing ${deletedKinds} will be permanently deleted.`
      );

      if (!secondConfirmed) {
        return;
      }
    }

    setProjectDataMode(nextValue);
    setIsSavingStatus(true);

    try {
      const idToken = await getCurrentUserIdToken();

      if (!idToken) {
        throw new Error("You must be signed in as the project owner.");
      }

      const response = await fetch(
        `/api/scouting-projects/${project.id}/data-mode`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            dataMode: nextValue,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error ?? "Could not update project scouting modes."
        );
      }

      toast.success("Project scouting modes updated.");
      router.refresh();
    } catch (error) {
      console.error("Failed to update project scouting modes:", error);
      setProjectDataMode(previousValue);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not update project scouting modes."
      );
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleAllianceSelectorLockChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.checked;
    const previousValue = lockAllianceSelectorEditing;

    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    setLockAllianceSelectorEditing(nextValue);
    setIsSavingPermissions(true);

    try {
      await updateScoutingProjectClient(project.id, {
        lockAllianceSelectorEditing: nextValue,
      });
      toast.success("Alliance selector permissions updated.");
    } catch (error) {
      console.error("Failed to update alliance selector lock:", error);
      setLockAllianceSelectorEditing(previousValue);
      toast.error("Could not update alliance selector permissions.");
    } finally {
      setIsSavingPermissions(false);
    }
  };

  const handleMatchCollectionModeChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.value as MatchCollectionMode;
    const previousValue = projectMatchCollectionMode;

    if (!canManageProject || hasMatchScoutingData) {
      return;
    }

    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    setProjectMatchCollectionMode(nextValue);
    setIsSavingStatus(true);

    try {
      await updateScoutingProjectClient(project.id, {
        matchCollectionMode: nextValue,
        ...(project.scoutingSchedule ? { scoutingSchedule: null } : {}),
      });
      toast.success("Match scouting mode updated.");
      router.refresh();
    } catch (error) {
      console.error("Failed to update match scouting mode:", error);
      setProjectMatchCollectionMode(previousValue);
      toast.error("Could not update match scouting mode.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleMemberRoleChange = async (
    uid: string,
    nextRole: Extract<ProjectMemberRole, "admin" | "member">
  ) => {
    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    const previousMembers = projectMembers;
    const nextMembers = previousMembers.map((member) =>
      member.uid === uid ? { ...member, role: nextRole } : member
    );

    setProjectMembers(nextMembers);
    setUpdatingMemberUid(uid);

    try {
      await updateScoutingProjectClient(project.id, {
        members: nextMembers,
      });
      toast.success("Member role updated.");
    } catch (error) {
      console.error("Failed to update member role:", error);
      setProjectMembers(previousMembers);
      toast.error("Could not update member role.");
    } finally {
      setUpdatingMemberUid(null);
    }
  };

  const handleAllianceSelectorRoleChange = async (
    uid: string,
    nextRole: ProjectAllianceSelectorRole | null
  ) => {
    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    const previousMembers = projectMembers;
    const nextMembers = previousMembers.map((member) =>
      member.uid === uid
        ? {
            ...member,
            allianceSelectorRole: nextRole,
          }
        : member
    );

    setProjectMembers(nextMembers);
    setUpdatingMemberUid(uid);

    try {
      await updateScoutingProjectClient(project.id, {
        members: nextMembers,
      });
      toast.success("Alliance selector role updated.");
    } catch (error) {
      console.error("Failed to update alliance selector role:", error);
      setProjectMembers(previousMembers);
      toast.error("Could not update alliance selector role.");
    } finally {
      setUpdatingMemberUid(null);
    }
  };

  const handleDeleteProject = async () => {
    if (!canDeleteProject || isDeletingProject) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${project.name}" and its associated scouting data? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    if (!effectiveOnline) {
      toast.warning("Project settings cannot be changed while offline.");
      return;
    }

    try {
      setIsDeletingProject(true);
      const idToken = await getCurrentUserIdToken();

      if (!idToken) {
        throw new Error("You must be signed in as the project owner.");
      }

      const response = await fetch(`/api/scouting-projects/${project.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error ?? "Could not delete scouting project.");
      }

      await Promise.all([
        removeJoinedScoutingProject(project.id),
        restoreArchivedScoutingProjectLocally(project.id),
        unpinScoutingProject(project.id),
      ]);

      toast.success("Scouting project deleted.");
      router.push("/scouting-projects");
      router.refresh();
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not delete scouting project."
      );
    } finally {
      setIsDeletingProject(false);
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
        title="Sign in to manage this project."
        description="Only project owners and admins can open project settings."
        ctaHref="/login"
        ctaLabel="Go to Login"
      />
    );
  }

  if (!canManageProject) {
    return (
      <NoAccess description="Only project owners and admins can open these settings." />
    );
  }

  if (!effectiveOnline) {
    return (
      <NoAccess
        title="Go online to manage this project."
        description="Project settings, membership changes, and questionnaire builder access are unavailable while offline."
        ctaHref={`/scouting-projects/${project.id}`}
        ctaLabel="Back to Project"
      />
    );
  }

  const content = (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {project.name} Settings
        </Typography>
        <Typography color="text.secondary">
          Review who can access this scouting project and what role each member
          has.
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Access Summary
          </Typography>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              label={`Access Mode: ${project.accessMode}`}
              color={
                project.accessMode === "authenticated" ? "primary" : "default"
              }
              size="small"
            />
            <Chip
              label={`Visible Members: ${visibleMembers.length}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Status: ${projectStatus}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={
                lockAllianceSelectorEditing
                  ? "Alliance Selector: locked"
                  : "Alliance Selector: open"
              }
              size="small"
              variant="outlined"
            />
          </Stack>

          <Alert severity="info">
            TODO: decide how account deletion should remove project membership,
            and what should happen before deleting an owner who is the only
            project owner.
          </Alert>

          <FormControlLabel
            control={
              <Checkbox
                checked={allowMemberInvites}
                onChange={handleAllowMemberInvitesChange}
                disabled={isSavingPermissions}
              />
            }
            label="Allow regular members to invite other members"
          />

          <Typography variant="body2" color="text.secondary">
            When this is off, only owners and admins will see the invite link
            button on the main project dashboard.
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={lockAllianceSelectorEditing}
                onChange={handleAllianceSelectorLockChange}
                disabled={isSavingPermissions}
              />
            }
            label="Lock alliance selector editing"
          />

          <Typography variant="body2" color="text.secondary">
            When this is on, only owners, admins, and members marked as student
            leaders can edit the alliance selector. Everyone else can still view
            and export it.
          </Typography>

          <TextField
            select
            size="small"
            label="Project Status"
            value={projectStatus}
            disabled={isSavingStatus}
            onChange={handleProjectStatusChange}
            sx={{ maxWidth: 220 }}
          >
            <MenuItem value="active">active</MenuItem>
            <MenuItem value="inactive">inactive</MenuItem>
          </TextField>

          <Typography variant="body2" color="text.secondary">
            Owners and admins can mark projects inactive when they should stay
            visible but are no longer in active use.
          </Typography>

          {canChangeDataMode ? (
            <>
              <TextField
                select
                size="small"
                label="Scouting Modes"
                value={projectDataMode}
                disabled={isSavingStatus}
                onChange={handleProjectDataModeChange}
                sx={{ maxWidth: 220 }}
              >
                <MenuItem value="match">match</MenuItem>
                <MenuItem value="pit">pit</MenuItem>
                <MenuItem value="both">both</MenuItem>
              </TextField>

              <Alert severity="warning">
                Changing which scouting modes are enabled can remove access to
                existing questionnaire setups for the disabled mode. Changes
                made to those questionnaires may be lost.
              </Alert>

              <Typography variant="body2" color="text.secondary">
                Only the project owner can change whether this project uses
                match scouting, pit scouting, or both.
              </Typography>
            </>
          ) : null}

          {showsMatchBuilder ? (
            <>
              <TextField
                select
                size="small"
                label="Match Scouting Mode"
                value={projectMatchCollectionMode ?? "robot"}
                disabled={
                  !canManageProject || hasMatchScoutingData || isSavingStatus
                }
                onChange={handleMatchCollectionModeChange}
                sx={{ maxWidth: 260 }}
                helperText={getMatchCollectionModeDescription(
                  projectMatchCollectionMode
                )}
              >
                <MenuItem value="robot">
                  {getMatchCollectionModeLabel("robot")}
                </MenuItem>
                <MenuItem value="alliance">
                  {getMatchCollectionModeLabel("alliance")}
                </MenuItem>
              </TextField>

              <Typography variant="body2" color="text.secondary">
                This controls how the scouting schedule is generated and how
                match scouting assignments are organized across the project.
              </Typography>

              {hasMatchScoutingData ? (
                <Alert severity="info">
                  Match scouting mode is locked because match scouting data has
                  already been collected for this project.
                </Alert>
              ) : project.scoutingSchedule ? (
                <Alert severity="warning">
                  Changing match scouting mode will clear the current scouting
                  schedule so it can be regenerated with the new assignment
                  layout.
                </Alert>
              ) : null}
            </>
          ) : null}
        </Stack>
      </Paper>

      {canReassignRoles ? (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Questionnaire Builders
            </Typography>

            <Typography color="text.secondary">
              Create and edit the custom match and pit scouting forms tied to
              this project.
            </Typography>

            {hasMatchScoutingData || hasPitScoutingData ? (
              <Alert severity="warning">
                Questionnaire builders are locked once a project already has
                saved scouting data for that form type.
              </Alert>
            ) : null}

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {showsMatchBuilder ? (
                <Link
                  href={`/scouting-projects/${project.id}/settings/match-scouting-builder`}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="contained" disabled={hasMatchScoutingData}>
                    Match Scouting Builder
                  </Button>
                </Link>
              ) : null}

              {showsPitBuilder ? (
                <Link
                  href={`/scouting-projects/${project.id}/settings/pit-scouting-builder`}
                  style={{ textDecoration: "none" }}
                >
                  <Button variant="outlined" disabled={hasPitScoutingData}>
                    Pit Scouting Builder
                  </Button>
                </Link>
              ) : null}
            </Stack>

            <Stack spacing={0.5}>
              {showsMatchBuilder ? (
                <Typography variant="body2" color="text.secondary">
                  Match scouting builder:{" "}
                  {hasMatchScoutingData
                    ? "Unavailable because this project already has match scouting data."
                    : "Available"}
                </Typography>
              ) : null}
              {showsPitBuilder ? (
                <Typography variant="body2" color="text.secondary">
                  Pit scouting builder:{" "}
                  {hasPitScoutingData
                    ? "Unavailable because this project already has pit scouting data."
                    : "Available"}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Members
          </Typography>

          <Typography color="text.secondary">
            {project.accessMode === "authenticated"
              ? "Authenticated projects show every member who can open the project."
              : "Anonymous projects still show the owner and admins who manage the project."}
          </Typography>

          {loadingMembers ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              {members.map((member) => (
                <Paper
                  key={member.uid}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2.5 }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Stack spacing={0.5}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {member.displayName}
                      </Typography>
                      <Typography color="text.secondary">
                        {member.email || "No email available"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                      >
                        {member.uid}
                      </Typography>
                    </Stack>

                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      alignItems={{ xs: "stretch", sm: "center" }}
                    >
                      {canReassignRoles && member.role !== "owner" ? (
                        <TextField
                          select
                          size="small"
                          label="Role"
                          value={member.role}
                          disabled={updatingMemberUid === member.uid}
                          onChange={(event) =>
                            void handleMemberRoleChange(
                              member.uid,
                              event.target.value as Extract<
                                ProjectMemberRole,
                                "admin" | "member"
                              >
                            )
                          }
                          sx={{ minWidth: 140 }}
                        >
                          <MenuItem value="member">member</MenuItem>
                          <MenuItem value="admin">admin</MenuItem>
                        </TextField>
                      ) : (
                        <Chip
                          label={member.role}
                          color={getRoleChipColor(member.role)}
                          size="small"
                        />
                      )}

                      {member.role === "owner" || member.role === "admin" ? (
                        <Chip
                          label="Alliance selector: included automatically"
                          size="small"
                          variant="outlined"
                        />
                      ) : (
                        <TextField
                          select
                          size="small"
                          label="Alliance selector"
                          value={member.allianceSelectorRole ?? "standard"}
                          disabled={updatingMemberUid === member.uid}
                          onChange={(event) =>
                            void handleAllianceSelectorRoleChange(
                              member.uid,
                              event.target.value === "student_leader"
                                ? "student_leader"
                                : null
                            )
                          }
                          sx={{ minWidth: 190 }}
                        >
                          <MenuItem value="standard">standard member</MenuItem>
                          <MenuItem value="student_leader">
                            student leader
                          </MenuItem>
                        </TextField>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Danger Zone
          </Typography>

          <Alert severity="warning">
            Deleting a scouting project also deletes its project questionnaires,
            match scouting data, pit scouting data, alliance selector data, and
            member project references.
          </Alert>

          {canDeleteProject ? (
            <Stack spacing={1}>
              <Button
                variant="outlined"
                color="error"
                onClick={() => void handleDeleteProject()}
                disabled={isDeletingProject}
                sx={{ alignSelf: "flex-start" }}
              >
                {isDeletingProject ? "Deleting..." : "Delete Scouting Project"}
              </Button>

              <Typography variant="body2" color="text.secondary">
                Only the project owner can permanently delete this project.
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Only the project owner can permanently delete this project.
            </Typography>
          )}
        </Stack>
      </Paper>

      <Box>
        <Link
          href={`/scouting-projects/${project.id}`}
          style={{ textDecoration: "none" }}
        >
          <Typography color="primary" sx={{ fontWeight: 600 }}>
            Back to Project
          </Typography>
        </Link>
      </Box>
    </Stack>
  );

  return project.status === "inactive" ? (
    <ArchivedProjectContent>{content}</ArchivedProjectContent>
  ) : (
    content
  );
}

// TODO -- add section to download CSVs for all match scouting, all pit scouting, all alliance selection, etc, all at once.
