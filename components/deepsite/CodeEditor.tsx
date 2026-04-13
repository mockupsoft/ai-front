"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Monaco = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type Props = {
  value: string;
  onChange: (v: string) => void;
  path?: string;
};

export function CodeEditor({ value, onChange, path = "/" }: Props) {
  const language = useMemo(() => {
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".js") || path.endsWith(".mjs")) return "javascript";
    return "html";
  }, [path]);

  return (
    <Monaco
      height="100%"
      theme="vs-dark"
      language={language}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      options={{
        minimap: { enabled: true },
        fontSize: 13,
        wordWrap: "on",
        scrollBeyondLastLine: false,
      }}
    />
  );
}
