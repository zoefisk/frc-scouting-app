"use client";

import React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import CloudDownloadOutlinedIcon from "@mui/icons-material/CloudDownloadOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";

import type { ScoutingProjectDoc } from "@/lib/scouting-projects/types";
import { useSyncMode } from "@/components/app/providers/SyncModeProvider";
import { useToast } from "@/lib/hooks/useToast";
import {
  getOfflineProjectBundleRecord,
  getProjectOfflineAutoRefresh,
  setProjectOfflineAutoRefresh,
  removeOfflineProjectBundleRecord,
  type OfflineProjectBundleRecord,
} from "@/lib/db/offlineProjects";
import {
  getOfflineEvents,
  removeOfflineEvent,
  type OfflineEventRecord,
} from "@/lib/db";
import { downloadProjectBundle } from "@/lib/offline/downloadProjectBundle";

type Props = {
  project: ScoutingProjectDoc & { id: string };
};

function CacheSummaryCard({
  title,
  description,
  cached,
  meta,
  onCache,
  onRemove,
  busy,
  cacheDisabled,
}: {
  title: string;
  description: string;
  cached: boolean;
  meta: string[];
  onCache: () => void;
  onRemove: () => void;
  busy: boolean;
  cacheDisabled?: boolean;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            spacing={1}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Stack>
            <Chip
              color={cached ? "success" : "default"}
              label={cached ? "Cached" : "Not cached"}
            />
          </Stack>

          {meta.length > 0 ? (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {meta.map((item) => (
                <Chip key={item} size="small" label={item} />
              ))}
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<CloudDownloadOutlinedIcon />}
              onClick={onCache}
              disabled={busy || cacheDisabled}
            >
              {busy ? "Caching..." : cached ? "Refresh Cache" : "Cache Now"}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteOutlineOutlinedIcon />}
              onClick={onRemove}
              disabled={busy || !cached}
            >
              Remove
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ProjectOfflineCachingPageContent({ project }: Props) {
  const toast = useToast();
  const { effectiveOnline } = useSyncMode();

  const [offlineEvent, setOfflineEvent] =
    React.useState<OfflineEventRecord | null>(null);
  const [offlineProject, setOfflineProject] =
    React.useState<OfflineProjectBundleRecord | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabledState] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isCaching, setIsCaching] = React.useState(false);
  const [isRemovingEvent, setIsRemovingEvent] = React.useState(false);
  const [isRemovingProject, setIsRemovingProject] = React.useState(false);

  const loadCachedState = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const [savedEvents, savedProjectBundle, savedAutoRefresh] =
        await Promise.all([
          getOfflineEvents<OfflineEventRecord[]>(),
          getOfflineProjectBundleRecord(project.id),
          getProjectOfflineAutoRefresh(project.id),
        ]);

      setOfflineEvent(
        savedEvents.find((event) => event.eventKey === project.eventKey) ?? null
      );
      setOfflineProject(savedProjectBundle ?? null);
      setAutoRefreshEnabledState(savedAutoRefresh);
    } catch (error) {
      console.error("Failed to load offline project cache state:", error);
    } finally {
      setIsLoading(false);
    }
  }, [project.eventKey, project.id]);

  React.useEffect(() => {
    void loadCachedState();
  }, [loadCachedState]);

  const handleCacheAll = React.useCallback(async () => {
    if (!effectiveOnline) {
      toast.warning("Go online before refreshing this offline cache.");
      return;
    }

    try {
      setIsCaching(true);
      await downloadProjectBundle(project.id);
      await loadCachedState();
      toast.success("Cached event and project data for offline use.");
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not cache this scouting project."
      );
    } finally {
      setIsCaching(false);
    }
  }, [effectiveOnline, loadCachedState, project.id, toast]);

  const handleRemoveEvent = React.useCallback(async () => {
    try {
      setIsRemovingEvent(true);
      await removeOfflineEvent(project.eventKey);
      await loadCachedState();
      toast.success("Removed cached event data.");
    } catch (error) {
      console.error(error);
      toast.error("Could not remove cached event data.");
    } finally {
      setIsRemovingEvent(false);
    }
  }, [loadCachedState, project.eventKey, toast]);

  const handleRemoveProject = React.useCallback(async () => {
    try {
      setIsRemovingProject(true);
      await removeOfflineProjectBundleRecord(project.id);
      await loadCachedState();
      toast.success("Removed cached project data.");
    } catch (error) {
      console.error(error);
      toast.error("Could not remove cached project data.");
    } finally {
      setIsRemovingProject(false);
    }
  }, [loadCachedState, project.id, toast]);

  const handleToggleAutoRefresh = React.useCallback(
    async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setAutoRefreshEnabledState(checked);

      try {
        await setProjectOfflineAutoRefresh(project.id, checked);
      } catch (error) {
        console.error(error);
        setAutoRefreshEnabledState(!checked);
        toast.error("Could not update the auto-refresh setting.");
      }
    },
    [project.id, toast]
  );

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Offline Caching
        </Typography>
        <Typography color="text.secondary">
          Cache this project&apos;s event bundle from TBA and the project&apos;s
          configuration so the key scouting pages are ready when connectivity is
          limited.
        </Typography>
      </Stack>

      {!effectiveOnline ? (
        <Alert severity="info">
          You are currently offline. Existing cached data will still be
          available, but refreshing the cache requires an internet connection.
        </Alert>
      ) : null}

      <Alert severity="info">
        Match submissions, pit submissions, import queue items, and in-progress
        scouting drafts are already stored locally by the app. This page is for
        event and project setup data.
      </Alert>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={1.5}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={1.5}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Automatic Refresh
                </Typography>
                <Typography color="text.secondary">
                  When enabled, this project&apos;s offline cache refreshes each
                  time you visit a scouting-project page while online.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefreshEnabled}
                    onChange={handleToggleAutoRefresh}
                  />
                }
                label={
                  autoRefreshEnabled ? "Auto-refresh on" : "Auto-refresh off"
                }
                sx={{ mr: 0 }}
              />
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={project.eventKey} />
              <Chip label={String(project.year)} />
              <Chip label={project.dataMode} />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<CloudDownloadOutlinedIcon />}
                onClick={() => void handleCacheAll()}
                disabled={!effectiveOnline || isCaching}
              >
                {isCaching ? "Caching..." : "Cache Event + Project"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2}>
        <CacheSummaryCard
          title="Event Data from TBA"
          description="Teams, match schedule, and rankings for this event."
          cached={Boolean(offlineEvent)}
          meta={
            offlineEvent
              ? [
                  offlineEvent.eventKey,
                  `Updated ${new Date(offlineEvent.lastUpdatedAt).toLocaleString()}`,
                ]
              : [project.eventKey]
          }
          onCache={() => void handleCacheAll()}
          onRemove={() => void handleRemoveEvent()}
          busy={isCaching || isRemovingEvent}
          cacheDisabled={!effectiveOnline}
        />

        <CacheSummaryCard
          title="Project Data"
          description="Project settings, membership, scouting schedule, and custom questionnaires."
          cached={Boolean(offlineProject)}
          meta={
            offlineProject
              ? [
                  `${offlineProject.questionnaireCount} questionnaire${offlineProject.questionnaireCount === 1 ? "" : "s"}`,
                  `Updated ${new Date(offlineProject.lastUpdatedAt).toLocaleString()}`,
                ]
              : ["Not cached yet"]
          }
          onCache={() => void handleCacheAll()}
          onRemove={() => void handleRemoveProject()}
          busy={isCaching || isRemovingProject}
          cacheDisabled={!effectiveOnline}
        />
      </Stack>

      {isLoading ? (
        <Typography color="text.secondary">
          Loading offline cache status...
        </Typography>
      ) : null}
    </Stack>
  );
}
