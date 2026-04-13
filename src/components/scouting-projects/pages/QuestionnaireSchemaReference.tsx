"use client";

import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";

const codeSx = {
  fontFamily: "monospace",
  fontSize: 12.5,
  backgroundColor: "rgba(15,23,42,0.04)",
  border: "1px solid rgba(15,23,42,0.08)",
  borderRadius: 1.5,
  p: 1.5,
  whiteSpace: "pre" as const,
  overflowX: "auto" as const,
};

function CodeBlock({ children }: { children: string }) {
  return <Box sx={codeSx}>{children}</Box>;
}

function PropRow({
  name,
  type,
  required,
  description,
}: {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}) {
  return (
    <TableRow>
      <TableCell sx={{ fontFamily: "monospace", fontSize: 12.5, py: 0.75 }}>
        {name}
        {required && (
          <Typography
            component="span"
            sx={{ color: "error.main", ml: 0.5, fontSize: 12 }}
          >
            *
          </Typography>
        )}
      </TableCell>
      <TableCell sx={{ py: 0.75 }}>
        <Chip
          label={type}
          size="small"
          sx={{ fontFamily: "monospace", fontSize: 11, height: 20 }}
        />
      </TableCell>
      <TableCell sx={{ py: 0.75, color: "text.secondary", fontSize: 13 }}>
        {description}
      </TableCell>
    </TableRow>
  );
}

function PropsTable({
  rows,
}: {
  rows: {
    name: string;
    type: string;
    required?: boolean;
    description: string;
  }[];
}) {
  return (
    <Table size="small" sx={{ "& td, & th": { borderColor: "divider" } }}>
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Property</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Type</TableCell>
          <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
            Description
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row) => (
          <PropRow key={row.name} {...row} />
        ))}
      </TableBody>
    </Table>
  );
}

function SectionHeading({ label, color }: { label: string; color?: string }) {
  return (
    <Typography
      variant="subtitle1"
      sx={{ fontWeight: 700, color: color ?? "text.primary" }}
    >
      {label}
    </Typography>
  );
}

type Props = {
  defaultExpanded?: boolean;
};

export default function QuestionnaireSchemaReference({
  defaultExpanded = false,
}: Props) {
  return (
    <Accordion
      disableGutters
      defaultExpanded={defaultExpanded}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px !important",
        boxShadow: "none",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Stack direction="row" spacing={1} alignItems="center">
          <MenuBookRoundedIcon
            fontSize="small"
            sx={{ color: "text.secondary" }}
          />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Questionnaire Schema Reference
          </Typography>
          <Typography variant="body2" color="text.secondary">
            — field types, sections, conditional visibility
          </Typography>
        </Stack>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3} sx={{ pt: 1 }}>
          {/* ── Top-level structure ── */}
          <Stack spacing={1.5}>
            <SectionHeading label="Top-Level Structure" />
            <Typography variant="body2" color="text.secondary">
              The root object for any questionnaire definition. The{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                id
              </Box>
              ,{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                version
              </Box>
              , and{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                name
              </Box>{" "}
              fields are managed automatically — only edit{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                sections
              </Box>{" "}
              and optionally{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                description
              </Box>
              .
            </Typography>
            <CodeBlock>{`{
  "id": "...",          // auto-managed, do not change
  "name": "...",        // editable via the Name field above
  "version": 1,         // auto-incremented on each save
  "description": "...", // optional summary shown to scouts
  "sections": [ ... ]
}`}</CodeBlock>
          </Stack>

          <Divider />

          {/* ── Sections ── */}
          <Stack spacing={1.5}>
            <SectionHeading label="Sections" />
            <Typography variant="body2" color="text.secondary">
              A questionnaire is divided into sections. Each section groups
              related fields and appears as a labeled group in the scouting
              form.
            </Typography>
            <CodeBlock>{`{
  "id": "auto_section",      // unique string ID within the questionnaire
  "title": "Autonomous",     // displayed as the section heading
  "description": "...",      // optional subtitle under the heading
  "fields": [ ... ]          // array of field objects (see below)
}`}</CodeBlock>
            <PropsTable
              rows={[
                {
                  name: "id",
                  type: "string",
                  required: true,
                  description:
                    "Unique identifier for this section. Use lowercase with underscores.",
                },
                {
                  name: "title",
                  type: "string",
                  required: true,
                  description: "Heading displayed to the scout.",
                },
                {
                  name: "description",
                  type: "string",
                  description:
                    "Optional subtitle shown beneath the section heading.",
                },
                {
                  name: "fields",
                  type: "Field[]",
                  required: true,
                  description: "Array of field objects. See field types below.",
                },
              ]}
            />
          </Stack>

          <Divider />

          {/* ── Field types ── */}
          <Stack spacing={2.5}>
            <SectionHeading label="Field Types" />
            <Typography variant="body2" color="text.secondary">
              Every field requires{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                id
              </Box>
              ,{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                type
              </Box>
              , and{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                label
              </Box>
              . The following additional properties are shared by all types:
            </Typography>
            <PropsTable
              rows={[
                {
                  name: "id",
                  type: "string",
                  required: true,
                  description:
                    "Unique field ID within the questionnaire. Used as the key in saved answer data.",
                },
                {
                  name: "type",
                  type: "string",
                  required: true,
                  description:
                    'One of: "text", "number", "select", "boolean", "rating".',
                },
                {
                  name: "label",
                  type: "string",
                  required: true,
                  description: "The question label shown to the scout.",
                },
                {
                  name: "required",
                  type: "boolean",
                  description:
                    "If true, the scout must answer this field before submitting. Defaults to false.",
                },
                {
                  name: "helpText",
                  type: "string",
                  description: "Small hint text displayed under the label.",
                },
                {
                  name: "visibleWhen",
                  type: "VisibilityConditionGroup",
                  description:
                    "Conditional logic that shows/hides this field based on other answers. See Conditional Visibility.",
                },
              ]}
            />

            {/* text */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="text"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Free-text input
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Single-line or multi-line text entry.
              </Typography>
              <CodeBlock>{`{
  "type": "text",
  "id": "auto_notes",
  "label": "Autonomous Notes",
  "helpText": "Briefly describe the auto routine.",
  "multiline": true,
  "placeholder": "e.g. scored 3 pieces, started left",
  "required": false
}`}</CodeBlock>
              <PropsTable
                rows={[
                  {
                    name: "multiline",
                    type: "boolean",
                    description:
                      "Renders a multi-line textarea instead of a single-line input.",
                  },
                  {
                    name: "placeholder",
                    type: "string",
                    description:
                      "Greyed-out hint text shown inside the input when empty.",
                  },
                ]}
              />
            </Stack>

            {/* number */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="number"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Numeric input
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Numeric entry with optional bounds and step size.
              </Typography>
              <CodeBlock>{`{
  "type": "number",
  "id": "teleop_cycles",
  "label": "Teleop Cycles",
  "min": 0,
  "max": 30,
  "step": 1,
  "required": true
}`}</CodeBlock>
              <PropsTable
                rows={[
                  {
                    name: "min",
                    type: "number",
                    description: "Minimum allowed value.",
                  },
                  {
                    name: "max",
                    type: "number",
                    description: "Maximum allowed value.",
                  },
                  {
                    name: "step",
                    type: "number",
                    description: "Increment amount for the +/− controls.",
                  },
                ]}
              />
            </Stack>

            {/* select */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="select"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Dropdown / single-choice
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Scout picks one option from a defined list. The{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  value
                </Box>{" "}
                is what gets saved;{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  label
                </Box>{" "}
                is what the scout sees.
              </Typography>
              <CodeBlock>{`{
  "type": "select",
  "id": "endgame_status",
  "label": "Endgame Status",
  "required": true,
  "options": [
    { "label": "None",   "value": "none" },
    { "label": "Parked", "value": "parked" },
    { "label": "Climb",  "value": "climb" },
    { "label": "Failed", "value": "failed" }
  ]
}`}</CodeBlock>
              <PropsTable
                rows={[
                  {
                    name: "options",
                    type: "{ label, value }[]",
                    required: true,
                    description:
                      'Array of choice objects. "label" is displayed; "value" is stored in the answer.',
                  },
                ]}
              />
            </Stack>

            {/* boolean */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="boolean"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Yes / No toggle
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                A single checkbox or toggle. Saves{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  true
                </Box>{" "}
                or{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  false
                </Box>
                . Commonly used as a condition target for{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  visibleWhen
                </Box>
                .
              </Typography>
              <CodeBlock>{`{
  "type": "boolean",
  "id": "played_defense",
  "label": "Played Defense?",
  "helpText": "Check if this robot played defense during teleop."
}`}</CodeBlock>
            </Stack>

            {/* rating */}
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label="rating"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Star / numeric rating
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                A bounded scale selector.{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  min
                </Box>{" "}
                and{" "}
                <Box
                  component="span"
                  sx={{ fontFamily: "monospace", fontSize: 12.5 }}
                >
                  max
                </Box>{" "}
                are required. Typical usage is 1–5.
              </Typography>
              <CodeBlock>{`{
  "type": "rating",
  "id": "driver_skill",
  "label": "Driver Skill",
  "helpText": "1 = poor, 5 = excellent",
  "min": 1,
  "max": 5,
  "required": true
}`}</CodeBlock>
              <PropsTable
                rows={[
                  {
                    name: "min",
                    type: "number",
                    required: true,
                    description: "Minimum rating value.",
                  },
                  {
                    name: "max",
                    type: "number",
                    required: true,
                    description: "Maximum rating value.",
                  },
                ]}
              />
            </Stack>
          </Stack>

          <Divider />

          {/* ── Conditional visibility ── */}
          <Stack spacing={1.5}>
            <SectionHeading label="Conditional Visibility (visibleWhen)" />
            <Typography variant="body2" color="text.secondary">
              Any field can include a{" "}
              <Box
                component="span"
                sx={{ fontFamily: "monospace", fontSize: 12.5 }}
              >
                visibleWhen
              </Box>{" "}
              property to conditionally show or hide it based on the current
              answers. Hidden fields are also excluded from required-field
              validation. Groups can be nested for complex logic.
            </Typography>
            <CodeBlock>{`// Show "Defense Effectiveness" only when "Played Defense?" is checked
{
  "type": "rating",
  "id": "defense_effectiveness",
  "label": "Defense Effectiveness",
  "min": 1,
  "max": 5,
  "visibleWhen": {
    "mode": "all",
    "rules": [
      { "fieldId": "played_defense", "operator": "isTruthy" }
    ]
  }
}`}</CodeBlock>
            <CodeBlock>{`// Show a field only when a select answer is one of several values
"visibleWhen": {
  "mode": "any",
  "rules": [
    { "fieldId": "endgame_status", "operator": "in", "value": ["climb", "parked"] }
  ]
}`}</CodeBlock>
            <PropsTable
              rows={[
                {
                  name: "mode",
                  type: '"all" | "any"',
                  required: true,
                  description:
                    '"all" = every rule must pass (AND). "any" = at least one rule must pass (OR).',
                },
                {
                  name: "rules",
                  type: "(Rule | Group)[]",
                  required: true,
                  description:
                    "Array of individual rules or nested condition groups.",
                },
              ]}
            />

            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              Rule object
            </Typography>
            <PropsTable
              rows={[
                {
                  name: "fieldId",
                  type: "string",
                  required: true,
                  description:
                    "The id of the field whose answer is being checked.",
                },
                {
                  name: "operator",
                  type: "VisibilityOperator",
                  required: true,
                  description:
                    "How to compare the answer. See operator table below.",
                },
                {
                  name: "value",
                  type: "string | number | boolean | null | array",
                  description:
                    'The comparison value. Not required for "isTruthy" and "isFalsy".',
                },
              ]}
            />

            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              Operators
            </Typography>
            <Table
              size="small"
              sx={{ "& td, & th": { borderColor: "divider" } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Operator
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    Meaning
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                    value required?
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  ["equals", "Answer strictly equals value", "Yes"],
                  ["notEquals", "Answer does not equal value", "Yes"],
                  ["greaterThan", "Answer > value (numbers)", "Yes"],
                  ["greaterThanOrEqual", "Answer ≥ value (numbers)", "Yes"],
                  ["lessThan", "Answer < value (numbers)", "Yes"],
                  ["lessThanOrEqual", "Answer ≤ value (numbers)", "Yes"],
                  ["in", "Answer is one of the values array", "Yes (array)"],
                  ["notIn", "Answer is not in the values array", "Yes (array)"],
                  [
                    "isTruthy",
                    "Answer is truthy (non-empty, non-zero, true)",
                    "No",
                  ],
                  ["isFalsy", "Answer is falsy (empty, 0, false, null)", "No"],
                ].map(([op, meaning, req]) => (
                  <TableRow key={op}>
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: 12, py: 0.75 }}
                    >
                      {op}
                    </TableCell>
                    <TableCell
                      sx={{ py: 0.75, fontSize: 13, color: "text.secondary" }}
                    >
                      {meaning}
                    </TableCell>
                    <TableCell
                      sx={{ py: 0.75, fontSize: 13, color: "text.secondary" }}
                    >
                      {req}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Stack>

          <Divider />

          {/* ── Full example ── */}
          <Stack spacing={1.5}>
            <SectionHeading label="Minimal Full Example" />
            <Typography variant="body2" color="text.secondary">
              A complete questionnaire with one section, demonstrating multiple
              field types and conditional visibility.
            </Typography>
            <CodeBlock>{`{
  "id": "your-questionnaire-id",
  "name": "My Match Questionnaire",
  "version": 1,
  "description": "Simple match scouting form.",
  "sections": [
    {
      "id": "teleop",
      "title": "Teleop",
      "fields": [
        {
          "type": "number",
          "id": "cycles",
          "label": "Scoring Cycles",
          "min": 0,
          "max": 30,
          "step": 1,
          "required": true
        },
        {
          "type": "boolean",
          "id": "played_defense",
          "label": "Played Defense?"
        },
        {
          "type": "rating",
          "id": "defense_rating",
          "label": "Defense Effectiveness",
          "min": 1,
          "max": 5,
          "visibleWhen": {
            "mode": "all",
            "rules": [
              { "fieldId": "played_defense", "operator": "isTruthy" }
            ]
          }
        },
        {
          "type": "select",
          "id": "endgame",
          "label": "Endgame Status",
          "required": true,
          "options": [
            { "label": "None",   "value": "none" },
            { "label": "Parked", "value": "parked" },
            { "label": "Climb",  "value": "climb" }
          ]
        },
        {
          "type": "text",
          "id": "notes",
          "label": "Notes",
          "multiline": true,
          "placeholder": "Anything else worth noting?"
        }
      ]
    }
  ]
}`}</CodeBlock>
          </Stack>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
