import type {
  AllianceTeamSetup,
  ScoutingSetupState,
} from "@/components/scouting/submission/types";
import {
  getAlliancePerfFieldId,
  PERF_FIELDS,
} from "@/lib/scouting/performanceRatings";
import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
} from "@/lib/scouting/questionnaire/types";
import type { TeamOption } from "@/lib/scouting/tba/loadEventTeams";

type SubmissionTeamInfo = {
  teamKey: string | null;
  teamNumber: number | null;
  teamName: string;
};

function getTeamInfo(team: TeamOption | null | undefined): SubmissionTeamInfo {
  return {
    teamKey: team?.key ?? null,
    teamNumber: team?.team_number ?? null,
    teamName: team?.nickname ?? team?.name ?? team?.key ?? "",
  };
}

function buildAllianceTeamsMetadata(
  allianceTeams: AllianceTeamSetup[] | undefined
) {
  return (allianceTeams ?? []).map((entry) => ({
    slot: entry.slot,
    teamKey: entry.team?.key ?? null,
    teamNumber: entry.team?.team_number ?? null,
    teamName: entry.team?.nickname ?? entry.team?.name ?? entry.team?.key ?? "",
    teamPresence: entry.teamPresence,
    robotPosition: entry.robotPosition,
  }));
}

function buildAnswersForTeam(
  answers: QuestionnaireAnswers,
  team: TeamOption
): QuestionnaireAnswers {
  const nextAnswers: QuestionnaireAnswers = { ...answers };

  for (const field of PERF_FIELDS) {
    const teamSpecificValue =
      answers[getAlliancePerfFieldId(team.key, field.id)];

    if (typeof teamSpecificValue === "number") {
      nextAnswers[field.id] = teamSpecificValue;
    } else {
      delete nextAnswers[field.id];
    }
  }

  return nextAnswers;
}

export function buildGenericQuestionnairePayload(
  questionnaire: QuestionnaireDefinition,
  answers: QuestionnaireAnswers,
  setup: ScoutingSetupState,
  submissionId: string
) {
  const numericMatchNumber = setup.matchNumber
    ? Number(setup.matchNumber)
    : null;
  const selectedTeam = setup.selectedTeam;
  const selectedTeamInfo = getTeamInfo(selectedTeam);

  return {
    v: 1,
    type: "questionnaire_response",
    submissionId,
    projectId: setup.projectId ?? null,
    eventKey: setup.eventKey,
    matchNumber: numericMatchNumber,
    scoutingPosition: setup.scoutingPosition ?? null,
    teamPresence: setup.teamPresence ?? null,
    teamKey: selectedTeamInfo.teamKey,
    teamNumber: selectedTeamInfo.teamNumber,
    teamName: selectedTeamInfo.teamName,
    selectedTeamKey: selectedTeamInfo.teamKey,
    questionnaire: {
      id: questionnaire.id,
      name: questionnaire.name,
      version: questionnaire.version,
    },
    setup: {
      kind: setup.kind,
      projectId: setup.projectId ?? null,
      eventKey: setup.eventKey,
      matchCollectionMode: setup.matchCollectionMode ?? "robot",
      matchNumber: numericMatchNumber,
      scoutingPosition: setup.scoutingPosition ?? null,
      teamPresence: setup.teamPresence ?? null,
      teamKey: selectedTeamInfo.teamKey,
      teamNumber: selectedTeamInfo.teamNumber,
      teamName: selectedTeamInfo.teamName,
      allianceTeams: buildAllianceTeamsMetadata(setup.allianceTeams),
    },
    answers,
    savedAt: new Date().toISOString(),
  };
}

export function buildMatchQuestionnairePayloads(
  questionnaire: QuestionnaireDefinition,
  answers: QuestionnaireAnswers,
  setup: ScoutingSetupState,
  idFactory: (teamKey?: string | null) => string
) {
  if (setup.kind !== "match" || setup.matchCollectionMode !== "alliance") {
    const entryId = idFactory(setup.selectedTeam?.key ?? null);
    return [
      {
        entryId,
        teamKey: setup.selectedTeam?.key ?? null,
        payload: {
          ...buildGenericQuestionnairePayload(
            questionnaire,
            answers,
            setup,
            entryId
          ),
          entryId,
        },
      },
    ];
  }

  const allianceTeams = (setup.allianceTeams ?? []).filter(
    (entry): entry is AllianceTeamSetup & { team: TeamOption } =>
      entry.team != null
  );

  return allianceTeams.map((entry) => {
    const entryId = idFactory(entry.team.key);

    return {
      entryId,
      teamKey: entry.team.key,
      payload: {
        ...buildGenericQuestionnairePayload(
          questionnaire,
          buildAnswersForTeam(answers, entry.team),
          {
            ...setup,
            teamPresence: entry.teamPresence,
            selectedTeam: entry.team,
          },
          entryId
        ),
        entryId,
      },
    };
  });
}
