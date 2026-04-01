import { MatchScoutingPayload } from "@/components/match-scouting/types";

export function parseScannedMatchPayload(
  parsedData: Record<string, unknown> | null
): MatchScoutingPayload | null {
  if (!parsedData) return null;

  const setup =
    typeof parsedData.setup === "object" && parsedData.setup !== null
      ? (parsedData.setup as Record<string, unknown>)
      : null;

  const autonomous =
    typeof parsedData.autonomous === "object" && parsedData.autonomous !== null
      ? (parsedData.autonomous as Record<string, unknown>)
      : null;

  const teleop =
    typeof parsedData.teleop === "object" && parsedData.teleop !== null
      ? (parsedData.teleop as Record<string, unknown>)
      : null;

  const finalComments =
    typeof parsedData.finalComments === "object" &&
    parsedData.finalComments !== null
      ? (parsedData.finalComments as Record<string, unknown>)
      : null;

  if (!setup) return null;

  return {
    eventKey: String(setup.eventKey ?? ""),
    matchNumber: String(setup.matchNumber ?? ""),
    scoutingPosition: (setup.scoutingPosition ??
      "") as MatchScoutingPayload["scoutingPosition"],
    selectedTeamKey: String(setup.teamKey ?? ""),
    teamNumber:
      typeof setup.teamNumber === "number"
        ? setup.teamNumber
        : setup.teamNumber != null
          ? Number(setup.teamNumber)
          : null,
    teamName: String(setup.teamName ?? ""),
    robotPosition: (setup.robotPosition ??
      null) as MatchScoutingPayload["robotPosition"],
    teamPresence: (setup.teamPresence ??
      null) as MatchScoutingPayload["teamPresence"],

    autoData: {
      mobility: (autonomous?.mobility ??
        null) as MatchScoutingPayload["autoData"]["mobility"],
      gamePieceOutcome: (autonomous?.gamePieceOutcome ??
        null) as MatchScoutingPayload["autoData"]["gamePieceOutcome"],
      climb: (autonomous?.climb ??
        null) as MatchScoutingPayload["autoData"]["climb"],
      alliancePointShare:
        typeof autonomous?.alliancePointShare === "number"
          ? autonomous.alliancePointShare
          : autonomous?.alliancePointShare != null
            ? Number(autonomous.alliancePointShare)
            : 0,
      notes: String(autonomous?.notes ?? ""),
    },

    teleopData: {
      scoringEffectiveness:
        typeof teleop?.scoringEffectiveness === "number"
          ? teleop.scoringEffectiveness
          : teleop?.scoringEffectiveness != null
            ? Number(teleop.scoringEffectiveness)
            : 0,
      scoringAccuracy:
        typeof teleop?.scoringAccuracy === "number"
          ? teleop.scoringAccuracy
          : teleop?.scoringAccuracy != null
            ? Number(teleop.scoringAccuracy)
            : 0,
      cycleSpeed:
        typeof teleop?.cycleSpeed === "number"
          ? teleop.cycleSpeed
          : teleop?.cycleSpeed != null
            ? Number(teleop.cycleSpeed)
            : 0,
      driverControl:
        typeof teleop?.driverControl === "number"
          ? teleop.driverControl
          : teleop?.driverControl != null
            ? Number(teleop.driverControl)
            : 0,
      playedDefense:
        typeof teleop?.playedDefense === "boolean"
          ? teleop.playedDefense
          : null,
      defenseAbility:
        typeof teleop?.defenseAbility === "number"
          ? teleop.defenseAbility
          : teleop?.defenseAbility != null
            ? Number(teleop.defenseAbility)
            : null,
      wasDefended:
        typeof teleop?.wasDefended === "boolean" ? teleop.wasDefended : null,
      defenseResistance:
        typeof teleop?.defenseResistance === "number"
          ? teleop.defenseResistance
          : teleop?.defenseResistance != null
            ? Number(teleop.defenseResistance)
            : null,
      climb: (teleop?.climb ??
        null) as MatchScoutingPayload["teleopData"]["climb"],
      notes: String(teleop?.notes ?? ""),
    },

    finalCommentsData: {
      overallPerformance:
        typeof finalComments?.overallPerformance === "number"
          ? finalComments.overallPerformance
          : finalComments?.overallPerformance != null
            ? Number(finalComments.overallPerformance)
            : 3,
      didWell: String(finalComments?.didWell ?? ""),
      canImprove: String(finalComments?.canImprove ?? ""),
      generalComments: String(finalComments?.generalComments ?? ""),
    },
  };
}
