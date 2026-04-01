"use client";

import React from "react";
import {
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from "@mui/material";
import FieldLabelWithHelp from "../FieldLabelWithHelp";

export type RobotPosition = "left" | "center" | "right" | null;

type Props = {
    value: RobotPosition;
    onChange: (value: RobotPosition) => void;
};

export default function RobotPositionField({ value, onChange }: Props) {
    return (
        <Box>
            <FieldLabelWithHelp
                label="Robot Position"
                tooltip={
                    <Box sx={{ p: 0.5 }}>
                        <Typography fontWeight={600} gutterBottom>
                            How robot position works
                        </Typography>
                        <Typography variant="body2">
                            This refers to where the robot is positioned on the field lineup.
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            Choose the robot’s starting side: left, center, or right.
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
                <ToggleButton value="left">Left</ToggleButton>
                <ToggleButton value="center">Center</ToggleButton>
                <ToggleButton value="right">Right</ToggleButton>
            </ToggleButtonGroup>
        </Box>
    );
}
