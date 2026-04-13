import type { HtmlHistory } from "@/lib/deepsite/deepsite-v2-types";
import { useState } from "react";

export const useEditor = (defaultHtml: string) => {
  const [html, setHtml] = useState(defaultHtml);
  const [htmlHistory, setHtmlHistory] = useState<HtmlHistory[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);

  return {
    html,
    setHtml,
    htmlHistory,
    setHtmlHistory,
    prompts,
    setPrompts,
  };
};
