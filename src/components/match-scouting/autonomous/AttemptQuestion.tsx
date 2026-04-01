import {
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
} from "@mui/material";
import { AttemptStatus } from "./types";

type Props = {
  value: AttemptStatus;
  onChange: (value: AttemptStatus) => void;
};

export default function AttemptQuestion({ value, onChange }: Props) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle1">Attempts</Typography>

      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, val) => val && onChange(val)}
        fullWidth
      >
        <ToggleButton value="none">None</ToggleButton>
        <ToggleButton value="collect_failed">Collect Failed</ToggleButton>
        <ToggleButton value="shoot_failed">Shoot Failed</ToggleButton>
        <ToggleButton value="both_failed">Both Failed</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
