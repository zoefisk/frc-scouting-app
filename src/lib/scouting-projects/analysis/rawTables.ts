import type {
  QuestionnaireDefinition,
  QuestionnaireFieldDefinition,
} from "@/lib/scouting/questionnaire/types";
import type { QuestionnaireEntryDoc } from "@/lib/firebase/server/entries";

export type ProjectRawTableColumn = {
  field: string;
  headerName: string;
};

export type ProjectRawTableRow = Record<string, string | number | null> & {
  id: string;
};

export type ProjectRawTable = {
  title: string;
  description: string;
  columns: ProjectRawTableColumn[];
  rows: ProjectRawTableRow[];
};

type BuildQuestionnaireRawTableOptions = {
  title: string;
  description: string;
  questionnaire: QuestionnaireDefinition | null;
  entries: QuestionnaireEntryDoc[];
  kind: "match" | "pit";
  extraColumns?: ProjectRawTableColumn[];
  getBaseRowValues?: (
    entry: QuestionnaireEntryDoc,
    index: number
  ) => ProjectRawTableRow;
};

export function formatSavedAt(value: string | null | undefined): string {
  if (!value) {
    return "-";
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

export function formatAnswerValue(
  value: unknown,
  field?: QuestionnaireFieldDefinition
): string | number | null {
  if (value == null) {
    return null;
  }

  if (field?.type === "rating" && typeof value === "number") {
    return `${value}/${field.max}`;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return JSON.stringify(value);
}

export function buildQuestionnaireRawTable({
  title,
  description,
  questionnaire,
  entries,
  kind,
  extraColumns = [],
  getBaseRowValues,
}: BuildQuestionnaireRawTableOptions): ProjectRawTable | null {
  if (!questionnaire) {
    return null;
  }

  const columns: ProjectRawTableColumn[] = [
    { field: "savedAt", headerName: "Saved" },
    ...extraColumns,
  ];

  if (kind === "match" && extraColumns.length === 0) {
    columns.push(
      { field: "matchNumber", headerName: "Match" },
      { field: "scoutingPosition", headerName: "Pos" },
      { field: "teamPresence", headerName: "Present" }
    );
  }

  const fieldMap = new Map<string, QuestionnaireFieldDefinition>();

  for (const section of questionnaire.sections) {
    for (const field of section.fields) {
      fieldMap.set(field.id, field);
      columns.push({
        field: field.id,
        headerName: field.label,
      });
    }
  }

  const rows = entries.map((entry, index) => {
    const baseRow: ProjectRawTableRow = getBaseRowValues
      ? getBaseRowValues(entry, index)
      : {
          id:
            entry.entryId ??
            entry.submissionId ??
            `${kind}-${entry.matchNumber ?? "pit"}-${index}`,
          savedAt: formatSavedAt(entry.savedAt),
          matchNumber: entry.matchNumber ?? null,
          scoutingPosition: entry.scoutingPosition ?? null,
          teamPresence: entry.teamPresence ?? null,
        };

    for (const section of questionnaire.sections) {
      for (const field of section.fields) {
        baseRow[field.id] = formatAnswerValue(entry.answers?.[field.id], field);
      }
    }

    return baseRow;
  });

  return {
    title,
    description,
    columns,
    rows,
  };
}
