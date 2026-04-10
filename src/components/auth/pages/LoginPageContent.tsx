"use client";

import React from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/app/providers/AuthProvider";

export default function LoginPageContent() {
  const { signIn, loading, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [loading, user, router]);

  const handleLogin = async () => {
    await signIn();
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Sign in
        </Typography>

        <Typography color="text.secondary">
          Sign in to access the scouting dashboard and editing tools.
        </Typography>

        <Box>
          <Button variant="contained" onClick={handleLogin}>
            Sign in with Google
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
