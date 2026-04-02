"use client";

import React from "react";
import {
  Autocomplete,
  Chip,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TeamOption } from "@/lib/server/client/loadEventTeams";

type Props = {
  teams: TeamOption[];
  selectedTeamKey: string | null;
  loading: boolean;
  disabled?: boolean;
  autoDetected?: boolean;
  onChange: (team: TeamOption | null) => void;
};

export default function TeamAutocompleteField({
  teams,
  selectedTeamKey,
  loading,
  disabled = false,
  autoDetected = false,
  onChange,
}: Props) {
  const selectedValue =
    teams.find((team) => team.key === selectedTeamKey) ?? null;

  return (
    <Autocomplete
      options={teams}
      value={selectedValue}
      onChange={(_, newValue) => onChange(newValue)}
      getOptionLabel={(option) =>
        `#${option.team_number} ${option.nickname ?? option.name ?? "Unknown Team"}`
      }
      isOptionEqualToValue={(option, value) => option.key === value.key}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Team"
          placeholder="Search team..."
          helperText={
            autoDetected
              ? "Auto-filled from match data. You can still change it."
              : undefined
          }
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={`#${option.team_number}`}
              size="small"
              sx={{
                backgroundColor: "grey.300",
                color: "grey.900",
                fontWeight: 600,
                minWidth: 70,
              }}
            />
            <Typography>
              {option.nickname ?? option.name ?? "Unknown Team"}
            </Typography>
          </Stack>
        </li>
      )}
    />
  );
}
