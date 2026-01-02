"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
      </div>
    ),
  }
);

export interface CodeEditorFile {
  name: string;
  content: string;
  language?: string;
}

interface CodeEditorProps {
  file?: CodeEditorFile;
  onChange?: (value: string | undefined) => void;
  readOnly?: boolean;
  className?: string;
}

function getLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    html: "html",
    css: "css",
    json: "json",
    md: "markdown",
    yaml: "yaml",
    yml: "yaml",
    xml: "xml",
    sh: "shell",
    bash: "shell",
    php: "php",
    java: "java",
    cpp: "cpp",
    c: "c",
    go: "go",
    rs: "rust",
    rb: "ruby",
    sql: "sql",
    vue: "vue",
    svelte: "svelte",
  };
  return languageMap[ext] || "plaintext";
}

export function CodeEditor({
  file,
  onChange,
  readOnly = false,
  className,
}: CodeEditorProps) {
  const language = React.useMemo(() => {
    if (file?.language) return file.language;
    if (file?.name) return getLanguageFromFilename(file.name);
    return "plaintext";
  }, [file?.language, file?.name]);

  if (!file) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <p className="text-sm">No file selected</p>
          <p className="text-xs mt-2">Select a file from the file tree to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full", className)}>
      <Editor
        height="100%"
        language={language}
        value={file.content}
        onChange={onChange}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: "on",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: "selection",
          tabSize: 2,
          insertSpaces: true,
        }}
      />
    </div>
  );
}


