import React from "react";
import {
  Chip,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import FieldLabelWithHelp from "../FieldLabelWithHelp";
import { scoutingOptions } from "@/lib/scouting/constants";
import { ScoutingPosition } from "@/lib/scouting/types";

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
            <Typography variant="body2" sx={{ mt: 1 }}>
              Stand facing the field and match your assigned robot to its driver
              station slot.
            </Typography>
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
