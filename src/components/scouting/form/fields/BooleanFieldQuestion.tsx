import React from "react";
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";
import { BooleanFieldDefinition } from "@/lib/scouting/questionnaire/types";

type Props = {
  field: BooleanFieldDefinition;
  value: boolean | null;
  error?: string;
  onChange: (value: boolean | null) => void;
};

export default function BooleanFieldQuestion({
  field,
  value,
  error,
  onChange,
}: Props) {
  return (
    <div>
      <FieldLabelWithHelp label={field.label} tooltip={field.helpText} />

      <Stack spacing={1}>
        <ToggleButtonGroup
          exclusive
          value={value}
          onChange={(_, nextValue) => onChange(nextValue)}
          size="small"
        >
          <ToggleButton value={true}>Yes</ToggleButton>
          <ToggleButton value={false}>No</ToggleButton>
        </ToggleButtonGroup>

        {error && (
          <Typography variant="caption" color="error">
            {error}
          </Typography>
        )}
      </Stack>
    </div>
  );
}
