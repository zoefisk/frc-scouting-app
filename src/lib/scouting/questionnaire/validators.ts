// src/lib/scouting/questionnaires/validators.ts

import type {
  QuestionnaireAnswers,
  QuestionnaireDefinition,
  QuestionnaireFieldDefinition,
  VisibilityConditionGroup,
  VisibilityRule,
} from "@/lib/scouting/questionnaire/types";

function isEmptyValue(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function evaluateSingleRule(
  rule: VisibilityRule,
  answers: QuestionnaireAnswers
): boolean {
  const actual = answers[rule.fieldId];

  switch (rule.operator) {
    case "equals":
      return actual === rule.value;

    case "notEquals":
      return actual !== rule.value;

    case "greaterThan":
      return typeof actual === "number" && actual > Number(rule.value);

    case "greaterThanOrEqual":
      return typeof actual === "number" && actual >= Number(rule.value);

    case "lessThan":
      return typeof actual === "number" && actual < Number(rule.value);

    case "lessThanOrEqual":
      return typeof actual === "number" && actual <= Number(rule.value);

    case "in":
      return Array.isArray(rule.value) && rule.value.includes(actual as never);

    case "notIn":
      return Array.isArray(rule.value) && !rule.value.includes(actual as never);

    case "isTruthy":
      return Boolean(actual);

    case "isFalsy":
      return !actual;

    default:
      return true;
  }
}

export function evaluateVisibility(
  condition: VisibilityConditionGroup | undefined,
  answers: QuestionnaireAnswers
): boolean {
  if (!condition) {
    return true;
  }

  const results = condition.rules.map(
    (rule: VisibilityRule | VisibilityConditionGroup) =>
      "rules" in rule
        ? evaluateVisibility(rule, answers)
        : evaluateSingleRule(rule, answers)
  );

  return condition.mode === "all"
    ? results.every(Boolean)
    : results.some(Boolean);
}

export function isFieldVisible(
  field: QuestionnaireFieldDefinition,
  answers: QuestionnaireAnswers
): boolean {
  return evaluateVisibility(field.visibleWhen, answers);
}

export function getVisibleFields(
  definition: QuestionnaireDefinition,
  answers: QuestionnaireAnswers
): QuestionnaireFieldDefinition[] {
  return definition.sections.flatMap((section) =>
    section.fields.filter((field) => isFieldVisible(field, answers))
  );
}

export function validateQuestionnaireAnswers(
  definition: QuestionnaireDefinition,
  answers: QuestionnaireAnswers
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const section of definition.sections) {
    for (const field of section.fields) {
      if (!isFieldVisible(field, answers)) {
        continue;
      }

      const value = answers[field.id];

      if (field.required && isEmptyValue(value)) {
        errors[field.id] = "This field is required.";
        continue;
      }

      if (isEmptyValue(value)) {
        continue;
      }

      if (field.type === "number" || field.type === "rating") {
        if (typeof value !== "number" || Number.isNaN(value)) {
          errors[field.id] = "Please enter a valid number.";
          continue;
        }

        if ("min" in field && field.min != null && value < field.min) {
          errors[field.id] = `Value must be at least ${field.min}.`;
        }

        if ("max" in field && field.max != null && value > field.max) {
          errors[field.id] = `Value must be at most ${field.max}.`;
        }
      }

      if (field.type === "select") {
        const allowed = field.options.map((option) => option.value);
        if (typeof value !== "string" || !allowed.includes(value)) {
          errors[field.id] = "Please select a valid option.";
        }
      }

      if (field.type === "boolean" && typeof value !== "boolean") {
        errors[field.id] = "Please choose yes or no.";
      }

      if (field.type === "text" && typeof value !== "string") {
        errors[field.id] = "Please enter text.";
      }
    }
  }

  return errors;
}
