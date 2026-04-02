// src/lib/scouting/responses/types.ts

import { QuestionnaireAnswers } from "@/lib/scouting/questionnaire/types";

export type QuestionnaireResponseRecord = {
  responseId: string;
  questionnaireId: string;
  questionnaireVersion: number;
  answers: QuestionnaireAnswers;

  createdAt: string;
  updatedAt: string;

  eventKey?: string;
  matchNumber?: number;
  teamKey?: string;
  teamNumber?: number;
  scoutingPosition?: string;
  teamPresence?: string;
};

export type BuildQuestionnaireResponseInput = {
  responseId: string;
  questionnaireId: string;
  questionnaireVersion: number;
  answers: QuestionnaireAnswers;

  eventKey?: string;
  matchNumber?: number;
  teamKey?: string;
  teamNumber?: number;
  scoutingPosition?: string;
  teamPresence?: string;
};
