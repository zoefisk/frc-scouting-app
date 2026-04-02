import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { AutoMobility } from "./types";
import FieldLabelWithHelp from "@/components/match-scouting/FieldLabelWithHelp";

type Props = {
  value: AutoMobility;
  onChange: (value: AutoMobility) => void;
};

export default function AutoMobilityQuestion({ value, onChange }: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Mobility"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Mobility
            </Typography>
            <Typography variant="body2">
              Did the robot leave its starting area during autonomous?
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
        <ToggleButton value="yes">Yes</ToggleButton>
        <ToggleButton value="no">No</ToggleButton>
        <ToggleButton value="not_sure">Not Sure</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
