"use client";

import React from "react";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";

import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";
import type { SelectFieldDefinition } from "@/lib/scouting/questionnaires/types";

type Props = {
  field: SelectFieldDefinition;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export default function SelectFieldQuestion({
  field,
  value,
  error,
  onChange,
}: Props) {
  const labelId = `${field.id}-label`;

  return (
    <div>
      <FieldLabelWithHelp label={field.label} tooltip={field.helpText} />

      <FormControl fullWidth size="small" error={Boolean(error)}>
        <InputLabel id={labelId}>{field.label}</InputLabel>

        <Select
          labelId={labelId}
          label={field.label}
          value={value}
          onChange={(event: SelectChangeEvent<string>) =>
            onChange(event.target.value)
          }
        >
          <MenuItem value="">
            <em>None selected</em>
          </MenuItem>

          {field.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
