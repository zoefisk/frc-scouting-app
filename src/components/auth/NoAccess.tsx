"use client";

import React from "react";
import Link from "next/link";
import { Alert, Button, Paper, Stack, Typography } from "@mui/material";

type Props = {
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  note?: string;
};

export default function NoAccess({
  title = "You do not have access to this page.",
  description = "Ask a project admin to add you before trying again.",
  ctaHref = "/scouting-projects",
  ctaLabel = "Back to Projects",
  note,
}: Props) {
  return (
    <Paper sx={{ p: 4, minHeight: 280, display: "grid", placeItems: "center" }}>
      <Stack spacing={2} sx={{ maxWidth: 480, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>

        <Typography color="text.secondary">{description}</Typography>

        {note ? <Alert severity="info">{note}</Alert> : null}

        <Stack direction="row" justifyContent="center">
          <Link href={ctaHref} style={{ textDecoration: "none" }}>
            <Button variant="contained">{ctaLabel}</Button>
          </Link>
        </Stack>
      </Stack>
    </Paper>
  );
}
