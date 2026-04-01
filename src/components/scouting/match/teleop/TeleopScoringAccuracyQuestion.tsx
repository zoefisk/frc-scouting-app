"use client";

import React from "react";
import { Box, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import FieldLabelWithHelp from "../FieldLabelWithHelp";

type Props = {
    value: number;
    onChange: (value: number) => void;
};

const options = [0, 25, 50, 75, 100];

export default function TeleopScoringAccuracyQuestion({
                                                          value,
                                                          onChange,
                                                      }: Props) {
    return (
        <Box>
            <FieldLabelWithHelp
                label="Scoring Accuracy"
                tooltip={
                    <Box sx={{ p: 0.5 }}>
                        <Typography fontWeight={600} gutterBottom>
                            Scoring Accuracy
                        </Typography>
                        <Typography variant="body2">
                            Estimate what percent of their scoring attempts were successful.
                        </Typography>
                    </Box>
                }
            />

            <ToggleButtonGroup
                exclusive
                value={value}
                onChange={(_, newValue) => {
                    if (newValue !== null) onChange(newValue);
                }}
                fullWidth
            >
                {options.map((option) => (
                    <ToggleButton key={option} value={option}>
                        {option}%
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
        </Box>
    );
}
