import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";

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
              Robot lineup position
            </Typography>
            <Typography variant="body2">
              Choose left, center, or right based on the robot’s field lineup
              slot.
            </Typography>
          </Box>
        }
      />

      <ToggleButtonGroup
        exclusive
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        fullWidth
      >
        <ToggleButton value="left">Left</ToggleButton>
        <ToggleButton value="center">Center</ToggleButton>
        <ToggleButton value="right">Right</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
