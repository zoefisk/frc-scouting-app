"use client";

import React from "react";
import { Button } from "@mui/material";
import { RobotPosition } from "./RobotPositionField";
import { TeamPresence } from "./TeamPresenceField";
import { ScoutingPosition } from "@/lib/scouting/types";
import {buildScoutingSetupExport} from "@/lib/scouting/export/buildScoutingSetupExport";

type Props = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: ScoutingPosition | null;
  teamKey: string;
  teamNumber: number | null;
  teamName: string;
  robotPosition: RobotPosition;
  teamPresence: TeamPresence;
};

function escapeCsvValue(value: unknown) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export default function ScoutingSetupCsvButton({
  eventKey,
  matchNumber,
  scoutingPosition,
  teamKey,
  teamNumber,
  teamName,
  robotPosition,
  teamPresence,
}: Props) {
  const isIncomplete =
    !matchNumber ||
    !scoutingPosition ||
    !teamKey ||
    !robotPosition ||
    !teamPresence;

  const handleDownload = () => {
    const payload = buildScoutingSetupExport({
      eventKey,
      matchNumber,
      scoutingPosition,
      teamKey,
      teamNumber,
      teamName,
      robotPosition,
      teamPresence,
    });

    const headers = Object.keys(payload);
    const values = Object.values(payload);

    const csv = [
      headers.map(escapeCsvValue).join(","),
      values.map(escapeCsvValue).join(","),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const teamLabel = teamNumber ? `team-${teamNumber}` : "team";
    const matchLabel = matchNumber || "match";
    const fileName = `scouting-setup-${eventKey}-${matchLabel}-${teamLabel}.csv`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outlined" onClick={handleDownload} disabled={isIncomplete}>
      Download CSV
    </Button>
  );
}
