"use client";

import * as React from "react";
import { Download, Copy, FileDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import { downloadArtifact } from "@/lib/api";
import type { Artifact } from "@/lib/types";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

export type ResultsViewerProps = {
  artifacts: Artifact[];
  taskId: string;
  runId: string;
};

function downloadTextFile(filename: string, content: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export function ResultsViewer({ artifacts, taskId, runId }: ResultsViewerProps) {
  const [filter, setFilter] = React.useState<Artifact["type"] | "all">("all");

  const filtered = React.useMemo(() => {
    if (filter === "all") return artifacts;
    return artifacts.filter((a) => a.type === filter);
  }, [artifacts, filter]);

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  };

  const exportAll = () => {
    downloadTextFile(
      `mgx-results-${taskId}-${runId}.json`,
      JSON.stringify(artifacts, null, 2),
    );
  };

  if (!artifacts || artifacts.length === 0) {
    return <div className="text-sm text-zinc-600 dark:text-zinc-400">No artifacts yet.</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant={filter === "all" ? "primary" : "secondary"}
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={filter === "code" ? "primary" : "secondary"}
            onClick={() => setFilter("code")}
          >
            Code
          </Button>
          <Button
            size="sm"
            variant={filter === "test" ? "primary" : "secondary"}
            onClick={() => setFilter("test")}
          >
            Tests
          </Button>
          <Button
            size="sm"
            variant={filter === "review" ? "primary" : "secondary"}
            onClick={() => setFilter("review")}
          >
            Review
          </Button>
        </div>
        <Button size="sm" variant="ghost" onClick={exportAll} className="justify-start">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      <div className="space-y-4">
        {filtered.map((artifact) => (
          <Card key={artifact.id}>
            <CardHeader>
              <div className="space-y-0.5">
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {artifact.name}
                  <StatusPill variant="neutral">{artifact.type}</StatusPill>
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(artifact.content)}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => downloadArtifact(taskId, runId, artifact.id)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
                <SyntaxHighlighter
                  language={artifact.language || (artifact.type === "code" ? "typescript" : "text")}
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, borderRadius: 0 }}
                  showLineNumbers
                >
                  {artifact.content}
                </SyntaxHighlighter>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
