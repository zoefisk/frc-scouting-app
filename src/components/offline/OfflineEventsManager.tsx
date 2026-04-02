"use client";

import React from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  getOfflineEvents,
  removeOfflineEvent,
  saveYearEvents,
  type OfflineEventRecord,
} from "@/old-lib/db";
import { useSyncMode } from "@/components/providers/SyncModeProvider";
import { downloadEventBundle } from "@/old-lib/offline/downloadEventBundle";
import { useToast } from "@/old-lib/hooks/useToast";

type EventOption = {
  key: string;
  name: string;
};

export default function OfflineEventsManager() {
  const toast = useToast();
  const { effectiveOnline } = useSyncMode();

  const [year, setYear] = React.useState("2026");
  const [events, setEvents] = React.useState<EventOption[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<EventOption | null>(
    null
  );
  const [downloadedEvents, setDownloadedEvents] = React.useState<
    OfflineEventRecord[]
  >([]);
  const [loadingEvents, setLoadingEvents] = React.useState(false);
  const [downloading, setDownloading] = React.useState(false);
  const [error, setError] = React.useState("");

  const loadDownloadedEvents = React.useCallback(async () => {
    try {
      const saved = await getOfflineEvents<OfflineEventRecord[]>();
      const sorted = [...saved].sort((a, b) =>
        b.lastUpdatedAt.localeCompare(a.lastUpdatedAt)
      );
      setDownloadedEvents(sorted);
    } catch (err) {
      console.error(err);
    }
  }, []);

  React.useEffect(() => {
    loadDownloadedEvents();
  }, [loadDownloadedEvents]);

  React.useEffect(() => {
    async function loadEvents() {
      if (!year.trim()) return;

      setLoadingEvents(true);
      setError("");

      try {
        if (!effectiveOnline) {
          // Strict offline mode: do NOT use yearEvents cache.
          setEvents([]);
          setSelectedEvent(null);
          return;
        }

        const res = await fetch(`/api/tba/events/${year}`);

        if (!res.ok) {
          throw new Error("Could not load events.");
        }

        const data: EventOption[] = await res.json();
        setEvents(data);

        // Convenience cache for online use only. This should not be used
        // as the source of truth in offline mode.
        await saveYearEvents(year, data);
      } catch (err) {
        console.error(err);
        setError("Could not load events.");
        setEvents([]);
        setSelectedEvent(null);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, [year, effectiveOnline]);

  const handleDownload = async () => {
    if (!selectedEvent) {
      toast.warning("Choose an event first.");
      return;
    }

    if (!effectiveOnline) {
      toast.warning("Downloading is unavailable while offline.");
      return;
    }

    setDownloading(true);
    setError("");

    try {
      await downloadEventBundle(
        selectedEvent.key,
        selectedEvent.name,
        Number(year)
      );

      await loadDownloadedEvents();
      toast.success(`Downloaded ${selectedEvent.name} for offline use.`);
    } catch (err) {
      console.error(err);
      setError("Could not download event data.");
      toast.error("Could not download event data.");
    } finally {
      setDownloading(false);
    }
  };

  const handleRemove = async (eventKey: string) => {
    try {
      await removeOfflineEvent(eventKey);
      await loadDownloadedEvents();
      toast.success("Removed downloaded event.");
    } catch (err) {
      console.error(err);
      toast.error("Could not remove downloaded event.");
    }
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Offline Events
        </Typography>
        <Typography color="text.secondary">
          Download specific events for strict offline use.
        </Typography>
      </Box>

      {!effectiveOnline && (
        <Alert severity="info">
          Offline mode is active. Only previously downloaded events are
          available.
        </Alert>
      )}

      {error && <Alert severity="warning">{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Download Event Data
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              size="small"
              sx={{ width: 140 }}
            />

            <Autocomplete
              options={events}
              value={selectedEvent}
              onChange={(_, newValue) => setSelectedEvent(newValue)}
              loading={loadingEvents}
              getOptionLabel={(option) => `${option.name} (${option.key})`}
              isOptionEqualToValue={(option, value) => option.key === value.key}
              renderInput={(params) => (
                <TextField {...params} label="Event" size="small" />
              )}
              sx={{ flex: 1, minWidth: 280 }}
              disabled={!effectiveOnline}
            />

            <Button
              variant="contained"
              onClick={handleDownload}
              disabled={!selectedEvent || downloading || !effectiveOnline}
            >
              {downloading ? "Downloading..." : "Download"}
            </Button>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            This downloads teams, match schedule, and rankings into IndexedDB.
          </Typography>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Downloaded Events
          </Typography>

          {downloadedEvents.length === 0 ? (
            <Typography color="text.secondary">
              No events downloaded yet.
            </Typography>
          ) : (
            downloadedEvents.map((event, index) => (
              <React.Fragment key={event.eventKey}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  <Stack spacing={0.5}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {event.eventName}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Chip label={event.eventKey} size="small" />
                      <Chip label={String(event.year)} size="small" />
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      Last updated:{" "}
                      {new Date(event.lastUpdatedAt).toLocaleString()}
                    </Typography>
                  </Stack>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemove(event.eventKey)}
                  >
                    Remove
                  </Button>
                </Stack>

                {index < downloadedEvents.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}
