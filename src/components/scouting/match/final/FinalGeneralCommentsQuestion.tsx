import React from "react";
import { Box, TextField } from "@mui/material";
import FieldLabelWithHelp from "@/components/match-scouting/FieldLabelWithHelp";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function FinalGeneralCommentsQuestion({
  value,
  onChange,
}: Props) {
  return (
    <Box>
      <FieldLabelWithHelp label="General Comments" />
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Anything else worth noting?"
      />
    </Box>
  );
}
