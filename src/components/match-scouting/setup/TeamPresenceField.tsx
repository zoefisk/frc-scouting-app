import React from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import FieldLabelWithHelp from "../../scouting/common/FieldLabelWithHelp";

export type TeamPresence = "present" | "no_show" | null;

type Props = {
  value: TeamPresence;
  onChange: (value: TeamPresence) => void;
};

export default function TeamPresenceField({ value, onChange }: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Did the team show up?"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Team attendance
            </Typography>
            <Typography variant="body2">
              Mark whether the robot actually appeared for the match.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              If the team did not show up, later scouting questions can stay
              hidden.
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
        <ToggleButton value="present">Present</ToggleButton>
        <ToggleButton value="no_show">No-show</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
