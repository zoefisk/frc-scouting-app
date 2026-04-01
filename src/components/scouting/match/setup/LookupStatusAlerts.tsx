"use client";

import { Alert, Stack } from "@mui/material";

type Props = {
  teamsLoading: boolean;
  lookupLoading: boolean;
  teamsError: string;
  lookupError: string;
  isAutofilled: boolean;
};

export default function LookupStatusAlerts({
  teamsLoading,
  lookupLoading,
  teamsError,
  lookupError,
  isAutofilled,
}: Props) {
  return (
    <Stack spacing={1}>
      {teamsLoading && <Alert severity="info">Loading event teams...</Alert>}
      {lookupLoading && (
        <Alert severity="info">Looking up team from match assignment...</Alert>
      )}
      {teamsError && <Alert severity="warning">{teamsError}</Alert>}
      {lookupError && <Alert severity="warning">{lookupError}</Alert>}
      {isAutofilled && !lookupError && (
        <Alert severity="success">
          Team filled automatically from match assignment.
        </Alert>
      )}
    </Stack>
  );
}
