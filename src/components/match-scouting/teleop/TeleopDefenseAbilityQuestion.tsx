import React from "react";
import {
  Box,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
} from "@mui/material";
import FieldLabelWithHelp from "../../scouting/common/FieldLabelWithHelp";

type Props = {
  value: number | null;
  playedDefense: boolean | null;
  onPlayedDefenseChange: (value: boolean | null) => void;
  onChange: (value: number | null) => void;
};

export default function TeleopDefenseAbilityQuestion({
  value,
  playedDefense,
  onPlayedDefenseChange,
  onChange,
}: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Defense Ability"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Defense Ability
            </Typography>
            <Typography variant="body2">
              First indicate whether they played defense. If they did, rate how
              effective they were.
            </Typography>
          </Box>
        }
      />

      <Stack spacing={2}>
        <ToggleButtonGroup
          exclusive
          value={playedDefense}
          onChange={(_, newValue) => {
            if (newValue === null) return;
            onPlayedDefenseChange(newValue);

            if (newValue === false) {
              onChange(null);
            } else if (value === null) {
              onChange(0);
            }
          }}
          fullWidth
        >
          <ToggleButton value={true}>Played Defense</ToggleButton>
          <ToggleButton value={false}>Did Not</ToggleButton>
        </ToggleButtonGroup>

        {playedDefense === true && (
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
