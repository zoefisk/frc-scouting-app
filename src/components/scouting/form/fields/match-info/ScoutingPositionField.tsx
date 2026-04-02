import React from "react";
import {
  Chip,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";

export type ScoutingPosition =
  | "blue1"
  | "blue2"
  | "blue3"
  | "red1"
  | "red2"
  | "red3";

const scoutingOptions: Array<{
  value: ScoutingPosition;
  alliance: "blue" | "red";
  position: 1 | 2 | 3;
  color: string;
}> = [
  { value: "blue1", alliance: "blue", position: 1, color: "#1976d2" },
  { value: "blue2", alliance: "blue", position: 2, color: "#1976d2" },
  { value: "blue3", alliance: "blue", position: 3, color: "#1976d2" },
  { value: "red1", alliance: "red", position: 1, color: "#d32f2f" },
  { value: "red2", alliance: "red", position: 2, color: "#d32f2f" },
  { value: "red3", alliance: "red", position: 3, color: "#d32f2f" },
];

type Props = {
  value: ScoutingPosition | null;
  onChange: (value: ScoutingPosition | null) => void;
};

export default function ScoutingPositionField({ value, onChange }: Props) {
  return (
    <FormControl fullWidth>
      <FieldLabelWithHelp
        label="Scouting Position"
        tooltip={
          <Box sx={{ p: 0.5 }}>
            <Typography fontWeight={600} gutterBottom>
              How positions work
            </Typography>
            <Typography variant="body2">
              Positions follow driver station order.
            </Typography>
            <Typography variant="body2">• Blue 1–3 = left → right</Typography>
            <Typography variant="body2">• Red 1–3 = left → right</Typography>
          </Box>
        }
      />

      <Select
        value={value ?? ""}
        onChange={(event: SelectChangeEvent) =>
          onChange((event.target.value || null) as ScoutingPosition | null)
        }
        displayEmpty
        renderValue={(selected) => {
          if (!selected) {
            return (
              <Typography color="text.secondary">Select position</Typography>
            );
          }

          const option = scoutingOptions.find((o) => o.value === selected);
          if (!option) return selected;

          return (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                label={option.alliance.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: option.color,
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Typography>Position {option.position}</Typography>
            </Stack>
          );
        }}
      >
        <MenuItem value="">
          <Typography color="text.secondary">Select position</Typography>
        </MenuItem>

        {scoutingOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label={option.alliance.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: option.color,
                  color: "white",
                  fontWeight: 600,
                  minWidth: 60,
                }}
              />
              <ListItemText primary={`Position ${option.position}`} />
            </Stack>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
