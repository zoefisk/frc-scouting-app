"use client";

import React from "react";
import { Autocomplete, TextField } from "@mui/material";

export type TeamOption = {
    key: string;
    teamNumber: number;
    nickname: string;
};

type Props = {
    options: TeamOption[];
    value: TeamOption | null;
    onChange: (value: TeamOption | null) => void;
    disabled?: boolean;
    excludeTeamKey?: string;
};

export default function TeamRadarComparePicker({
                                                   options,
                                                   value,
                                                   onChange,
                                                   disabled = false,
                                                   excludeTeamKey,
                                               }: Props) {
    const filteredOptions = React.useMemo(
        () => options.filter((team) => team.key !== excludeTeamKey),
        [options, excludeTeamKey]
    );

    return (
        <Autocomplete
            options={filteredOptions}
            value={value}
            onChange={(_, newValue) => onChange(newValue)}
            disabled={disabled}
            getOptionLabel={(option) =>
                `#${option.teamNumber} ${option.nickname || ""}`.trim()
            }
            isOptionEqualToValue={(option, selected) => option.key === selected.key}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Compare with another team"
                    placeholder="Select a team"
                    size="small"
                />
            )}
            sx={{ maxWidth: 420 }}
        />
    );
}
