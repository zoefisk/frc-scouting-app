"use client";

import React from "react";
import { Box, IconButton, Stack, TextField, Typography } from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";

type Props = {
    value: string;
    onChange: (value: string) => void;
    maxMatchNumber?: number | null;
};

export default function MatchNumberField({ value, onChange, maxMatchNumber = null }: Props) {
    const num = value === "" ? 0 : Number(value);
    const isAtMin = num <= 1;
    const isAtMax =
        maxMatchNumber != null && num >= maxMatchNumber;

    const clampMatchNumber = (raw: number) => {
        const min = 1;
        const max = maxMatchNumber ?? Number.POSITIVE_INFINITY;
        return Math.min(Math.max(raw, min), max);
    };

    const handleChange = (val: string) => {
        if (!/^\d*$/.test(val)) return;
        if (val.length > 3) return;

        if (val === "") {
            onChange("");
            return;
        }

        const parsed = Number(val);
        if (Number.isNaN(parsed)) return;

        const clamped = clampMatchNumber(parsed);
        onChange(String(clamped));
    };

    const decrement = () => {
        const next = clampMatchNumber(num - 1);
        onChange(String(next));
    };

    const increment = () => {
        const next = clampMatchNumber(num + 1);
        onChange(String(next));
    };

    return (
        <Box>
            <Typography sx={{ fontWeight: 500, mb: 1 }}>
                Match Number
            </Typography>

            <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                    width: "fit-content",
                    borderRadius: 2,
                    px: 0.75,
                    py: 0.5,
                    backgroundColor: "rgba(0,0,0,0.04)",
                }}
            >
                <IconButton
                    size="small"
                    onClick={decrement}
                    disabled={isAtMin}
                    aria-label="Decrease match number"
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                    }}
                >
                    <RemoveIcon fontSize="small" />
                </IconButton>

                <TextField
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    placeholder="##"
                    variant="outlined"
                    size="small"
                    inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 3,
                        "aria-label": "Match number",
                        style: {
                            textAlign: "center",
                            fontSize: "1.1rem",
                            fontWeight: 500,
                            width: "3ch",
                            padding: "6px 0",
                            cursor: "text",
                        },
                    }}
                    sx={{
                        width: "4.25ch",
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            px: 0.25,
                            backgroundColor: "rgba(255,255,255,0.65)",
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.15)",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(0,0,0,0.3)",
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                            {
                                borderColor: "rgba(0,0,0,0.35)",
                            },
                        "& input": {
                            textAlign: "center",
                        },
                    }}
                />

                <IconButton
                    size="small"
                    onClick={increment}
                    disabled={isAtMax}
                    aria-label="Increase match number"
                    sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                    }}
                >
                    <AddIcon fontSize="small" />
                </IconButton>
            </Stack>
        </Box>
    );
}
