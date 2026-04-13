"use client";

import React, { useEffect, useRef } from "react";
import type { Artifact } from "@/lib/deepsite/agent-events";

interface FilePreviewDrawerProps {
  artifact: Artifact | null;
  onClose: () => void;
}

export function FilePreviewDrawer({ artifact, onClose }: FilePreviewDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Esc tuşu ile kapat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Dışarı tıklayınca kapat
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!artifact) return null;

  const lineCount = artifact.content.split("\n").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="relative z-10 flex flex-col w-full max-w-xl bg-neutral-900 border-l border-white/10 shadow-2xl"
        style={{ maxHeight: "100dvh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-mono text-white truncate">
              {artifact.filename}
            </span>
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 font-mono uppercase">
              {artifact.language}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-neutral-500">
              {lineCount} satır
            </span>
            <button
              className="text-neutral-400 hover:text-white transition-colors p-1 rounded hover:bg-white/10"
              onClick={onClose}
              aria-label="Kapat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <pre className="text-xs font-mono text-neutral-200 leading-relaxed p-4 whitespace-pre-wrap break-words">
            <code>{artifact.content}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-2 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Alex tarafından üretildi</span>
          <button
            className="text-neutral-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}
