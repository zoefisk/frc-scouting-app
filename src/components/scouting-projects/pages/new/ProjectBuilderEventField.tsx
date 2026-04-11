"use client";

import React from "react";
import {
  Autocomplete,
  Chip,
  CircularProgress,
  createFilterOptions,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FieldLabelWithHelp from "@/components/common/FieldLabelWithHelp";
import type { SimpleEventOption } from "@/lib/scouting/tba/types";

type Props = {
  events: SimpleEventOption[];
  value: string;
  loading: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (eventKey: string) => void;
};

function getWeekLabel(week: number | null): string | null {
  if (week == null) {
    return null;
  }

  return `Week ${week + 1}`;
}

const filterOptions = createFilterOptions<SimpleEventOption>({
  stringify: (option) => {
    const weekLabel = getWeekLabel(option.week);
    const oneBasedWeek = option.week == null ? "" : String(option.week + 1);

    return [
      option.name,
      option.key,
      weekLabel ?? "",
      oneBasedWeek ? `week ${oneBasedWeek}` : "",
      oneBasedWeek,
    ]
      .join(" ")
      .trim();
  },
});

export default function ProjectBuilderEventField({
  events,
  value,
  loading,
  disabled = false,
  error,
  onChange,
}: Props) {
  const sortedEvents = React.useMemo(
    () =>
      [...events].sort((a, b) => {
        if (a.week == null && b.week != null) {
          return 1;
        }
        if (a.week != null && b.week == null) {
          return -1;
        }
        if (a.week != null && b.week != null && a.week !== b.week) {
          return a.week - b.week;
        }

        return a.name.localeCompare(b.name);
      }),
    [events]
  );

  const selectedValue = events.find((event) => event.key === value) ?? null;

  return (
    <Stack spacing={1} sx={{ flex: 1 }}>
      <FieldLabelWithHelp
        label="Event Key"
        tooltip="Choose the event this scouting project is for. Search by event name, event key, or competition week."
      />

      <Autocomplete
        options={sortedEvents}
        value={selectedValue}
        onChange={(_, newValue) => onChange(newValue?.key ?? "")}
        loading={loading}
        disabled={disabled}
        filterOptions={filterOptions}
        getOptionLabel={(option) => `${option.name} (${option.key})`}
        isOptionEqualToValue={(option, selected) => option.key === selected.key}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={
              disabled
                ? "Enter a year first"
                : "Search event name, key, or week"
            }
            error={Boolean(error)}
            helperText={
              error ??
              (disabled
                ? "Choose a year first so events can be pulled from TBA."
                : "Pick the competition this project belongs to.")
            }
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? (
                    <CircularProgress color="inherit" size={18} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => {
          const weekLabel = getWeekLabel(option.week);
          const { key, ...optionProps } = props;

          return (
            <li key={key} {...optionProps}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>
                    {option.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {weekLabel ? `${option.key} • ${weekLabel}` : option.key}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1}>
                  {weekLabel ? (
                    <Chip
                      label={weekLabel}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(37,99,235,0.12)",
                        color: "primary.main",
                        fontWeight: 600,
                      }}
                    />
                  ) : null}
                </Stack>
              </Stack>
            </li>
          );
        }}
      />
    </Stack>
  );
}
