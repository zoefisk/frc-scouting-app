import { ScoutingPosition } from "@/lib/scouting/types";
import { RobotPosition } from "@/components/match-scouting/setup/RobotPositionField";
import { TeamPresence } from "@/components/match-scouting/setup/TeamPresenceField";

export type ScoutingSetupValues = {
    eventKey: string;
    matchNumber: string;
    scoutingPosition: ScoutingPosition;
    selectedTeamKey: string;
    robotPosition: RobotPosition;
    teamPresence: TeamPresence;
};

export type ValidationResult = {
    isValid: boolean;
    errors: Record<string, string>;
};

export function validateScoutingSetup(values: ScoutingSetupValues): ValidationResult {
    const errors: Record<string, string> = {};

    if (!values.eventKey) {
        errors.eventKey = "Event is required.";
    }

    if (!values.matchNumber) {
        errors.matchNumber = "Match number is required.";
    } else if (!/^\d+$/.test(values.matchNumber)) {
        errors.matchNumber = "Match number must be numeric.";
    }

    if (!values.scoutingPosition) {
        errors.scoutingPosition = "Scouting position is required.";
    }

    if (!values.selectedTeamKey) {
        errors.selectedTeamKey = "Team is required.";
    }

    if (!values.robotPosition) {
        errors.robotPosition = "Robot position is required.";
    }

    if (!values.teamPresence) {
        errors.teamPresence = "Please indicate whether the team showed up.";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}
