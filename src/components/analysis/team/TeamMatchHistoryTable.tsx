"use client";

import React from "react";

import Link from "next/link";
import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { TeamEventMatchRow } from "@/old-lib/tba/server/teamEventMatches";

type Props = {
  matches: TeamEventMatchRow[];
  teamNumber: number;
};

function renderTeamChips(teams: number[], teamNumber: number) {
  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {teams.map((number) => (
        <Chip
          key={number}
          label={number}
          size="small"
          color={number === teamNumber ? "primary" : "default"}
          variant={number === teamNumber ? "filled" : "outlined"}
        />
      ))}
    </Stack>
  );
}

export default function TeamMatchHistoryTable({ matches, teamNumber }: Props) {
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Match History
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Match</strong>
                </TableCell>
                <TableCell>
                  <strong>Result</strong>
                </TableCell>
                <TableCell>
                  <strong>Alliance</strong>
                </TableCell>
                <TableCell>
                  <strong>Score</strong>
                </TableCell>
                <TableCell>
                  <strong>Blue</strong>
                </TableCell>
                <TableCell>
                  <strong>Red</strong>
                </TableCell>
                <TableCell>
                  <strong>Video</strong>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.matchKey} hover>
                  <TableCell>QM {match.matchNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={match.result}
                      size="small"
                      color={
                        match.result === "W"
                          ? "success"
                          : match.result === "L"
                            ? "error"
                            : "default"
                      }
                    />
                  </TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {match.allianceColor}
                  </TableCell>
                  <TableCell>
                    {match.blueScore} - {match.redScore}
                  </TableCell>
                  <TableCell>
                    {renderTeamChips(match.blueTeams, teamNumber)}
                  </TableCell>
                  <TableCell>
                    {renderTeamChips(match.redTeams, teamNumber)}
                  </TableCell>
                  <TableCell>
                    {match.videoUrl ? (
                      <Tooltip title="Open match video">
                        <IconButton
                          component={Link}
                          href={match.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <PlayCircleOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Video unavailable">
                        <span>
                          <IconButton disabled>
                            <PlayCircleOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );
}
