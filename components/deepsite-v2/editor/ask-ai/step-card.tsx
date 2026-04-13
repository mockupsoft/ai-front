"use client";

import React from "react";
import { FileText, Terminal, Pencil, MessageSquare, Search, Eye } from "lucide-react";
import {
  type ChatStep,
  type Artifact,
  STEP_LABEL_PREFIX,
} from "@/lib/deepsite/agent-events";

interface StepCardProps {
  step: ChatStep;
  artifacts: Record<string, Artifact>;
  onPreview: (contentId: string) => void;
}

// İşlem türüne göre ikon bileşeni
function ActionIcon({ action }: { action: ChatStep["action"] }) {
  const cls = "size-3.5 shrink-0";
  switch (action) {
    case "write_file":
      return <Pencil className={cls} />;
    case "read_file":
      return <FileText className={cls} />;
    case "run_cmd":
      return <Terminal className={cls} />;
    case "message":
      return <MessageSquare className={cls} />;
    case "review":
      return <Search className={cls} />;
    default:
      return <span className="size-3.5 shrink-0">•</span>;
  }
}

// İşlem türüne göre kart renk şeması
const ACTION_STYLE: Record<string, { bg: string; border: string; icon: string; text: string }> = {
  write_file: {
    bg: "bg-blue-950/40",
    border: "border-blue-800/40",
    icon: "text-blue-400",
    text: "text-blue-200",
  },
  read_file: {
    bg: "bg-neutral-800/50",
    border: "border-neutral-700/50",
    icon: "text-neutral-400",
    text: "text-neutral-300",
  },
  run_cmd: {
    bg: "bg-amber-950/30",
    border: "border-amber-800/30",
    icon: "text-amber-400",
    text: "text-amber-200",
  },
  message: {
    bg: "bg-transparent",
    border: "border-transparent",
    icon: "text-neutral-500",
    text: "text-neutral-300",
  },
  review: {
    bg: "bg-purple-950/30",
    border: "border-purple-800/30",
    icon: "text-purple-400",
    text: "text-purple-200",
  },
};

export function StepCard({ step, artifacts, onPreview }: StepCardProps) {
  const hasArtifact = !!step.contentId && step.contentId in artifacts;
  const isMessage = step.action === "message" || step.action === "review";
  const style = ACTION_STYLE[step.action] ?? ACTION_STYLE.read_file;
  const prefix = isMessage ? "" : STEP_LABEL_PREFIX[step.action] ?? "";

  const handleClick = () => {
    if (hasArtifact && step.contentId) {
      onPreview(step.contentId);
    }
  };

  // ⚠️ Stack compliance / sistem uyarısı → sarı banner
  const isWarning =
    step.action === "message" &&
    step.label &&
    (step.label.startsWith("⚠️") || step.label.startsWith("⛔") || step.label.includes("UYARI"));

  if (isWarning) {
    return (
      <div className="flex items-start gap-2 px-2.5 py-2 rounded-md border border-amber-600/40 bg-amber-950/30 text-xs text-amber-200 leading-relaxed">
        <span className="shrink-0 text-sm leading-tight">⚠️</span>
        <span className="flex-1 break-words">{step.label.replace(/^⚠️\s*/, "")}</span>
      </div>
    );
  }

  // Mesaj tipi: düz metin satırı (kart yok)
  if (isMessage) {
    return (
      <div className="flex items-start gap-2 py-0.5 px-1 text-xs text-neutral-400 leading-relaxed">
        <MessageSquare className="size-3 shrink-0 mt-0.5 text-neutral-600" />
        <span className="flex-1 break-words">{step.label}</span>
      </div>
    );
  }

  return (
    <div
      className={[
        "flex items-center gap-2 px-2.5 py-2 rounded-md border text-xs transition-colors",
        style.bg,
        style.border,
        hasArtifact ? "cursor-pointer hover:brightness-125" : "cursor-default",
      ].join(" ")}
      onClick={hasArtifact ? handleClick : undefined}
      role={hasArtifact ? "button" : undefined}
      tabIndex={hasArtifact ? 0 : undefined}
      onKeyDown={
        hasArtifact
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") handleClick();
            }
          : undefined
      }
    >
      {/* İkon */}
      <span className={style.icon}>
        <ActionIcon action={step.action} />
      </span>

      {/* Etiket */}
      <span className={["flex-1 min-w-0 truncate font-mono leading-tight", style.text].join(" ")}>
        {prefix ? (
          <>
            <span className="opacity-60 font-sans not-italic mr-1">{prefix}</span>
            {step.label}
          </>
        ) : (
          step.label
        )}
      </span>

      {/* View butonu — artifact varsa */}
      {hasArtifact && (
        <span className="shrink-0 flex items-center gap-1 text-[10px] text-blue-400 border border-blue-800/50 rounded px-1.5 py-0.5 bg-blue-900/30 hover:bg-blue-800/40 transition-colors">
          <Eye className="size-2.5" />
          View
        </span>
      )}

      {/* Artifact bekleniyor göstergesi */}
      {step.contentId && !hasArtifact && (
        <span className="shrink-0 w-3.5 h-3.5 border-2 border-neutral-600 border-t-transparent rounded-full animate-spin opacity-50" />
      )}
    </div>
  );
}
