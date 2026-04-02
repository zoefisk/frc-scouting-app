import React from "react";
import { TextField } from "@mui/material";

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export default function EventField({
  value,
  onChange,
  disabled = false,
}: Props) {
  return (
    <TextField
      fullWidth
      label="Event Key"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      size="small"
      disabled={disabled}
    />
  );
}
