"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useMemo, useCallback } from "react";
import classNames from "classnames";
import { toast } from "sonner";
import { useLocalStorage, useUpdateEffect } from "react-use";
import { ArrowUp, Crosshair } from "lucide-react";
import { FaStopCircle } from "react-icons/fa";

import { Button } from "@/components/deepsite-v2/ui/button";
import { MODELS } from "@/lib/deepsite/providers";
import { HtmlHistory } from "@/lib/deepsite/deepsite-v2-types";
import { InviteFriends } from "@/components/deepsite-v2/invite-friends";
import { Settings } from "@/components/deepsite-v2/editor/ask-ai/settings";
import { ReImagine } from "@/components/deepsite-v2/editor/ask-ai/re-imagine";
import Loading from "@/components/deepsite-v2/loading";
import { Checkbox } from "@/components/deepsite-v2/ui/checkbox";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/deepsite-v2/ui/tooltip";

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
import { SelectedHtmlElement } from "./selected-html-element";
import { FollowUpTooltip } from "./follow-up-tooltip";
import { isTheSameHtml } from "@/lib/deepsite/compare-html-diff";
import { getStoredToken } from "@/lib/deepsite/api-client";
import type {
  AgentEvent,
  ChatItem,
  ChatStep,
  Artifact,
} from "@/lib/deepsite/agent-events";
import { HTML_SENTINEL } from "@/lib/deepsite/agent-events";
import { getStackType, StackTypeSelector } from "@/components/deepsite-v2/editor/ask-ai/settings";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const t = getStoredToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

const _EXISTING_FILES_API_BUDGET = 48000;

/** API gövdesi için dosya içeriklerini kısaltır (token sınırı). */
function _trimExistingFilesForApi(
  files: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = {};
  let used = 0;
  for (const [path, content] of Object.entries(files).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    const slice = content.slice(0, 4000);
    const add = slice.length + path.length + 8;
    if (used + add > _EXISTING_FILES_API_BUDGET) break;
    out[path] = slice;
    used += add;
  }
  return out;
}

function errorMessageFromJson(res: unknown, fallback: string): string {
  if (!res || typeof res !== "object") return fallback;
  const o = res as Record<string, unknown>;
  if (typeof o.error === "string" && o.error.trim()) return o.error;
  if (typeof o.message === "string" && o.message.trim()) return o.message;
  const d = o.detail;
  if (typeof d === "string") return d;
  if (Array.isArray(d) && d.length) {
    const first = d[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "msg" in first) {
      const m = (first as { msg?: string }).msg;
      if (typeof m === "string") return m;
    }
  }
  return fallback;
}

function getGenerationMode(): "direct" | "agent" {
  if (typeof window === "undefined") return "agent";
  const m = localStorage.getItem("deepsite_mode");
  return m === "direct" ? "direct" : "agent";
}

// ---------------------------------------------------------------------------
// NDJSON parser helpers
// ---------------------------------------------------------------------------

/**
 * `dispatchAgentEvent` — AgentEvent'i ChatItem/Artifact state'e uygular.
 * Her çağrıda yeni referans döndürür (immutable update).
 */
function applyEvent(
  event: AgentEvent,
  items: ChatItem[],
  artifacts: Record<string, Artifact>
): {
  items: ChatItem[];
  artifacts: Record<string, Artifact>;
} {
  switch (event.type) {
    case "task_created": {
      const newItem: ChatItem = {
        id: uid(),
        type: "task_header",
        ts: event.ts ?? Date.now() / 1000,
        steps: [],
        finished: true,
        stepsExpanded: false,
        summary: event.task,
      };
      return { items: [...items, newItem], artifacts };
    }

    case "agent_start": {
      // Yeni ajan başladığında önceki açık agent_block'u kapat
      let updatedItems = [...items];
      if (updatedItems.length > 0) {
        const lastIdx = updatedItems.length - 1;
        const last = updatedItems[lastIdx];
        if (last.type === "agent_block" && !last.finished) {
          updatedItems[lastIdx] = { ...last, finished: true };
        }
      }
      const newItem: ChatItem = {
        id: uid(),
        type: "agent_block",
        agent: event.agent,
        role: event.role,
        ts: event.ts ?? Date.now() / 1000,
        steps: [],
        finished: false,
        stepsExpanded: true,
      };
      return { items: [...updatedItems, newItem], artifacts };
    }

    case "step": {
      if (items.length === 0) return { items, artifacts };
      // Son agent_block'a step ekle
      const lastIdx = items.length - 1;
      const last = items[lastIdx];
      if (last.type !== "agent_block") return { items, artifacts };
      const newStep: ChatStep = {
        action: event.action,
        label: event.label,
        contentId: event.content_id,
      };
      const updated: ChatItem = {
        ...last,
        steps: [...last.steps, newStep],
      };
      return {
        items: [...items.slice(0, lastIdx), updated],
        artifacts,
      };
    }

    case "artifact_ready": {
      return {
        items,
        artifacts: {
          ...artifacts,
          [event.content_id]: {
            filename: event.filename,
            language: event.language,
            content: event.content,
          },
        },
      };
    }

    case "agent_end": {
      if (items.length === 0) return { items, artifacts };
      const lastIdx = items.length - 1;
      const last = items[lastIdx];
      if (last.type !== "agent_block") return { items, artifacts };
      const updated: ChatItem = {
        ...last,
        finished: true,
        stepCount: event.step_count,
        summary: event.summary,
      };
      return {
        items: [...items.slice(0, lastIdx), updated],
        artifacts,
      };
    }

    case "warning": {
      const warnItem: ChatItem = {
        id: uid(),
        type: "warning_banner",
        ts: event.ts ?? Date.now() / 1000,
        steps: [],
        finished: true,
        stepsExpanded: false,
        summary: event.message,
      };
      return { items: [...items, warnItem], artifacts };
    }

    case "error": {
      if (items.length === 0) return { items, artifacts };
      const lastIdx = items.length - 1;
      const last = items[lastIdx];
      const updated: ChatItem = {
        ...last,
        finished: true,
        hasError: true,
        summary: event.message,
      };
      return {
        items: [...items.slice(0, lastIdx), updated],
        artifacts,
      };
    }

    case "file_ready": {
      // Dosya üretildi — mevcut son agent_block'a step olarak ekle
      if (items.length === 0) return { items, artifacts };
      const lastIdx = items.length - 1;
      const last = items[lastIdx];
      if (last.type !== "agent_block") return { items, artifacts };
      const fileStep: ChatStep = {
        action: "write_file",
        label: event.path,
      };
      const updated: ChatItem = { ...last, steps: [...last.steps, fileStep] };
      return { items: [...items.slice(0, lastIdx), updated], artifacts };
    }

    case "project_rules": {
      // Proje kuralları — bilgi banner'ı olarak göster
      const rulesItem: ChatItem = {
        id: uid(),
        type: "warning_banner",
        ts: event.ts ?? Date.now() / 1000,
        steps: [],
        finished: true,
        stepsExpanded: false,
        summary: `📋 Proje Kuralları Oluşturuldu (${event.stack ?? ""}): ${event.rules.substring(0, 150)}...`,
      };
      return { items: [...items, rulesItem], artifacts };
    }

    // html_ready, version_created, done — state değişikliği yok
    default:
      return { items, artifacts };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AskAI({
  html,
  setHtml,
  onScrollToBottom,
  isAiWorking,
  setisAiWorking,
  isEditableModeEnabled = false,
  selectedElement,
  setSelectedElement,
  setIsEditableModeEnabled,
  onNewPrompt,
  onSuccess,
  promptHistory = [],
  onChatUpdate,
  projectId,
  timelineChatItems = [],
  timelineArtifacts = {},
  existingFiles,
}: {
  html: string;
  setHtml: (html: string) => void;
  onScrollToBottom: () => void;
  isAiWorking: boolean;
  onNewPrompt: (prompt: string) => void;
  htmlHistory?: HtmlHistory[];
  setisAiWorking: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: (h: string, p: string, n?: number[][]) => void;
  isEditableModeEnabled: boolean;
  setIsEditableModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  selectedElement?: HTMLElement | null;
  setSelectedElement: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
  promptHistory?: string[];
  onChatUpdate?: (items: ChatItem[], artifacts: Record<string, Artifact>) => void;
  projectId?: string;
  /** Üst bileşendeki timeline ile senkron — sohbet sürekliliği */
  timelineChatItems?: ChatItem[];
  timelineArtifacts?: Record<string, Artifact>;
  /** DB'deki mevcut proje dosyaları — backend bağlamı */
  existingFiles?: Record<string, string>;
}) {
  const audio = useRef<HTMLAudioElement | null>(null);

  const [prompt, setPrompt] = useState("");
  const [hasAsked, setHasAsked] = useState(false);
  const [previousPrompt, setPreviousPrompt] = useState("");
  const [provider, setProvider] = useLocalStorage("provider", "auto");
  const [openProvider, setOpenProvider] = useState(false);
  const [providerError, setProviderError] = useState("");
  const [isThinking, setIsThinking] = useState(true);
  const [controller, setController] = useState<AbortController | null>(null);
  const [isFollowUp, setIsFollowUp] = useState(true);

  // HTML akışı sırasında en son set edilen HTML'i ref ile takip et
  const latestHtmlRef = useRef<string>(html);

  // Direct mode fallback (eski <think> stream)
  const [legacyThink, setLegacyThink] = useState<string | undefined>(undefined);
  const refLegacyThink = useRef<HTMLDivElement | null>(null);

  const getModel = () =>
    typeof window !== "undefined"
      ? localStorage.getItem("openai_model") || "gpt-4o-mini"
      : "gpt-4o-mini";

  // ---------------------------------------------------------------------------
  // NDJSON stream processor
  // ---------------------------------------------------------------------------

  const itemsRef = useRef<ChatItem[]>([]);
  const artifactsRef = useRef<Record<string, Artifact>>({});

  const dispatchEvent = useCallback((event: AgentEvent) => {
    const result = applyEvent(event, itemsRef.current, artifactsRef.current);
    itemsRef.current = result.items;
    artifactsRef.current = result.artifacts;
    onChatUpdate?.(result.items, result.artifacts);
  }, [onChatUpdate]);

  // ---------------------------------------------------------------------------
  // Main stream handler (POST /api/deepsite/ask-ai)
  // ---------------------------------------------------------------------------

  const callAi = async (redesignMarkdown?: string) => {
    if (isAiWorking) return;
    if (!redesignMarkdown && !prompt.trim()) return;
    setisAiWorking(true);
    setProviderError("");
    setIsThinking(true);

    setLegacyThink(undefined);
    itemsRef.current = [...timelineChatItems];
    artifactsRef.current = { ...timelineArtifacts };

    const abortController = new AbortController();
    setController(abortController);

    let contentResponse = "";
    let lastRenderTime = 0;

    try {
      onNewPrompt(prompt);

      // -----------------------------------------------------------------------
      // PUT: follow-up diff-patch
      // -----------------------------------------------------------------------
      if (
        isFollowUp &&
        !redesignMarkdown &&
        !isSameHtml &&
        html.trim().length > 0 &&
        getGenerationMode() === "direct"
      ) {
        const apiKey = localStorage.getItem("openai_api_key");
        const baseUrl = localStorage.getItem("openai_base_url");
        const model = getModel();
        const selectedElementHtml = selectedElement
          ? selectedElement.outerHTML
          : "";

        const request = await fetch("/api/deepsite/ask-ai", {
          method: "PUT",
          body: JSON.stringify({
            prompt,
            provider,
            previousPrompt,
            model,
            html,
            selectedElementHtml,
            apiKey,
            baseUrl,
          }),
          headers: {
            ...authHeaders(),
            "x-forwarded-for": window.location.hostname,
          },
          signal: abortController.signal,
        });

        if (!request.body) {
          toast.error("Empty response from server (network or proxy).");
          setisAiWorking(false);
          return;
        }

        let putJson: unknown;
        try {
          putJson = await request.json();
        } catch {
          toast.error(`Could not read server response (${request.status}).`);
          setisAiWorking(false);
          return;
        }

        if (!request.ok) {
          toast.error(
            errorMessageFromJson(putJson, `Request failed (${request.status})`)
          );
          setisAiWorking(false);
          return;
        }

        const res = putJson as {
          html?: string;
          updatedLines?: number[][];
          ok?: boolean;
          message?: string;
        };
        if (res.ok === false) {
          toast.error(res.message ?? "Follow-up failed.");
          setisAiWorking(false);
          return;
        }
        if (typeof res.html !== "string") {
          toast.error("Invalid response: missing html.");
          setisAiWorking(false);
          return;
        }

        setHtml(res.html);
        toast.success("AI responded successfully");
        setPreviousPrompt(prompt);
        setPrompt("");
        setisAiWorking(false);
        onSuccess(res.html, prompt, res.updatedLines);
        if (audio.current) void audio.current.play().catch(() => {});
        return;
      }

      // -----------------------------------------------------------------------
      // POST: generate (NDJSON stream)
      // -----------------------------------------------------------------------
      const apiKey = localStorage.getItem("openai_api_key");
      const baseUrl = localStorage.getItem("openai_base_url");
      const model = getModel();

      const trimmedExisting =
        existingFiles && Object.keys(existingFiles).length > 0
          ? _trimExistingFilesForApi(existingFiles)
          : undefined;

      const request = await fetch("/api/deepsite/ask-ai", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          provider,
          model,
          html: isSameHtml ? "" : html,
          redesignMarkdown,
          apiKey,
          baseUrl,
          mode: getGenerationMode(),
          stackType: getStackType(),
          promptHistory:
            promptHistory.length > 0 ? promptHistory.slice(-10) : undefined,
          projectId: projectId ?? null,
          existingFiles: trimmedExisting,
        }),
        headers: {
          ...authHeaders(),
          "x-forwarded-for": window.location.hostname,
        },
        signal: abortController.signal,
      });

      if (!request.body) {
        toast.error("No response body from AI service.");
        setisAiWorking(false);
        return;
      }

      if (!request.ok) {
        let errorMsg = "AI request failed.";
        try {
          const errorJson = await request.json();
          errorMsg = errorMessageFromJson(errorJson, errorMsg);
        } catch {
          try {
            const t = await request.text();
            try {
              const parsed = JSON.parse(t) as unknown;
              errorMsg = errorMessageFromJson(parsed, t.slice(0, 500));
            } catch {
              errorMsg = t.slice(0, 500) || errorMsg;
            }
          } catch {}
        }
        toast.error(errorMsg);
        setisAiWorking(false);
        return;
      }


      const selectedModel = MODELS.find(
        (m: { value: string }) => m.value === model
      );

      const reader = request.body.getReader();
      const decoder = new TextDecoder("utf-8");

      // Stream parse state
      let lineBuffer = "";
      let htmlMode = false;
      let htmlBuffer = "";
      let isFirstChunk = true;
      let isNdjsonStream = false; // ilk satır JSON ise true

      // Direct mode fallback (eski <think> tag) state
      let legacyThinkActive = false;
      let legacyThinkContent = "";

      const finishStream = (rawHtml: string) => {
        const stripped = rawHtml
          .replace(/^```html\s*/i, "")
          .replace(/```\s*$/, "")
          .trim();
        const finalDoc =
          stripped.match(/<!DOCTYPE html>[\s\S]*<\/html>/i)?.[0] ??
          (stripped.includes("<!DOCTYPE") ? stripped : undefined);
        if (finalDoc) setHtml(finalDoc);
        toast.success("AI responded successfully");
        setPreviousPrompt(prompt);
        setPrompt("");
        setisAiWorking(false);
        setIsThinking(false);
        setHasAsked(true);
        if (audio.current) void audio.current.play().catch(() => {});
        onSuccess(finalDoc ?? stripped, prompt);
      };

      const processChunk = (chunk: string) => {
        if (htmlMode) {
          // HTML modu: sentinel sonrası gelen her şey HTML
          htmlBuffer += chunk;
          const newHtml = htmlBuffer
            .replace(/^```html\s*/i, "")
            .match(/<!DOCTYPE html>[\s\S]*/i)?.[0];
          if (newHtml) {
            setIsThinking(false);
            let partialDoc = newHtml;
            if (partialDoc.includes("<head>") && !partialDoc.includes("</head>")) {
              partialDoc += "\n</head>";
            }
            if (partialDoc.includes("<body") && !partialDoc.includes("</body>")) {
              partialDoc += "\n</body>";
            }
            if (!partialDoc.includes("</html>")) {
              partialDoc += "\n</html>";
            }
            const now = Date.now();
              if (now - lastRenderTime > 300) {
                  latestHtmlRef.current = partialDoc;
                  setHtml(partialDoc);
                  lastRenderTime = now;
                }
                if (partialDoc.length > 200) onScrollToBottom();
              }
              return;
            }

            lineBuffer += chunk;
        const lines = lineBuffer.split("\n");
        lineBuffer = lines.pop() ?? "";

        for (const line of lines) {
          // htmlMode loop içinde set edildiyse kalan satırları HTML olarak topla
          if (htmlMode) {
            htmlBuffer += line + "\n";
            continue;
          }

          const trimmed = line.trim();
          if (!trimmed) continue;

          // HTML sentinel
          if (trimmed === HTML_SENTINEL) {
            htmlMode = true;
            setIsThinking(false);
            continue;
          }

          // İlk satır JSON mi?
          if (isFirstChunk) {
            isFirstChunk = false;
            try {
              JSON.parse(trimmed);
              isNdjsonStream = true;
            } catch {
              isNdjsonStream = false;
            }
          }

          if (isNdjsonStream) {
            // NDJSON event satırı
            try {
              const event = JSON.parse(trimmed) as AgentEvent;
              dispatchEvent(event);
              // "done" NDJSON eventi — sentinel gelecek, HTML moduna hazır
              if (event.type === "done") {
                // stream doğal bitiyor, sentinel bekleniyor
              }
            } catch {
              // JSON parse başarısız — <!DOCTYPE kontrolü (fallback)
              if (trimmed.includes("<!DOCTYPE")) {
                htmlMode = true;
                htmlBuffer += line + "\n";
              } else {
                console.warn("[chat-parser] unrecognized line:", trimmed.slice(0, 80));
              }
            }
          } else {
            // Direct mode / eski <think> format fallback
            if (trimmed.includes("<think>") || legacyThinkActive) {
              legacyThinkActive = true;
              if (trimmed.includes("</think>")) {
                legacyThinkActive = false;
              } else {
                legacyThinkContent += line + "\n";
                setLegacyThink(
                  legacyThinkContent.replace("<think>", "").trim()
                );
              }
              continue;
            }

            // Ham HTML (direct mode)
            contentResponse += line + "\n";
            const newHtml = contentResponse
              .replace(/^```html\s*/i, "")
              .match(/<!DOCTYPE html>[\s\S]*/i)?.[0];
            if (newHtml) {
              setIsThinking(false);
              let partialDoc = newHtml;
              if (partialDoc.includes("<head>") && !partialDoc.includes("</head>")) {
                partialDoc += "\n</head>";
              }
              if (partialDoc.includes("<body") && !partialDoc.includes("</body>")) {
                partialDoc += "\n</body>";
              }
              if (!partialDoc.includes("</html>")) {
                partialDoc += "\n</html>";
              }
              const now = Date.now();
              if (now - lastRenderTime > 300) {
                latestHtmlRef.current = partialDoc;
                setHtml(partialDoc);
                lastRenderTime = now;
              }
              if (partialDoc.length > 200) onScrollToBottom();
            }
          }
        }
      };

      const read = async (): Promise<void> => {
        try {
          const { done, value } = await reader.read();
          if (done) {
            // Son chunk'ta \n yoksa satır lineBuffer'da kalır; kapatmadan flush et
            if (lineBuffer) {
              processChunk("\n");
            }
            // Stream bitti
            if (htmlMode) {
              finishStream(htmlBuffer);
            } else if (!isNdjsonStream && contentResponse.trim()) {
              finishStream(contentResponse);
            } else {
              // NDJSON stream bitti — HTML zaten set edildi
              toast.success("AI responded successfully");
              setPreviousPrompt(prompt);
              setPrompt("");
              setisAiWorking(false);
              setIsThinking(false);
              setHasAsked(true);
              if (audio.current) void audio.current.play().catch(() => {});
              // onSuccess: latestHtmlRef ile en güncel HTML'i kullan
              if (latestHtmlRef.current) onSuccess(latestHtmlRef.current, prompt);
            }
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          processChunk(chunk);
          return read();
        } catch (streamErr: unknown) {
          const msg =
            streamErr instanceof Error ? streamErr.message : "Stream error";
          if (!msg.includes("aborted") && !msg.includes("abort")) {
            toast.error(msg);
          }
          setisAiWorking(false);
        }
      };

      void read();
    } catch (error: any) {
      setisAiWorking(false);
      toast.error(error.message);
    }
  };

  const stopController = () => {
    if (controller) {
      controller.abort();
      setController(null);
      setisAiWorking(false);
      setIsThinking(false);
    }
  };

  useUpdateEffect(() => {
    if (refLegacyThink.current) {
      refLegacyThink.current.scrollTop = refLegacyThink.current.scrollHeight;
    }
  }, [legacyThink]);

  const isSameHtml = useMemo(() => isTheSameHtml(html), [html]);
  const agentModeActive = getGenerationMode() === "agent";

  return (
    <>
      <div className="px-3">
        <div className="relative bg-neutral-800 border border-neutral-700 rounded-2xl ring-[4px] focus-within:ring-neutral-500/30 focus-within:border-neutral-600 ring-transparent z-10 w-full group">

          {/* Selected element indicator */}
          {selectedElement && (
            <div className="px-4 pt-3">
              <SelectedHtmlElement
                element={selectedElement}
                isAiWorking={isAiWorking}
                onDelete={() => setSelectedElement(null)}
              />
            </div>
          )}

          {/* Input row */}
          <div className="w-full relative flex items-center justify-between">
            {isAiWorking && (
              <div className="absolute bg-neutral-800 rounded-lg bottom-0 left-4 w-[calc(100%-30px)] h-full z-1 flex items-center justify-between max-lg:text-sm">
                <div className="flex items-center justify-start gap-2">
                  <Loading overlay={false} className="!size-4" />
                  <p className="text-neutral-400 text-sm">
                    {agentModeActive
                      ? isThinking
                        ? "MGX Team is planning..."
                        : "MGX Team is coding..."
                      : `AI is ${isThinking ? "thinking" : "coding"}...`}
                  </p>
                </div>
                <div
                  className="text-xs text-neutral-400 px-1 py-0.5 rounded-md border border-neutral-600 flex items-center justify-center gap-1.5 bg-neutral-800 hover:brightness-110 transition-all duration-200 cursor-pointer"
                  onClick={stopController}
                >
                  <FaStopCircle />
                  Stop generation
                </div>
              </div>
            )}
            <input
              type="text"
              disabled={isAiWorking}
              className={classNames(
                "w-full bg-transparent text-sm outline-none text-white placeholder:text-neutral-400 p-4",
                {
                  "!pt-2.5": selectedElement && !isAiWorking,
                }
              )}
              placeholder={
                selectedElement
                  ? `Ask DeepSite about ${selectedElement.tagName.toLowerCase()}...`
                  : hasAsked
                  ? "Ask DeepSite for edits"
                  : "Ask DeepSite anything..."
              }
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  callAi();
                }
              }}
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 px-4 pb-3">
            <div className="flex-1 flex items-center justify-start gap-1.5">
              <ReImagine onRedesign={(md) => callAi(md)} />
              {!isSameHtml && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="xs"
                      variant={isEditableModeEnabled ? "default" : "outline"}
                      onClick={() => {
                        setIsEditableModeEnabled?.(!isEditableModeEnabled);
                      }}
                      className={classNames("h-[28px]", {
                        "!text-neutral-400 hover:!text-neutral-200 !border-neutral-600 !hover:!border-neutral-500":
                          !isEditableModeEnabled,
                      })}
                    >
                      <Crosshair className="size-4" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    align="start"
                    className="bg-neutral-950 text-xs text-neutral-200 py-1 px-2 rounded-md -translate-y-0.5"
                  >
                    Select an element on the page to ask DeepSite edit it
                    directly.
                  </TooltipContent>
                </Tooltip>
              )}
              <StackTypeSelector disabled={isAiWorking} />
              <InviteFriends />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Settings
                provider={provider as string}
                model={getModel()}
                onChange={setProvider}
                onModelChange={(newModel: string) => {
                  localStorage.setItem("openai_model", newModel);
                }}
                open={openProvider}
                error={providerError}
                isFollowUp={!isSameHtml && isFollowUp}
                onClose={setOpenProvider}
              />
              <Button
                size="iconXs"
                disabled={isAiWorking || !prompt.trim()}
                onClick={() => callAi()}
              >
                <ArrowUp className="size-4" />
              </Button>
            </div>
          </div>

          {/* Diff-patch checkbox */}
          {!isSameHtml && (
            <div className="absolute top-0 right-0 -translate-y-[calc(100%+8px)] select-none text-xs text-neutral-400 flex items-center justify-center gap-2 bg-neutral-800 border border-neutral-700 rounded-md p-1 pr-2.5">
              <label
                htmlFor="diff-patch-checkbox"
                className="flex items-center gap-1.5 cursor-pointer"
              >
                <Checkbox
                  id="diff-patch-checkbox"
                  checked={isFollowUp}
                  onCheckedChange={(e) => {
                    setIsFollowUp(e === true);
                  }}
                />
                Diff-Patch Update
              </label>
              <FollowUpTooltip />
            </div>
          )}
        </div>
        <audio ref={audio} id="audio" className="hidden">
          <source src="/success.wav" type="audio/wav" />
          Your browser does not support the audio element.
        </audio>
      </div>
    </>
  );
}
