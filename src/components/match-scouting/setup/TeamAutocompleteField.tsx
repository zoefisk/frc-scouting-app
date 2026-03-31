"use client";

import React from "react";
import { Autocomplete, Chip, Stack, TextField, Typography } from "@mui/material";
import { TeamData } from "@/lib/scouting/types";
import {useMounted} from "@/lib/scouting/hooks/useMounted";

type Props = {
    teams: TeamData[];
    selectedTeamKey: string;
    loading: boolean;
    disabled: boolean;
    onChange: (team: TeamData | null) => void;
};

export default function TeamAutocompleteField({
                                                  teams,
                                                  selectedTeamKey,
                                                  loading,
                                                  disabled,
                                                  onChange,
                                              }: Props) {
    const mounted = useMounted();

    if (!mounted) {
        return <TextField label="Team" placeholder="Loading team field..." fullWidth disabled />;
    }

    return (
        <Autocomplete
            options={teams}
            value={teams.find((t) => t.key === selectedTeamKey) ?? null}
            onChange={(_, newValue) => onChange(newValue)}
            getOptionLabel={(option) =>
                `#${option.team_number} ${option.nickname ?? "Unknown Team"}`
            }
            isOptionEqualToValue={(option, value) => option.key === value.key}
            loading={loading}
            disabled={disabled}
            renderInput={(params) => (
                <TextField {...params} label="Team" placeholder="Search team..." />
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
                        <Typography>{option.nickname ?? "Unknown Team"}</Typography>
                    </Stack>
                </li>
            )}
        />
    );
}
