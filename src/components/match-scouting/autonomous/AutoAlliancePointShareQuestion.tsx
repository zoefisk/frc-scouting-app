import React from "react";
import { Box, Slider, Typography } from "@mui/material";
import FieldLabelWithHelp from "../FieldLabelWithHelp";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function AutoAlliancePointShareQuestion({
  value,
  onChange,
}: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Estimated % of Alliance Auto Points"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              Estimate contribution
            </Typography>
            <Typography variant="body2">
              Estimate how much of the alliance’s autonomous score came from
              this robot.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This is only an estimate and does not need to be exact.
            </Typography>
          </Box>
        }
      />

      <Slider
        value={value}
        onChange={(_, newValue) => onChange(newValue as number)}
        step={5}
        min={0}
        max={100}
        marks={[
          { value: 0, label: "0%" },
          { value: 25, label: "25%" },
          { value: 50, label: "50%" },
          { value: 75, label: "75%" },
          { value: 100, label: "100%" },
        ]}
        valueLabelDisplay="auto"
      />
    </Box>
  );
}
