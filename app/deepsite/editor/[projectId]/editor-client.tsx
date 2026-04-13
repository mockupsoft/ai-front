"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AppEditor } from "@/components/deepsite-v2/editor";
import { DEEPSITE_SKIP_AUTH } from "@/lib/deepsite/env";
import { updateProject } from "@/lib/deepsite/api-client";
import { useDeepSiteAuth } from "@/lib/deepsite/auth-context";
import type { Project as V2Project } from "@/lib/deepsite/deepsite-v2-types";
import type { ChatHistoryPayload } from "@/lib/deepsite/types";
import { toast } from "sonner";

interface EditorClientProps {
  projectId: string;
  projectData: Record<string, unknown>;
  initialHtml: string;
  initialLiveUrl: string | null;
}

export function EditorClient({
  projectId,
  projectData,
  initialHtml,
  initialLiveUrl,
}: EditorClientProps) {
  const router = useRouter();
  const { token } = useDeepSiteAuth();

  const projectFiles = useMemo(() => {
    const raw = projectData.files as
      | Array<{ path?: string; content?: string }>
      | undefined;
    if (!raw || !Array.isArray(raw)) return null;
    const out: Record<string, string> = {};
    for (const row of raw) {
      if (row.path && typeof row.content === "string") {
        out[row.path] = row.content;
      }
    }
    return Object.keys(out).length > 0 ? out : null;
  }, [projectData.files]);

  const v2Project: V2Project = {
    id: projectId,
    title: (projectData.name as string) ?? "Untitled",
    html: initialHtml,
    prompts: [],
    user_id: (projectData.user_id as string) ?? "",
    space_id: "local",
  };

  const [initialChatHistory] = useState<ChatHistoryPayload | null>(
    (projectData.chat_history as ChatHistoryPayload) ?? null
  );

  const [liveUrl, setLiveUrl] = useState<string | null>(initialLiveUrl);

  const chatSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePersist = async (html: string, _prompts: string[]) => {
    try {
      await updateProject(DEEPSITE_SKIP_AUTH ? null : token, projectId, {
        pages: [{ path: "/", html }],
      });
      toast.success("Saved to project");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
      throw e;
    }
  };

  const handleSaveChatHistory = useCallback(
    (items: unknown[], artifacts: unknown) => {
      if (chatSaveTimerRef.current) clearTimeout(chatSaveTimerRef.current);
      chatSaveTimerRef.current = setTimeout(async () => {
        try {
          await updateProject(DEEPSITE_SKIP_AUTH ? null : token, projectId, {
            chat_history: items.length > 0 ? { items, artifacts } : null,
          });
        } catch {
          // sessizce başarısız ol
        }
      }, 3000);
    },
    [token, projectId]
  );

  return (
    <AppEditor
      project={v2Project}
      onPersist={handlePersist}
      initialChatHistory={initialChatHistory}
      onSaveChatHistory={handleSaveChatHistory}
      initialLiveUrl={liveUrl}
      projectFiles={projectFiles}
    />
  );
}
