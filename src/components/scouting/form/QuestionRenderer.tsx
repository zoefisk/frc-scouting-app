import React from "react";

import type { QuestionnaireFieldDefinition } from "@/lib/scouting/questionnaire/types";
import TextFieldQuestion from "@/components/scouting/form/fields/TextFieldQuestion";
import NumberFieldQuestion from "@/components/scouting/form/fields/NumberFieldQuestion";
import SelectFieldQuestion from "@/components/scouting/form/fields/SelectFieldQuestion";
import BooleanFieldQuestion from "@/components/scouting/form/fields/BooleanFieldQuestion";
import RatingFieldQuestion from "@/components/scouting/form/fields/RatingFieldQuestion";

type Props = {
  field: QuestionnaireFieldDefinition;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
};

export default function QuestionRenderer({
  field,
  value,
  error,
  onChange,
}: Props) {
  switch (field.type) {
    case "text":
      return (
        <TextFieldQuestion
          field={field}
          value={typeof value === "string" ? value : ""}
          error={error}
          onChange={onChange}
        />
      );

    case "number":
      return (
        <NumberFieldQuestion
          field={field}
          value={typeof value === "number" ? value : null}
          error={error}
          onChange={onChange}
        />
      );

    case "select":
      return (
        <SelectFieldQuestion
          field={field}
          value={typeof value === "string" ? value : ""}
          error={error}
          onChange={onChange}
        />
      );

    case "boolean":
      return (
        <BooleanFieldQuestion
          field={field}
          value={typeof value === "boolean" ? value : null}
          error={error}
          onChange={onChange}
        />
      );

    case "rating":
      return (
        <RatingFieldQuestion
          field={field}
          value={typeof value === "number" ? value : null}
          error={error}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}
