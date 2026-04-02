import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import FieldLabelWithHelp from "../../scouting/common/FieldLabelWithHelp";
import { TeleopClimb } from "./types";

type Props = {
  value: TeleopClimb | null;
  onChange: (value: TeleopClimb | null) => void;
};

export default function TeleopClimbQuestion({ value, onChange }: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Climb"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Climb result
            </Typography>
            <Typography variant="body2">
              Select the climb outcome during teleop.
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
        <ToggleButton value="not_attempted">Not Attempted</ToggleButton>
        <ToggleButton value="failed">Failed</ToggleButton>
        <ToggleButton value="l1">L1</ToggleButton>
        <ToggleButton value="l2">L2</ToggleButton>
        <ToggleButton value="l3">L3</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
