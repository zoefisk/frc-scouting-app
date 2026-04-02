import React from "react";
import {
  Box,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
} from "@mui/material";
import FieldLabelWithHelp from "@/components/match-scouting/FieldLabelWithHelp";

type Props = {
  value: number | null;
  wasDefended: boolean | null;
  onWasDefendedChange: (value: boolean | null) => void;
  onChange: (value: number | null) => void;
};

export default function TeleopDefenseResistanceQuestion({
  value,
  wasDefended,
  onWasDefendedChange,
  onChange,
}: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Defense Resistance"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Defense Resistance
            </Typography>
            <Typography variant="body2">
              First indicate whether they were defended. If they were, rate how
              well they handled it.
            </Typography>
          </Box>
        }
      />

      <Stack spacing={2}>
        <ToggleButtonGroup
          exclusive
          value={wasDefended}
          onChange={(_, newValue) => {
            if (newValue === null) return;
            onWasDefendedChange(newValue);

            if (newValue === false) {
              onChange(null);
            } else if (value === null) {
              onChange(0);
            }
          }}
          fullWidth
        >
          <ToggleButton value={true}>Was Defended</ToggleButton>
          <ToggleButton value={false}>Was Not</ToggleButton>
        </ToggleButtonGroup>

        {wasDefended === true && (
          <Slider
            value={value ?? 0}
            onChange={(_, newValue) => onChange(newValue as number)}
            step={1}
            min={0}
            max={5}
            marks={[
              { value: 0, label: "0" },
              { value: 1, label: "1" },
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
              { value: 5, label: "5" },
            ]}
            valueLabelDisplay="auto"
          />
        )}
      </Stack>
    </Box>
  );
}
