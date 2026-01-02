"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { SplitPanelLayout } from "./split-panel-layout";
import { TaskLiveChat } from "./task-live-chat";
import { AppViewer, type AppViewerFile } from "./app-viewer";
import { CodeEditor, type CodeEditorFile } from "./code-editor";
import { FileTree, type FileTreeNode } from "./file-tree";
import { getTaskFiles } from "@/lib/api";
import { Button } from "@/components/mgx/ui/button";
import { cn } from "@/lib/utils";
import { Monitor, Code, Terminal, File as FileIcon, Eye } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

// Dynamically import TerminalPanel to avoid SSR issues
const TerminalPanel = dynamic(
  () => import("./terminal-panel").then((mod) => mod.TerminalPanel),
  { 
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-zinc-950 text-zinc-400">
        Loading terminal...
      </div>
    ),
  }
);

type RightPanelTab = "app" | "editor" | "terminal" | "files";

interface TaskSplitViewProps {
  taskId: string;
  runId?: string;
  className?: string;
}

export function TaskSplitView({ taskId, runId, className }: TaskSplitViewProps) {
  const [activeTab, setActiveTab] = React.useState<RightPanelTab>("app");
  const [files, setFiles] = React.useState<AppViewerFile[]>([]);
  const [fileTree, setFileTree] = React.useState<FileTreeNode[]>([]);
  const [selectedFile, setSelectedFile] = React.useState<CodeEditorFile | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = React.useState(false);
  const tabNavRef = React.useRef<HTMLDivElement>(null);
  
  const { lastMessage, subscribe } = useWebSocket();
  const { currentWorkspace, currentProject } = useWorkspace();
  
  // Ensure tab navigation starts at scroll position 0
  React.useEffect(() => {
    if (tabNavRef.current) {
      tabNavRef.current.scrollLeft = 0;
    }
  }, []);

  // Use ref to track current taskId to prevent stale closures
  const currentTaskIdRef = React.useRef<string>(taskId);
  const currentRunIdRef = React.useRef<string | undefined>(runId);
  
  React.useEffect(() => {
    currentTaskIdRef.current = taskId;
    currentRunIdRef.current = runId;
  }, [taskId, runId]);

  // Load files function
  const loadFiles = React.useCallback(async () => {
    // Use ref to get current taskId (prevents stale closure)
    const currentTaskId = currentTaskIdRef.current;
    const currentRunId = currentRunIdRef.current;
    
    if (!currentWorkspace || !currentTaskId) return;
    
    const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
    if (isDev) {
      console.debug("[TaskSplitView] loadFiles called for taskId:", currentTaskId, "runId:", currentRunId);
    }
    
    // CRITICAL: Clear state first before loading new files
    setFiles([]);
    setFileTree([]);
    setSelectedFile(null);
    setIsLoadingFiles(true);
    
    try {
      const response = await getTaskFiles(currentTaskId, currentRunId, {
        workspaceId: currentWorkspace.id,
        projectId: currentProject?.id,
      });
      
      // CRITICAL: Verify response is for the current taskId (prevent stale data)
      const responseTaskId = response.task_id || response.taskId;
      if (responseTaskId && responseTaskId !== currentTaskId) {
        if (isDev) {
          console.warn("[TaskSplitView] Rejecting files from different task:", {
            responseTaskId,
            currentTaskId,
            fileCount: response.files?.length || 0
          });
        }
        // Don't update state if response is for a different task
        setFiles([]);
        setFileTree([]);
        setSelectedFile(null);
        return;
      }
      
      // Verify we're still on the same task (double-check against ref)
      if (currentTaskIdRef.current !== currentTaskId) {
        if (isDev) {
          console.debug("[TaskSplitView] Task changed during file load, ignoring response");
        }
        return;
      }
      
      if (isDev) {
        console.debug("[TaskSplitView] Files loaded:", {
          taskId: currentTaskId,
          runId: currentRunId,
          fileCount: response.files?.length || 0
        });
      }
      
      // Convert to AppViewerFile format
      const appFiles: AppViewerFile[] = (response.files || []).map((f: any) => ({
        name: f.name,
        content: f.content || "",
        type: (f.type || "other") as "html" | "css" | "js" | "other",
      }));
      setFiles(appFiles);

      // Convert to FileTreeNode format
      const treeNodes: FileTreeNode[] = (response.files || []).map((f: any) => ({
        name: f.name,
        path: f.path || f.name,
        type: "file" as const,
        content: f.content || "",
        size: f.size || 0,
      }));
      setFileTree(treeNodes);

      // Auto-select first HTML file for App Viewer
      const htmlFile = appFiles.find(f => f.type === "html");
      if (htmlFile && activeTab === "app") {
        // App Viewer will use all files
      }
    } catch (error) {
      console.error("[TaskSplitView] Failed to load files:", error);
      // Keep state cleared on error
      setFiles([]);
      setFileTree([]);
      setSelectedFile(null);
    } finally {
      // Only update loading state if we're still on the same task
      if (currentTaskIdRef.current === currentTaskId) {
        setIsLoadingFiles(false);
      }
    }
  }, [activeTab, currentWorkspace, currentProject]);

  // Clear all state when taskId or runId changes (before loading new files)
  React.useEffect(() => {
    const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
    if (isDev) {
      console.debug("[TaskSplitView] taskId or runId changed, clearing state. taskId:", taskId, "runId:", runId);
    }
    // Immediately clear all state when task/run changes
    setFiles([]);
    setFileTree([]);
    setSelectedFile(null);
    setActiveTab("app"); // Reset to App Viewer tab
    setIsLoadingFiles(true); // Show loading state
  }, [taskId, runId]);

  // Load files when task/run changes
  React.useEffect(() => {
    if (taskId && currentWorkspace) {
      // State is already cleared by the previous useEffect
      // Now load files for the new task
      loadFiles();
    } else if (!taskId) {
      // If no taskId, clear everything
      setFiles([]);
      setFileTree([]);
      setSelectedFile(null);
      setIsLoadingFiles(false);
    }
  }, [taskId, runId, loadFiles, currentWorkspace]);

  // Subscribe to WebSocket events
  React.useEffect(() => {
    if (subscribe && taskId) {
      subscribe({ taskId, runId });
    }
  }, [subscribe, taskId, runId]);

  // Listen for FILES_UPDATED event
  React.useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "files_updated") {
      const payload = lastMessage.payload as any;
      const eventTaskId = payload.taskId || payload.task_id;
      const eventRunId = payload.runId || payload.run_id;
      
      // CRITICAL: Only reload files if the event is for the current task/run
      if (eventTaskId === taskId && (!runId || !eventRunId || eventRunId === runId)) {
        // Reload files when FILES_UPDATED event is received
        const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
        if (isDev) {
          console.debug("[TaskSplitView] Files updated event received, reloading files...", {
            eventTaskId,
            currentTaskId: taskId,
            eventRunId,
            currentRunId: runId
          });
        }
        loadFiles();
      } else {
        const isDev = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || process.env.NODE_ENV !== "production");
        if (isDev) {
          console.debug("[TaskSplitView] Ignoring FILES_UPDATED event from different task/run:", {
            eventTaskId,
            currentTaskId: taskId,
            eventRunId,
            currentRunId: runId
          });
        }
      }
    }
  }, [lastMessage, taskId, runId, loadFiles]);

  const handleFileSelect = (file: FileTreeNode) => {
    if (file.type === "file" && file.content !== undefined) {
      setSelectedFile({
        name: file.name,
        content: file.content,
        language: undefined,
      });
      setActiveTab("editor");
    }
  };

  const renderRightPanel = () => {
    return (
      <div 
        style={{ 
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          flex: 1,
          background: '#ffffff',
          overflow: 'hidden',
          minHeight: 0,
          minWidth: 0
        }}
      >
        {/* Tab Navigation - fixed height */}
        <div 
          ref={tabNavRef}
          className="flex flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-zinc-200/50 overflow-x-auto"
          style={{ minWidth: 0 }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("app")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
              activeTab === "app"
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            )}
          >
            <Eye className="h-4 w-4" />
            App Viewer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
              activeTab === "editor"
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            )}
          >
            <Code className="h-4 w-4" />
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("terminal")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
              activeTab === "terminal"
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            )}
          >
            <Terminal className="h-4 w-4" />
            Terminal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("files")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors flex-shrink-0",
              activeTab === "files"
                ? "border-b-2 border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
                : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
            )}
          >
            <FileIcon className="h-4 w-4" />
            Files
          </button>
        </div>

        {/* Tab Content - fills remaining space */}
        <div style={{ 
          flex: 1, 
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%'
        }}>
          {activeTab === "app" && (
            <div style={{ 
              flex: 1, 
              minHeight: 0, 
              overflow: 'hidden',
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <AppViewer files={files} />
            </div>
          )}
          {activeTab === "editor" && (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <CodeEditor
                file={selectedFile || undefined}
                readOnly={true}
                className="h-full w-full"
              />
            </div>
          )}
          {activeTab === "terminal" && (
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <TerminalPanel taskId={taskId} runId={runId} className="h-full w-full" />
            </div>
          )}
          {activeTab === "files" && (
            <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
              <FileTree
                files={fileTree}
                selectedFile={selectedFile?.name}
                onFileSelect={handleFileSelect}
                className="h-full w-full"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flex: 1, 
      height: '100%', 
      width: '100%', 
      overflow: 'hidden',
      minHeight: 0,
      minWidth: 0
    }}>
      <SplitPanelLayout
        leftPanel={
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', overflow: 'hidden', backgroundColor: '#18181b', minHeight: 0, maxHeight: '100%' }}>
            <TaskLiveChat taskId={taskId} runId={runId} className="flex-1 min-h-0" style={{ height: '100%', minHeight: 0, maxHeight: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} />
          </div>
        }
        rightPanel={renderRightPanel()}
        leftPanelDefaultSize={35}
        rightPanelDefaultSize={65}
        leftPanelMinSize={25}
        rightPanelMinSize={40}
        className={cn("bg-zinc-950", className)}
      />
    </div>
  );
}

