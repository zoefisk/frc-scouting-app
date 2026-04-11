"use client";

import React from "react";
import Link from "next/link";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import NoAccess from "@/components/auth/NoAccess";
import { useAuth } from "@/components/app/providers/AuthProvider";
import { getUserProfile } from "@/lib/firebase/client/users";
import {
  getProjectMemberRole,
  type ProjectMemberRole,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type Props = {
  project: ScoutingProjectDoc & { id: string };
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

export default function ScoutingProjectSettingsPageContent({ project }: Props) {
  const { user, loading } = useAuth();
  const memberRole = getProjectMemberRole(project, user?.uid);
  const canManageProject = memberRole === "owner" || memberRole === "admin";

  const visibleMembers = React.useMemo(() => {
    const members =
      project.accessMode === "authenticated"
        ? project.members
        : project.members.filter((member) => member.role !== "member");

    return [...members].sort((a, b) => {
      const roleOrder = ROLE_ORDER[a.role] - ROLE_ORDER[b.role];
      if (roleOrder !== 0) return roleOrder;
      return a.uid.localeCompare(b.uid);
    });
  }, [project.accessMode, project.members]);

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
          </Stack>

          <Alert severity="info">
            TODO: decide how account deletion should remove project membership,
            and what should happen before deleting an owner who is the only
            project owner.
          </Alert>
        </Stack>
      </Paper>

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

                    <Chip
                      label={member.role}
                      color={getRoleChipColor(member.role)}
                      size="small"
                    />
                  </Stack>
                </Paper>
              ))}
            </Stack>
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
