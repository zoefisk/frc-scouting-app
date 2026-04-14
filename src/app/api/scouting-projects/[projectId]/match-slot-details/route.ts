import { NextRequest, NextResponse } from "next/server";

import {
  getProjectMatchQuestionnaireEntriesForScheduleSlot,
  type QuestionnaireEntryDoc,
} from "@/lib/firebase/server/entries";
import { getScoutingProjectServer } from "@/lib/firebase/server/projects";
import type { QuestionnaireDefinition } from "@/lib/scouting/questionnaire/types";
import { resolveProjectQuestionnaireServer } from "@/lib/scouting-projects/questionnaires/resolveProjectQuestionnaireServer";
import type { ScoutingScheduleSlot } from "@/lib/scouting-projects/types";

type RouteContext = {
  params: Promise<{
    projectId: string;
  }>;
};

type MatchSlotDetailsResponse = {
  entries: Array<{
    entryId: string;
    savedAt: string | null;
    teamNumber: number | null;
    teamName: string | null;
    scoutingPosition: string | null;
    teamPresence: string | null;
    answers: Array<{
      label: string;
      value: string;
    }>;
  }>;
};

function formatSavedAt(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatAnswerValue(value: unknown): string {
  if (value == null) {
    return "-";
  }

  if (typeof value === "string") {
    return value.trim() || "-";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length > 0
      ? value.map((item) => String(item)).join(", ")
      : "-";
  }

  return JSON.stringify(value);
}

function prettifyFieldId(fieldId: string): string {
  return fieldId
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function buildAnswerLabelMap(questionnaire: QuestionnaireDefinition | null) {
  const labelMap = new Map<string, string>();
  const ratingRangeMap = new Map<string, { min: number; max: number }>();

  for (const section of questionnaire?.sections ?? []) {
    for (const field of section.fields) {
      labelMap.set(field.id, field.label);

      if (field.type === "rating") {
        ratingRangeMap.set(field.id, {
          min: field.min,
          max: field.max,
        });
      }
    }
  }

  return {
    labelMap,
    ratingRangeMap,
  };
}

function formatEntry(
  entry: QuestionnaireEntryDoc,
  labelMap: Map<string, string>,
  ratingRangeMap: Map<string, { min: number; max: number }>
): MatchSlotDetailsResponse["entries"][number] {
  const answerEntries = Object.entries(entry.answers ?? {});
  const answers = answerEntries.map(([fieldId, value]) => ({
    label: labelMap.get(fieldId) ?? prettifyFieldId(fieldId),
    value:
      typeof value === "number" && ratingRangeMap.has(fieldId)
        ? `${value}/${ratingRangeMap.get(fieldId)?.max ?? value}`
        : formatAnswerValue(value),
  }));

  return {
    entryId:
      entry.entryId ??
      entry.submissionId ??
      `${entry.matchNumber ?? "match"}-${entry.scoutingPosition ?? "slot"}-${entry.savedAt ?? "entry"}`,
    savedAt: formatSavedAt(entry.savedAt),
    teamNumber: entry.teamNumber ?? entry.setup?.teamNumber ?? null,
    teamName: entry.teamName ?? entry.setup?.teamName ?? null,
    scoutingPosition:
      entry.scoutingPosition ?? entry.setup?.scoutingPosition ?? null,
    teamPresence: entry.teamPresence ?? entry.setup?.teamPresence ?? null,
    answers,
  };
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { projectId } = await context.params;
    const matchNumber = Number(request.nextUrl.searchParams.get("matchNumber"));
    const slot = request.nextUrl.searchParams.get(
      "slot"
    ) as ScoutingScheduleSlot | null;

    if (!Number.isFinite(matchNumber) || !slot) {
      return NextResponse.json(
        { error: "Match number and slot are required." },
        { status: 400 }
      );
    }

    const project = await getScoutingProjectServer(projectId);

    if (!project) {
      return NextResponse.json(
        { error: "Scouting project not found." },
        { status: 404 }
      );
    }

    const [entries, questionnaire] = await Promise.all([
      getProjectMatchQuestionnaireEntriesForScheduleSlot(
        projectId,
        project.eventKey,
        matchNumber,
        slot
      ),
      resolveProjectQuestionnaireServer(project.activeQuestionnaireIds?.match),
    ]);

    const { labelMap, ratingRangeMap } = buildAnswerLabelMap(questionnaire);

    return NextResponse.json({
      entries: entries.map((entry) =>
        formatEntry(entry, labelMap, ratingRangeMap)
      ),
    } satisfies MatchSlotDetailsResponse);
  } catch (error) {
    console.error("Failed to load project match slot details:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Could not load project match slot details.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
