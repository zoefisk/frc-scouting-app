"use client";

import React from "react";
import {
  Autocomplete,
  Chip,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

type Props = {
  teams: TeamOption[];
  value: TeamOption[];
  loading: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (value: TeamOption[]) => void;
};

export default function ProjectBuilderTeamKeysField({
  teams,
  value,
  loading,
  disabled = false,
  error,
  onChange,
}: Props) {
  return (
    <Stack spacing={1}>
      <Autocomplete
        multiple
        options={teams}
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        disableCloseOnSelect
        loading={loading}
        disabled={disabled}
        getOptionLabel={(option) =>
          `#${option.team_number} ${option.nickname ?? option.name ?? "Unknown Team"}`
        }
        isOptionEqualToValue={(option, selected) => option.key === selected.key}
        filterSelectedOptions
        renderTags={(selected, getTagProps) =>
          selected.map((team, index) => (
            <Chip
              {...getTagProps({ index })}
              key={team.key}
              label={`#${team.team_number}`}
              size="small"
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Participating Teams"
            placeholder={
              disabled
                ? "Enter an event key first"
                : "Type a team number or name"
            }
            error={Boolean(error)}
            helperText={
              error ??
              (disabled
                ? "Load an event first so teams can be pulled from TBA."
                : "Search the event team list by number or name.")
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
                  minWidth: 72,
                }}
              />
              <Typography>
                {option.nickname ?? option.name ?? "Unknown Team"}
              </Typography>
            </Stack>
          </li>
        )}
      />
    </Stack>
  );
}
