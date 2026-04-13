/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

/** Sonner: süre verilmezse bazı ortamlarda bildirimler açık kalabiliyor */
const TOAST_MS = 4500;
import { ArrowDown, FolderOpen, FileCode } from "lucide-react";
import {
  useEvent,
  useLocalStorage,
  useMount,
  useUnmount,
  useUpdateEffect,
} from "react-use";
import classNames from "classnames";
import { useRouter } from "next/navigation";

import { Header } from "@/components/deepsite-v2/editor/header";
import { Footer } from "@/components/deepsite-v2/editor/footer";
import { defaultHTML } from "@/lib/deepsite/consts";
import { Preview } from "@/components/deepsite-v2/editor/preview";
import { useEditor } from "@/hooks/deepsite/useEditor";
import { AskAI } from "@/components/deepsite-v2/editor/ask-ai";
import { AgentChatTimeline } from "@/components/deepsite-v2/editor/ask-ai/agent-chat-timeline";
import { FilePreviewDrawer } from "@/components/deepsite-v2/editor/ask-ai/file-preview-drawer";
import { Project } from "@/lib/deepsite/deepsite-v2-types";
import { SaveButton } from "./save-button";
import { LoadProject } from "../my-projects/load-project";
import type { ChatItem, Artifact } from "@/lib/deepsite/agent-events";
import type { ChatHistoryPayload } from "@/lib/deepsite/types";

function countTimelineSteps(items: ChatItem[]): number {
  return items.reduce((sum, i) => sum + i.steps.length, 0);
}

/**
 * Birden fazla dosyanın tek bir string'e birleştirildiği formatı ayırır.
 * İki format desteklenir:
 *   1. ```FILE: path\ncontent``` (backtick ile)
 *   2. FILE: path\ncontent      (düz metin — backend _parse_file_manifest formatı)
 */
function expandConcatenatedFiles(
  mainPath: string,
  content: string
): Record<string, string> {
  const result: Record<string, string> = {};

  // Backtick formatı: ```FILE: path\ncontent```
  const backtickPattern = /```FILE:\s*([^\n`]+)\n([\s\S]*?)(?=\n```FILE:|```\s*$|$)/g;
  // Düz metin formatı: FILE: path\ncontent
  const plainPattern = /(?:^|\n)FILE:\s*(\S+)\s*\n([\s\S]*?)(?=\nFILE:|\Z|$)/g;

  const useBacktick = content.includes("```FILE:");
  const pattern = useBacktick ? backtickPattern : plainPattern;

  // İlk dosyanın içeriği (ilk FILE: marker'ından önce)
  const firstSepRegex = useBacktick ? /\n```FILE:/ : /\nFILE:\s*\S/;
  const firstSepIdx = content.search(firstSepRegex);
  if (firstSepIdx > 0) {
    const firstContent = content
      .slice(0, firstSepIdx)
      .replace(/```\s*$/, "")
      .trim();
    if (firstContent) result[mainPath] = firstContent;
  } else if (!useBacktick) {
    // FILE: yoksa içeriği olduğu gibi ekle
    result[mainPath] = content.trim();
  }

  // Sonraki dosyalar
  let m: RegExpExecArray | null;
  while ((m = pattern.exec(content)) !== null) {
    const path = m[1].trim();
    const fileContent = m[2].replace(/```\s*$/, "").trim();
    if (path && fileContent) result[path] = fileContent;
  }

  return result;
}

/**
 * HTML içine gömülü `const files = {...}` bloğunu parse ederek
 * tüm proje dosyalarını döndürür.
 * Backend'in _extract_files_from_pages_html ile aynı mantık.
 * Ek olarak: tek key'e birleştirilmiş `FILE:` bloklarını da ayırır.
 */
function extractFilesFromHtml(html: string): Record<string, string> | null {
  if (!html.includes('data-deepsite-preview="project-files"')) return null;
  const marker = "const files = ";
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const jsonStart = idx + marker.length;
  try {
    // Balanced { } taraması ile JSON bitişini bul
    let depth = 0;
    let i = jsonStart;
    while (i < html.length) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) break;
      }
      i++;
    }
    const parsed = JSON.parse(html.slice(jsonStart, i + 1)) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

    // Her key'in değerini kontrol et: birleştirilmiş format varsa ayır
    const raw = parsed as Record<string, string>;
    const expanded: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value !== "string") continue;
      if (value.includes("FILE:")) {
        Object.assign(expanded, expandConcatenatedFiles(key, value));
      } else {
        expanded[key] = value;
      }
    }
    return Object.keys(expanded).length > 0 ? expanded : null;
  } catch {
    // HTML parse edilemedi — fallback yok
  }
  return null;
}

export const AppEditor = ({
  project,
  onPersist,
  initialChatHistory,
  onSaveChatHistory,
  initialLiveUrl,
  projectFiles,
}: {
  project?: Project | null;
  /** Save HTML to MGX DeepSite project (PostgreSQL). */
  onPersist?: (html: string, prompts: string[]) => Promise<void>;
  /** Initial chat history loaded from DB. */
  initialChatHistory?: ChatHistoryPayload | null;
  /** Debounced save of chat history to DB. */
  onSaveChatHistory?: (items: unknown[], artifacts: unknown) => void;
  /** Live preview URL (Docker container proxy) — sayfa açılırken set edilir */
  initialLiveUrl?: string | null;
  /** DB'deki proje dosyaları — AI bağlamı için */
  projectFiles?: Record<string, string> | null;
}) => {
  const [htmlStorage, , removeHtmlStorage] = useLocalStorage("html_content");
  const { html, setHtml, htmlHistory, setHtmlHistory, prompts, setPrompts } =
    useEditor(project?.html ?? (htmlStorage as string) ?? defaultHTML);
  const router = useRouter();

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const editor = useRef<HTMLDivElement>(null);
  const resizer = useRef<HTMLDivElement>(null);

  const [currentTab, setCurrentTab] = useState(initialLiveUrl ? "preview" : "chat");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [isResizing, setIsResizing] = useState(false);
  const [isAiWorking, setIsAiWorking] = useState(false);
  const [isEditableModeEnabled, setIsEditableModeEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(
    null
  );

  const [chatItems, setChatItems] = useState<ChatItem[]>([]);
  const [chatArtifacts, setChatArtifacts] = useState<Record<string, Artifact>>({});
  const [previewArtifactId, setPreviewArtifactId] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const timelineWrapperRef = useRef<HTMLDivElement>(null);
  const prevStepCountRef = useRef(0);
  const wasAiWorkingRef = useRef(false);

  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Tüm dosyaları birleştir: HTML içindeki gömülü `const files` + DB'den gelen projectFiles
  // HTML kaynağı genellikle daha eksiksizdir; DB kaynağı varsa o dosyalar öncelik kazanır.
  const allProjectFiles = (() => {
    const fromHtml = extractFilesFromHtml(html);
    if (!fromHtml && !projectFiles) return null;
    return { ...(fromHtml ?? {}), ...(projectFiles ?? {}) };
  })();

  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(initialLiveUrl ?? null);
  const [runStatus, setRunStatus] = useState<"idle" | "starting" | "running" | "error">(
    initialLiveUrl ? "running" : "idle"
  );
  const autoRunTriggeredRef = useRef(!!initialLiveUrl);
  const runProjectRef = useRef<(() => Promise<void>) | null>(null);

  useEffect(() => {
    if (!initialChatHistory) return;
    if (initialChatHistory.items?.length > 0) {
      setChatItems(initialChatHistory.items as ChatItem[]);
      setChatArtifacts((initialChatHistory.artifacts as Record<string, Artifact>) ?? {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runProject = useCallback(async () => {
    if (!project?.id) {
      toast.error("Proje ID'si bulunamadı.", { duration: TOAST_MS });
      return;
    }
    setRunStatus("starting");
    setLivePreviewUrl(null);
    try {
      const res = await fetch(`/api/deepsite/projects/${project.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.detail ?? data.error ?? "Konteyner başlatılamadı");
      }
      if (!data.url) {
        setRunStatus("idle");
        autoRunTriggeredRef.current = false;
        return;
      }
      setLivePreviewUrl(data.url);
      setRunStatus("running");
      toast.success(`Proje çalışıyor! Port: ${data.port}`, { duration: TOAST_MS });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Proje çalıştırılamadı: ${msg}`, { duration: TOAST_MS });
      setRunStatus("error");
    }
  }, [project?.id]);

  useEffect(() => {
    runProjectRef.current = runProject;
  }, [runProject]);

  const isProjectStack = html.includes('data-deepsite-preview="project-files"') ||
    html.includes("Proje Dosyaları");

  useEffect(() => {
    if (
      isProjectStack &&
      !isAiWorking &&
      runStatus === "idle" &&
      !autoRunTriggeredRef.current &&
      project?.id
    ) {
      const timer = setTimeout(() => {
        autoRunTriggeredRef.current = true;
        runProjectRef.current?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProjectStack, isAiWorking, runStatus, project?.id]);

  // AI bittiğinde container'ı yenile (yeni dosyalar yansısın).
  // Kısa gecikme: backend'in collected_files → DB commit'i ile POST /run yarışmasın.
  useEffect(() => {
    if (wasAiWorkingRef.current && !isAiWorking && isProjectStack && project?.id) {
      const t = window.setTimeout(() => {
        void runProjectRef.current?.();
      }, 1800);
      wasAiWorkingRef.current = isAiWorking;
      return () => clearTimeout(t);
    }
    wasAiWorkingRef.current = isAiWorking;
  }, [isAiWorking, isProjectStack, project?.id]);

  const isAtBottom = useCallback(() => {
    const el = timelineWrapperRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = timelineWrapperRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "instant" });
    });
  }, []);

  useEffect(() => {
    const stepCount = countTimelineSteps(chatItems);
    if (stepCount > prevStepCountRef.current) {
      prevStepCountRef.current = stepCount;
      if (isAtBottom()) {
        scrollToBottom(true);
      } else {
        setShowScrollToBottom(true);
      }
    } else if (chatItems.length === 0) {
      prevStepCountRef.current = 0;
      setShowScrollToBottom(false);
    }
  }, [chatItems, isAtBottom, scrollToBottom]);

  const handleTimelineScroll = useCallback(() => {
    setShowScrollToBottom(!isAtBottom());
  }, [isAtBottom]);

  const resetLayout = () => {
    if (!editor.current || !preview.current) return;

    if (window.innerWidth >= 1024) {
      const resizerWidth = resizer.current?.offsetWidth ?? 8;
      const availableWidth = window.innerWidth - resizerWidth;
      const initialEditorWidth = availableWidth / 3;
      const initialPreviewWidth = availableWidth - initialEditorWidth;
      editor.current.style.width = `${initialEditorWidth}px`;
      preview.current.style.width = `${initialPreviewWidth}px`;
    } else {
      editor.current.style.width = "";
      preview.current.style.width = "";
    }
  };

  const handleResize = (e: MouseEvent) => {
    if (!editor.current || !preview.current || !resizer.current) return;

    const resizerWidth = resizer.current.offsetWidth;
    const minWidth = 100;
    const maxWidth = window.innerWidth - resizerWidth - minWidth;

    const editorWidth = e.clientX;
    const clampedEditorWidth = Math.max(
      minWidth,
      Math.min(editorWidth, maxWidth)
    );
    const calculatedPreviewWidth =
      window.innerWidth - clampedEditorWidth - resizerWidth;

    editor.current.style.width = `${clampedEditorWidth}px`;
    preview.current.style.width = `${calculatedPreviewWidth}px`;
  };

  const handleMouseDown = () => {
    setIsResizing(true);
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  useMount(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    if (typeof window !== "undefined") {
      const sessionMode = sessionStorage.getItem("deepsite_mode_session");
      const mode = sessionMode === "direct" ? "direct" : "agent";
      localStorage.setItem("deepsite_mode", mode);
    }

    if (htmlStorage) {
      removeHtmlStorage();
      toast.warning("Previous HTML content restored from local storage.", {
        duration: TOAST_MS,
      });
    }

    resetLayout();
    if (!resizer.current) return;
    resizer.current.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("resize", resetLayout);
  });
  useUnmount(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    document.removeEventListener("mousemove", handleResize);
    document.removeEventListener("mouseup", handleMouseUp);
    if (resizer.current) {
      resizer.current.removeEventListener("mousedown", handleMouseDown);
    }
    window.removeEventListener("resize", resetLayout);
  });

  useEvent("beforeunload", (e) => {
    if (isAiWorking) {
      e.preventDefault();
      return "";
    }
  });

  useUpdateEffect(() => {
    if (currentTab === "chat" || currentTab === "files") {
      resetLayout();
      if (resizer.current) {
        resizer.current.addEventListener("mousedown", handleMouseDown);
      }
    } else {
      if (preview.current) {
        preview.current.style.width = "100%";
      }
    }
  }, [currentTab]);

  const previewArtifact = previewArtifactId ? chatArtifacts[previewArtifactId] ?? null : null;

  const leftPanelTabs = currentTab === "chat" || currentTab === "files";

  return (
    <section
      className="h-[100dvh] bg-neutral-950 flex flex-col overflow-hidden"
      data-deepsite-ui="v2-chat-preview-files"
    >
      <FilePreviewDrawer
        artifact={previewArtifact}
        onClose={() => setPreviewArtifactId(null)}
      />
      <Header tab={currentTab} onNewTab={setCurrentTab}>
        <LoadProject
          onSuccess={(project: Project) => {
            if (project.space_id && project.space_id !== "local") {
              router.push(`/projects/${project.space_id}`);
            } else {
              setHtml(project.html);
              setPrompts(project.prompts || []);
              toast.success("Projeto HTML carregado.", { duration: TOAST_MS });
            }
          }}
        />
        <SaveButton html={html} prompts={prompts} onPersist={onPersist} />
      </Header>
      <main className="bg-neutral-950 flex-1 max-lg:flex-col flex w-full max-lg:h-[calc(100%-82px)] relative">
        {leftPanelTabs && (
          <>
            <div
              ref={editor}
              className="bg-neutral-900 relative flex-1 min-h-0 overflow-hidden h-full flex flex-col gap-2 pb-3"
            >
              {currentTab === "chat" && (
                <>
                  {chatItems.length > 0 || isAiWorking ? (
                    <div className="flex-1 min-h-0 relative">
                      <div
                        ref={timelineWrapperRef}
                        className="absolute inset-0 overflow-y-auto pt-4"
                        onScroll={handleTimelineScroll}
                      >
                        <AgentChatTimeline
                          items={chatItems}
                          artifacts={chatArtifacts}
                          onPreview={(id) => setPreviewArtifactId(id)}
                        />
                      </div>
                      {showScrollToBottom && (
                        <button
                          type="button"
                          onClick={() => { scrollToBottom(true); setShowScrollToBottom(false); }}
                          className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-neutral-200 text-xs shadow-lg transition-colors"
                        >
                          <ArrowDown className="size-3" />
                          En alta dön
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 text-neutral-500 select-none px-6 text-center pointer-events-none">
                      <span className="text-4xl">✦</span>
                      <p className="text-sm font-medium text-neutral-400">
                        Bir şey sor, AI üretmeye başlasın
                      </p>
                      <p className="text-xs text-neutral-600">
                        Ajan takımı çalışırken adımları burada göreceksin. Canlı önizleme sağ panelde güncellenir.
                      </p>
                    </div>
                  )}
                </>
              )}

              {currentTab === "files" && (
                <div className="flex-1 min-h-0 flex flex-col border-t border-neutral-800 overflow-hidden">
                  <div className="px-3 py-2 text-xs text-neutral-500 border-b border-neutral-800 shrink-0 flex items-center gap-1.5">
                    <FolderOpen className="size-3.5 shrink-0" aria-hidden />
                    Dosyalar
                    {allProjectFiles && (
                      <span className="ml-auto text-neutral-600">
                        {Object.keys(allProjectFiles).length}
                      </span>
                    )}
                  </div>
                  {allProjectFiles ? (
                    <div className="flex-1 overflow-y-auto py-1">
                      {Object.keys(allProjectFiles).sort().map((path) => (
                        <button
                          key={path}
                          type="button"
                          title={path}
                          onClick={() => setSelectedFile(path)}
                          className={classNames(
                            "w-full text-left px-3 py-1 text-[11px] font-mono truncate hover:bg-neutral-800 transition-colors flex items-center gap-1.5",
                            selectedFile === path
                              ? "bg-neutral-700 text-sky-300"
                              : "text-neutral-400"
                          )}
                        >
                          <FileCode className="size-3 shrink-0 opacity-60" aria-hidden />
                          {path}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-neutral-600 select-none px-4 text-center">
                      <FolderOpen className="size-8 opacity-30" />
                      <p className="text-xs">Çok dosyalı proje değil; Preview sekmesini kullanın.</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-2 shrink-0">
                <AskAI
                  html={html}
                  setHtml={(newHtml: string) => {
                    setHtml(newHtml);
                  }}
                  htmlHistory={htmlHistory}
                  promptHistory={prompts}
                  timelineChatItems={chatItems}
                  timelineArtifacts={chatArtifacts}
                  existingFiles={allProjectFiles ?? undefined}
                  onSuccess={(
                    finalHtml: string,
                    p: string,
                    _updatedLines?: number[][]
                  ) => {
                    const currentHistory = [...htmlHistory];
                    currentHistory.unshift({
                      html: finalHtml,
                      createdAt: new Date(),
                      prompt: p,
                    });
                    setHtmlHistory(currentHistory);
                    setSelectedElement(null);
                    if (onPersist && finalHtml) {
                      void onPersist(finalHtml, [...prompts, p]).catch(() => {});
                    }
                    if (window.innerWidth <= 1024) {
                      setCurrentTab("preview");
                    }
                  }}
                  isAiWorking={isAiWorking}
                  setisAiWorking={setIsAiWorking}
                  onNewPrompt={(prompt: string) => {
                    setPrompts((prev) => [...prev, prompt]);
                  }}
                  onScrollToBottom={() => {
                    scrollToBottom(true);
                  }}
                  isEditableModeEnabled={isEditableModeEnabled}
                  setIsEditableModeEnabled={setIsEditableModeEnabled}
                  selectedElement={selectedElement}
                  setSelectedElement={setSelectedElement}
                  onChatUpdate={(items, artifacts) => {
                    if (items.length === 0 && timelineWrapperRef.current) {
                      timelineWrapperRef.current.scrollTop = 0;
                      setShowScrollToBottom(false);
                    }
                    setChatItems(items);
                    setChatArtifacts(artifacts);
                    onSaveChatHistory?.(items, artifacts);
                  }}
                  projectId={project?.id}
                />
              </div>
            </div>
            <div
              ref={resizer}
              className="bg-neutral-800 hover:bg-sky-500 active:bg-sky-500 w-1.5 cursor-col-resize h-full max-lg:hidden"
            />
          </>
        )}
        {currentTab === "files" ? (
          /* Dosya içeriği görüntüleyici — Preview'ın büyük alanını kullanır */
          <div className="flex-1 min-h-0 flex flex-col bg-neutral-950 border-l border-neutral-800 h-full overflow-hidden">
            {selectedFile && allProjectFiles?.[selectedFile] !== undefined ? (
              <>
                {/* Sticky başlık — scroll ile birlikte yukarıda sabit */}
                <div className="shrink-0 bg-neutral-900 border-b border-neutral-800 px-4 py-2 text-xs text-neutral-400 font-mono flex items-center gap-2">
                  <FileCode className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{selectedFile}</span>
                </div>
                {/* İçerik: dikey + yatay scroll */}
                <div className="flex-1 min-h-0 overflow-auto">
                  <pre className="text-[12px] text-neutral-300 p-4 font-mono whitespace-pre leading-relaxed min-w-max">
                    {allProjectFiles[selectedFile]}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-600 select-none pointer-events-none">
                <FolderOpen className="size-12 opacity-20" />
                <p className="text-sm">Sol listeden bir dosya seçin</p>
              </div>
            )}
          </div>
        ) : (
          <Preview
            html={html}
            isResizing={isResizing}
            isAiWorking={isAiWorking}
            ref={preview}
            device={device}
            currentTab={currentTab}
            isEditableModeEnabled={isEditableModeEnabled}
            iframeRef={iframeRef}
            onClickElement={(element) => {
              setIsEditableModeEnabled(false);
              setSelectedElement(element);
              setCurrentTab("chat");
            }}
            liveUrl={livePreviewUrl}
            runStatus={runStatus}
            onRunProject={runProject}
          />
        )}
      </main>
      <Footer
        onReset={() => {
          if (isAiWorking) {
            toast.warning("Please wait for the AI to finish working.", {
              duration: TOAST_MS,
            });
            return;
          }
          if (
            window.confirm("You're about to reset the editor. Are you sure?")
          ) {
            setHtml(defaultHTML);
            removeHtmlStorage();
          }
        }}
        htmlHistory={htmlHistory}
        setHtml={setHtml}
        iframeRef={iframeRef}
        device={device}
        setDevice={setDevice}
      />
    </section>
  );
};
