"use client";

import React from "react";
import { TextField } from "@mui/material";

import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";
import type { TextFieldDefinition } from "@/lib/scouting/questionnaires/types";

type Props = {
  field: TextFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export default function TextFieldQuestion({
  field,
  value,
  error,
  onChange,
}: Props) {
  return (
    <div>
      <FieldLabelWithHelp label={field.label} tooltip={field.helpText} />

      <TextField
        fullWidth
        size="small"
        value={value}
        error={Boolean(error)}
        helperText={error}
        placeholder={field.placeholder}
        multiline={field.multiline}
        minRows={field.multiline ? 3 : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
