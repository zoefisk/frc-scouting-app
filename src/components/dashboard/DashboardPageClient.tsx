"use client";

import React from "react";
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import DashboardSummaryCards from "@/components/dashboard/DashboardSummaryCards";
import CoverageWarningsCard from "@/components/dashboard/CoverageWarningsCard";
import MatchCoverageTable from "@/components/dashboard/MatchCoverageTable";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

import { useSyncMode } from "@/components/providers/SyncModeProvider";
import type { MatchCoverageWarning } from "@/lib/analysis/dashboard/buildCoverageWarnings";
import { getAppSetting, getScannedEntries, getSubmissions } from "../../lib/db";

const ALLIANCE_PICKER_EVENT_KEY = "alliancePickerEventKey";
const FALLBACK_EVENT_KEY = "2026cthar";

export default function DashboardPageClient() {
  const { effectiveOnline } = useSyncMode();

  const [eventKey, setEventKey] = React.useState<string>(FALLBACK_EVENT_KEY);
  const [currentMatch, setCurrentMatch] = React.useState<number | null>(null);
  const [warnings, setWarnings] = React.useState<MatchCoverageWarning[]>([]);

  const [pendingSubmissionCount, setPendingSubmissionCount] = React.useState(0);
  const [scannedEntryCount, setScannedEntryCount] = React.useState(0);

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const savedEventKey =
          (await getAppSetting<string | null>(ALLIANCE_PICKER_EVENT_KEY)) ??
          FALLBACK_EVENT_KEY;

        const resolvedEventKey =
          typeof savedEventKey === "string" && savedEventKey.trim() !== ""
            ? savedEventKey
            : FALLBACK_EVENT_KEY;

        setEventKey(resolvedEventKey);

        const [pendingSubmissions, scannedEntries, coverageRes] =
          await Promise.all([
            getSubmissions(),
            getScannedEntries(),
            fetch(`/api/dashboard/${resolvedEventKey}/coverage`),
          ]);

        setPendingSubmissionCount(pendingSubmissions.length);
        setScannedEntryCount(scannedEntries.length);

        if (!coverageRes.ok) {
          throw new Error("Could not load dashboard coverage.");
        }

        const coverageData = (await coverageRes.json()) as {
          eventKey: string;
          currentMatch: number | null;
          warnings: MatchCoverageWarning[];
        };

        setWarnings(coverageData.warnings);
        setCurrentMatch(coverageData.currentMatch);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError("Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Scouting Dashboard
        </Typography>
        <Typography color="text.secondary">
          Monitor coverage, sync state, and workflow status for {eventKey}.
        </Typography>
      </Box>

      {error && <Alert severity="warning">{error}</Alert>}

      <DashboardSummaryCards
        eventKey={eventKey}
        currentMatch={currentMatch}
        effectiveOnline={effectiveOnline}
        pendingSubmissionCount={pendingSubmissionCount}
        scannedEntryCount={scannedEntryCount}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <CoverageWarningsCard warnings={warnings} />
        </Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <DashboardQuickActions />
        </Grid>
      </Grid>

      <MatchCoverageTable warnings={warnings} />
    </Stack>
  );
}
