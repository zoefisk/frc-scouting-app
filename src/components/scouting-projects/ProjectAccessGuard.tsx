"use client";

import React from "react";
import { CircularProgress, Stack } from "@mui/material";

import NoAccess from "@/components/auth/NoAccess";
import { useAuth } from "@/components/app/providers/AuthProvider";
import ArchivedProjectContent from "@/components/scouting-projects/ArchivedProjectContent";
import {
  getProjectMemberRole,
  type ScoutingProjectDoc,
} from "@/lib/scouting-projects/types";

type Props = {
  project: ScoutingProjectDoc & { id: string };
  children: React.ReactNode;
};

export default function ProjectAccessGuard({ project, children }: Props) {
  const { user, loading } = useAuth();
  const requiresAuth = project.accessMode === "authenticated";
  const memberRole = getProjectMemberRole(project, user?.uid);

  if (requiresAuth && loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (requiresAuth && !user) {
    return (
      <NoAccess
        title="Sign in to view this project."
        description="This scouting project is limited to approved members."
        ctaHref="/login"
        ctaLabel="Go to Login"
      />
    );
  }

  if (requiresAuth && !memberRole) {
    return (
      <NoAccess note="If you should have access, ask an owner or admin to add your account to this project." />
    );
  }

  if (project.status === "inactive") {
    return <ArchivedProjectContent>{children}</ArchivedProjectContent>;
  }

  return <>{children}</>;
}
