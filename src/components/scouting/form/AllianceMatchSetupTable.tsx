"use client";

import React from "react";
import {
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import FieldLabelWithHelp from "@/components/scouting/common/FieldLabelWithHelp";
import type {
  AllianceTeamSetup,
  MatchRobotPosition,
  MatchTeamPresence,
} from "@/components/scouting/submission/types";

type Props = {
  allianceColor: "red" | "blue";
  rows: AllianceTeamSetup[];
  onPresenceChange: (
    slot: AllianceTeamSetup["slot"],
    nextPresence: MatchTeamPresence
  ) => void;
  onRobotPositionChange: (
    slot: AllianceTeamSetup["slot"],
    nextPosition: MatchRobotPosition
  ) => void;
};

function getAllianceChipStyles(allianceColor: "red" | "blue") {
  return allianceColor === "red"
    ? {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
      }
    : {
        backgroundColor: "#dbeafe",
        color: "#1d4ed8",
      };
}

export default function AllianceMatchSetupTable({
  allianceColor,
  rows,
  onPresenceChange,
  onRobotPositionChange,
}: Props) {
  return (
    <Stack spacing={1}>
      <FieldLabelWithHelp
        label="Alliance Team Setup"
        tooltip="Review all three teams on the alliance, then adjust each robot's presence and field lineup position if needed."
      />

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Alliance Team</TableCell>
              <TableCell>Presence</TableCell>
              <TableCell>Robot Position</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={`${allianceColor}-${row.slot}`}>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={`${allianceColor.toUpperCase()} ${row.slot}`}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          ...getAllianceChipStyles(allianceColor),
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.team
                          ? `#${row.team.team_number} ${
                              row.team.nickname ?? row.team.name ?? row.team.key
                            }`
                          : "Team unavailable"}
                      </Typography>
                    </Stack>
                  </Stack>
                </TableCell>

                <TableCell sx={{ minWidth: 150 }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={row.teamPresence}
                    onChange={(event) =>
                      onPresenceChange(
                        row.slot,
                        event.target.value as MatchTeamPresence
                      )
                    }
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                    <MenuItem value="surrogate">Surrogate</MenuItem>
                  </TextField>
                </TableCell>

                <TableCell sx={{ minWidth: 160 }}>
                  <TextField
                    select
                    size="small"
                    fullWidth
                    value={row.robotPosition ?? ""}
                    onChange={(event) =>
                      onRobotPositionChange(
                        row.slot,
                        (event.target.value || null) as MatchRobotPosition
                      )
                    }
                  >
                    <MenuItem value="">Select position</MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="center">Center</MenuItem>
                    <MenuItem value="right">Right</MenuItem>
                  </TextField>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
