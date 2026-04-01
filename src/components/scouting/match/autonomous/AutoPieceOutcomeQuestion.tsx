import React from "react";
import {Box, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent} from "@mui/material";
import { AutoGamePieceOutcome } from "./types";
import FieldLabelWithHelp from "@/components/match-scouting/FieldLabelWithHelp";

type Props = {
  value: AutoGamePieceOutcome;
  onChange: (value: AutoGamePieceOutcome) => void;
};

export default function AutoGamePieceOutcomeQuestion({
  value,
  onChange,
}: Props) {
  return (
    <Box>
      <FieldLabelWithHelp
        label="Game Piece Outcome"
        tooltip="Select what best describes their interaction with game pieces during autonomous."
      />

      <FormControl fullWidth size="small">
        <InputLabel id="auto-game-piece-label">Outcome</InputLabel>

        <Select<string>
            labelId="auto-game-piece-label"
            value={value ?? ""}
            label="Outcome"
            onChange={(e: SelectChangeEvent<string>) => {
              const nextValue = e.target.value;
              onChange(nextValue === "" ? null : (nextValue as AutoGamePieceOutcome));
            }}
        >
          <MenuItem value="">
            <em>None selected</em>
          </MenuItem>

          <MenuItem value="none">None</MenuItem>
          <MenuItem value="collect_failed">Collect Failed</MenuItem>
          <MenuItem value="collected_only">Collected Only</MenuItem>
          <MenuItem value="score_failed">Score Failed</MenuItem>
          <MenuItem value="scored">Scored</MenuItem>
          <MenuItem value="not_sure">Not Sure</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
