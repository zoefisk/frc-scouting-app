import React from "react";
import { Box, Slider, Typography } from "@mui/material";
import FieldLabelWithHelp from "../../scouting/common/FieldLabelWithHelp";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function TeleopDriverControlQuestion({
  value,
  onChange,
}: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Driver Control"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Driver Control
            </Typography>
            <Typography variant="body2">
              Rate how controlled, precise, and stable the robot looked during
              teleop.
            </Typography>
          </Box>
        }
      />

      <Slider
        value={value}
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
    </Box>
  );
}
