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
import { useAuth } from "@/components/app/providers/AuthProvider";
import { getCurrentUserIdToken } from "@/lib/firebase/client/auth";
import { updateScoutingProjectClient } from "@/lib/firebase/client/projects";
import { getUserProfile } from "@/lib/firebase/client/users";
import {
  removeJoinedScoutingProject,
  unpinScoutingProject,
} from "@/lib/db/projects";
import { useToast } from "@/lib/hooks/useToast";
import {
  getProjectMemberRole,
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
  const memberRole = getProjectMemberRole(project, user?.uid);
  const canManageProject = memberRole === "owner" || memberRole === "admin";
  const canReassignRoles = memberRole === "owner";
  const canDeleteProject = memberRole === "owner";
  const [projectStatus, setProjectStatus] = React.useState(project.status);
  const [allowMemberInvites, setAllowMemberInvites] = React.useState(
    project.allowMemberInvites
  );
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
    setAllowMemberInvites(project.allowMemberInvites);
  }, [project.allowMemberInvites]);

  React.useEffect(() => {
    setProjectMembers(project.members);
  }, [project.members]);

  const handleAllowMemberInvitesChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const nextValue = event.target.checked;
    const previousValue = allowMemberInvites;

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

  const handleMemberRoleChange = async (
    uid: string,
    nextRole: Extract<ProjectMemberRole, "admin" | "member">
  ) => {
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

  return (
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
              <Link
                href={`/scouting-projects/${project.id}/settings/match-scouting-builder`}
                style={{ textDecoration: "none" }}
              >
                <Button variant="contained" disabled={hasMatchScoutingData}>
                  Match Scouting Builder
                </Button>
              </Link>

              <Link
                href={`/scouting-projects/${project.id}/settings/pit-scouting-builder`}
                style={{ textDecoration: "none" }}
              >
                <Button variant="outlined" disabled={hasPitScoutingData}>
                  Pit Scouting Builder
                </Button>
              </Link>
            </Stack>

            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Match scouting builder:{" "}
                {hasMatchScoutingData
                  ? "Unavailable because this project already has match scouting data."
                  : "Available"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pit scouting builder:{" "}
                {hasPitScoutingData
                  ? "Unavailable because this project already has pit scouting data."
                  : "Available"}
              </Typography>
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
            match scouting data, pit scouting data, and member project
            references. Alliance selector currently does not store a separate
            project document yet.
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
}

// TODO -- add section to download CSVs for all match scouting, all pit scouting, all alliance selection, etc, all at once.
