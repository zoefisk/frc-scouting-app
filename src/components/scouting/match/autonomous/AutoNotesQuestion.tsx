import React from "react";
import { Box, TextField } from "@mui/material";
import FieldLabelWithHelp from "@/components/match-scouting/FieldLabelWithHelp";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function AutoNotesQuestion({ value, onChange }: Props) {
  return (
    <Box>
      <FieldLabelWithHelp label="Autonomous Notes" />

      <TextField
        fullWidth
        multiline
        minRows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Anything notable about autonomous..."
      />
    </Box>
  );
}
