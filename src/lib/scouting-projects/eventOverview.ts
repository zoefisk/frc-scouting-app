import { getEvent, getEventMatches } from "@/lib/scouting/tba/service";
import type { RawTbaEvent, RawTbaMatch } from "@/lib/scouting/tba/types";

export type ProjectEventOverview = {
  statusLabel: string;
  statusTone: "neutral" | "active" | "success";
  eventDateLabel: string | null;
};

function formatEventDateRange(event: RawTbaEvent): string | null {
  if (!event.start_date) {
    return null;
  }

  const start = new Date(`${event.start_date}T12:00:00`);
  const end = new Date(`${event.end_date ?? event.start_date}T12:00:00`);

  const sameDay = event.start_date === (event.end_date ?? event.start_date);
  const sameMonth = start.getMonth() === end.getMonth();

  if (sameDay) {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(start);
  }

  if (sameMonth) {
    const monthYear = new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(start);
    return `${monthYear} ${start.getDate()}-${end.getDate()}`;
  }

  const startText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start);
  const endText = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);

  return `${startText} - ${endText}`;
}

function isMatchPlayed(match: RawTbaMatch): boolean {
  const hasScores =
    match.alliances.blue.score !== -1 && match.alliances.red.score !== -1;

  const hasWinner =
    typeof match.winning_alliance === "string" &&
    match.winning_alliance.length > 0;

  const hasActualTime =
    typeof match.actual_time === "number" && match.actual_time > 0;

  return hasScores || hasWinner || hasActualTime;
}

function getCurrentQualificationMatchNumber(
  matches: RawTbaMatch[]
): number | null {
  const qualificationMatches = matches
    .filter((match) => match.comp_level === "qm")
    .sort((a, b) => a.match_number - b.match_number);

  if (qualificationMatches.length === 0) {
    return null;
  }

  const nextUnplayed = qualificationMatches.find(
    (match) => !isMatchPlayed(match)
  );
  return nextUnplayed?.match_number ?? null;
}

export async function getProjectEventOverview(
  eventKey: string
): Promise<ProjectEventOverview | null> {
  try {
    const [event, matches] = await Promise.all([
      getEvent(eventKey),
      getEventMatches(eventKey),
    ]);

    const today = new Date();
    const startDate = event.start_date
      ? new Date(`${event.start_date}T00:00:00`)
      : null;
    const endDate = event.end_date
      ? new Date(`${event.end_date}T23:59:59`)
      : startDate;

    const currentQualificationMatch =
      getCurrentQualificationMatchNumber(matches);
    const allMatchesPlayed =
      matches.length > 0 && matches.every((match) => isMatchPlayed(match));

    if (startDate && today < startDate) {
      return {
        statusLabel: "Event has not started yet",
        statusTone: "neutral",
        eventDateLabel: formatEventDateRange(event),
      };
    }

    if (
      allMatchesPlayed ||
      (endDate && today > endDate && currentQualificationMatch == null)
    ) {
      return {
        statusLabel: "All matches are complete",
        statusTone: "success",
        eventDateLabel: formatEventDateRange(event),
      };
    }

    if (currentQualificationMatch != null) {
      return {
        statusLabel: `Current match: ${currentQualificationMatch}`,
        statusTone: "active",
        eventDateLabel: formatEventDateRange(event),
      };
    }

    return {
      statusLabel: "Event in progress",
      statusTone: "active",
      eventDateLabel: formatEventDateRange(event),
    };
  } catch (error) {
    console.error("Failed to build project event overview:", error);
    return null;
  }
}
