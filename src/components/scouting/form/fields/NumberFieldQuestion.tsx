"use client";

import React from "react";
import { TextField } from "@mui/material";

import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";
import type { NumberFieldDefinition } from "@/lib/scouting/questionnaires/types";

type Props = {
  field: NumberFieldDefinition;
  value: number | null;
  error?: string;
  onChange: (value: number | null) => void;
};

export default function NumberFieldQuestion({
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
        type="number"
        value={value ?? ""}
        error={Boolean(error)}
        helperText={error}
        inputProps={{
          min: field.min,
          max: field.max,
          step: field.step ?? 1,
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          onChange(nextValue === "" ? null : Number(nextValue));
        }}
      />
    </div>
  );
}
