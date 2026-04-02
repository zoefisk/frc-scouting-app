"use client";

import React from "react";
import { CircularProgress, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { AppUserProfile } from "@/lib/firebase/shared/types";
import { getUserProfile } from "@/lib/firebase/client/users";

export default function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = React.useState<AppUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      const nextProfile = await getUserProfile(user.uid);
      setProfile(nextProfile);
      setProfileLoading(false);
    }

    if (!loading) {
      loadProfile();
    }
  }, [user, loading]);

  React.useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || profileLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!profile || !profile.active || profile.role !== "admin") {
    return (
      <Stack spacing={2} sx={{ py: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Unauthorized
        </Typography>
        <Typography color="text.secondary">
          You do not have permission to access this page.
        </Typography>
      </Stack>
    );
  }

  return <>{children}</>;
}
