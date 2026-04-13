/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { MdSave } from "react-icons/md";

import Loading from "@/components/deepsite-v2/loading";
import { Button } from "@/components/deepsite-v2/ui/button";

export function SaveButton({
  html,
  prompts,
  onPersist,
}: {
  html: string;
  prompts: string[];
  /** When set, persist to MGX backend (PostgreSQL project). */
  onPersist?: (html: string, prompts: string[]) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const handlePersist = async () => {
    if (!onPersist) return;
    setLoading(true);
    try {
      await onPersist(html, prompts);
      toast.success("Project saved");
    } catch (err: any) {
      toast.error(err?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {onPersist && (
        <Button
          variant="default"
          size="sm"
          className="lg:hidden relative"
          onClick={handlePersist}
        >
          Save {loading && <Loading className="ml-2 size-4 animate-spin" />}
        </Button>
      )}
      <Button
        variant="default"
        className="max-lg:hidden !px-4 relative"
        onClick={() => {
          let filename = prompt("HTML file name:", "index.html");
          if (!filename) return;
          if (!filename.endsWith(".html")) filename += ".html";
          const blob = new Blob([html], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success("HTML downloaded");
        }}
      >
        {onPersist ? "Save to file" : "Save to File"}
        <MdSave className="ml-2" />
      </Button>
    </>
  );
}
