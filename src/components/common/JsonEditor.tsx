import React from "react";
import { Box } from "@mui/material";

const LINE_HEIGHT = 20;
const V_PAD = 8;

type Props = {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  showLineNumbers?: boolean;
};

export default function JsonEditor({
  value,
  onChange,
  disabled = false,
  minHeight = 400,
  maxHeight = 620,
  showLineNumbers = true,
}: Props) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const gutterRef = React.useRef<HTMLDivElement>(null);

  const lineCount = Math.max(1, value.split("\n").length);
  const contentHeight = lineCount * LINE_HEIGHT + V_PAD * 2;
  const editorHeight = Math.min(maxHeight, Math.max(minHeight, contentHeight));

  const syncScroll = React.useCallback(() => {
    if (showLineNumbers && gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [showLineNumbers]);

  return (
    <Box
      sx={{
        display: "flex",
        height: editorHeight,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 1,
        overflow: "hidden",
        fontFamily: "monospace",
        fontSize: 13,
        lineHeight: `${LINE_HEIGHT}px`,
        transition: "height 0.1s ease",
        "&:focus-within": {
          outline: "2px solid",
          outlineColor: "primary.main",
          outlineOffset: -1,
        },
      }}
    >
      {showLineNumbers ? (
        <Box
          ref={gutterRef}
          aria-hidden
          sx={{
            flexShrink: 0,
            width: 44,
            overflowY: "hidden",
            bgcolor: "rgba(15,23,42,0.04)",
            borderRight: "1px solid",
            borderColor: "divider",
            pt: `${V_PAD}px`,
            pb: `${V_PAD}px`,
            pr: 1,
            textAlign: "right",
            userSelect: "none",
            color: "text.disabled",
            fontSize: 12,
            lineHeight: `${LINE_HEIGHT}px`,
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </Box>
      ) : null}

      <Box
        component="textarea"
        ref={textareaRef}
        value={value}
        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
          onChange(event.target.value)
        }
        onScroll={syncScroll}
        disabled={disabled}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        sx={{
          flex: 1,
          height: "100%",
          resize: "none",
          border: "none",
          outline: "none",
          fontFamily: "monospace",
          fontSize: 13,
          lineHeight: `${LINE_HEIGHT}px`,
          p: `${V_PAD}px 12px`,
          overflowY: "auto",
          bgcolor: disabled ? "rgba(15,23,42,0.02)" : "background.paper",
          color: "text.primary",
        }}
      />
    </Box>
  );
}
