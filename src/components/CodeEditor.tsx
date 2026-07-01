import Editor from "@monaco-editor/react";
import { useTheme } from "next-themes";
import type { Theme } from "../types";

interface CodeEditorProps {
  language: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
  placeholder?: string;
}

const MONACO_THEMES: Record<Theme, string> = {
  dark: "vs-dark",
  light: "vs-light",
  system: "vs-dark",
};

export default function CodeEditor({
  language,
  value,
  onChange,
  readOnly = false,
  height = "380px",
}: CodeEditorProps) {
  const { resolvedTheme } = useTheme();
  const theme = (resolvedTheme ?? "light") as Theme;

  return (
    <Editor
      height={height}
      language={language}
      value={value}
      theme={MONACO_THEMES[theme]}
      onChange={(v) => onChange?.(v ?? "")}
      options={{
        readOnly,
        minimap: { enabled: false },
        fontSize: 13,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "none",
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        fontLigatures: true,
        tabSize: 2,
        wordWrap: "on",
        automaticLayout: true,
        contextmenu: true,
        scrollbar: {
          verticalScrollbarSize: 8,
          horizontalScrollbarSize: 8,
        },
      }}
    />
  );
}
