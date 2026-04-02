import React from "react";
import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";
import { RatingFieldDefinition } from "@/lib/scouting/questionnaire/types";

type Props = {
  field: RatingFieldDefinition;
  value: number | null;
  error?: string;
  onChange: (value: number | null) => void;
};

export default function RatingFieldQuestion({
  field,
  value,
  error,
  onChange,
}: Props) {
  const options = Array.from(
    { length: field.max - field.min + 1 },
    (_, index) => field.min + index
  );

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
          {options.map((option) => (
            <ToggleButton key={option} value={option}>
              {option}
            </ToggleButton>
          ))}
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
