// src/lib/scouting/match/inProgressMatchScouting.ts

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import { TeamOption } from "@/lib/server/client/loadEventTeams";

export type DraftScoutingPosition =
  | "blue1"
  | "blue2"
  | "blue3"
  | "red1"
  | "red2"
  | "red3";

export type DraftTeamPresence = "present" | "absent" | "surrogate";
export type DraftRobotPosition = "left" | "center" | "right" | null;

export type InProgressMatchScoutingSnapshot = {
  eventKey: string;
  matchNumber: string;
  scoutingPosition: DraftScoutingPosition | null;
  teamPresence: DraftTeamPresence;
  selectedTeam: TeamOption | null;
  robotPosition: DraftRobotPosition;
  answers: QuestionnaireAnswers;
};

export type InProgressMatchScoutingDraft = {
  questionnaireId: string;
  questionnaireVersion: number;
  savedAt: string;
  snapshot: InProgressMatchScoutingSnapshot;
};

const STORAGE_KEY = "frc-scouting:in-progress-match";

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
}

function hasMeaningfulAnswers(answers: QuestionnaireAnswers): boolean {
  return Object.values(answers).some((value) => hasMeaningfulValue(value));
}

export function shouldCacheInProgressMatchScouting(
  snapshot: InProgressMatchScoutingSnapshot
): boolean {
  // The user specifically wanted no cache when ONLY event key + match number are set.
  const hasOnlyEventAndMatch =
    snapshot.eventKey.trim() !== "" &&
    snapshot.matchNumber.trim() !== "" &&
    snapshot.scoutingPosition == null &&
    snapshot.selectedTeam == null &&
    snapshot.robotPosition == null &&
    snapshot.teamPresence === "present" &&
    !hasMeaningfulAnswers(snapshot.answers);

  if (hasOnlyEventAndMatch) {
    return false;
  }

  return (
    snapshot.eventKey.trim() !== "" ||
    snapshot.matchNumber.trim() !== "" ||
    snapshot.scoutingPosition != null ||
    snapshot.selectedTeam != null ||
    snapshot.robotPosition != null ||
    snapshot.teamPresence !== "present" ||
    hasMeaningfulAnswers(snapshot.answers)
  );
}

export function buildInProgressMatchScoutingDraft(
  questionnaire: QuestionnaireDefinition,
  snapshot: InProgressMatchScoutingSnapshot
): InProgressMatchScoutingDraft {
  return {
    questionnaireId: questionnaire.id,
    questionnaireVersion: questionnaire.version,
    savedAt: new Date().toISOString(),
    snapshot,
  };
}

export function saveInProgressMatchScoutingDraft(
  questionnaire: QuestionnaireDefinition,
  snapshot: InProgressMatchScoutingSnapshot
): void {
  if (!shouldCacheInProgressMatchScouting(snapshot)) {
    clearInProgressMatchScoutingDraft();
    return;
  }

  const draft = buildInProgressMatchScoutingDraft(questionnaire, snapshot);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function loadInProgressMatchScoutingDraft(): InProgressMatchScoutingDraft | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as InProgressMatchScoutingDraft;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearInProgressMatchScoutingDraft(): void {
  localStorage.removeItem(STORAGE_KEY);
}
