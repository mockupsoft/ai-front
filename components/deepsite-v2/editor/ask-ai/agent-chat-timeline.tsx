"use client";

import React from "react";
import {
  type ChatItem,
  type Artifact,
  AGENT_META,
} from "@/lib/deepsite/agent-events";
import { StepCard } from "./step-card";

// Emoji avatar mapping
const AGENT_EMOJI: Record<string, string> = {
  Mike: "👔",
  Alex: "🦉",
  Bob: "🐧",
  Charlie: "🔮",
  System: "⚙️",
};

interface AgentChatTimelineProps {
  items: ChatItem[];
  artifacts: Record<string, Artifact>;
  onPreview: (contentId: string) => void;
}

export function AgentChatTimeline({
  items,
  artifacts,
  onPreview,
}: AgentChatTimelineProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 px-3 pb-4">
      {items.map((item) => {
        if (item.type === "task_header") {
          return <TaskHeader key={item.id} item={item} />;
        }
        if (item.type === "warning_banner") {
          return <WarningBanner key={item.id} message={item.summary ?? ""} />;
        }
        return (
          <AgentBlock
            key={item.id}
            item={item}
            artifacts={artifacts}
            onPreview={onPreview}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Warning Banner — stack compliance uyarıları
// ---------------------------------------------------------------------------

function WarningBanner({ message }: { message: string }) {
  const clean = message.replace(/^⚠️\s*/, "").replace(/^⛔\s*/, "");
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-amber-500/30 bg-amber-950/25 text-xs text-amber-200 leading-relaxed my-1">
      <span className="shrink-0 text-sm">⚠️</span>
      <span className="flex-1 break-words">{clean}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Task Header
// ---------------------------------------------------------------------------

function TaskHeader({ item }: { item: ChatItem }) {
  return (
    <div className="flex items-center gap-2 my-2">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-[11px] text-neutral-400 font-medium px-2 leading-snug">
        {item.summary ?? "Görev başlatıldı"}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Agent Block
// ---------------------------------------------------------------------------

interface AgentBlockProps {
  item: ChatItem;
  artifacts: Record<string, Artifact>;
  onPreview: (contentId: string) => void;
}

function AgentBlock({ item, artifacts, onPreview }: AgentBlockProps) {
  // Adımlar varsayılan açık gelir — kullanıcı görevleri görebilsin
  const [stepsOpen, setStepsOpen] = React.useState(true);
  const agentName = item.agent ?? "System";
  const meta = AGENT_META[agentName as keyof typeof AGENT_META] ?? {
    color: "bg-neutral-500",
    initials: "?",
  };
  const emoji = AGENT_EMOJI[agentName] ?? "🤖";
  const role = item.role ?? "Agent";
  const stepCount = item.stepCount ?? item.steps.length;

  const timeStr = item.ts
    ? new Date(item.ts * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div className="flex gap-3 py-2">
      {/* Avatar */}
      <div className="shrink-0 mt-0.5">
        <div
          className={[
            "w-9 h-9 rounded-full flex items-center justify-center text-lg select-none ring-2 ring-white/10",
            meta.color,
          ].join(" ")}
          title={agentName}
        >
          {emoji}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-bold text-white leading-tight">
            {agentName}
          </span>
          <span className="text-[11px] text-neutral-400 leading-tight">
            {role}
          </span>
          {timeStr && (
            <span className="text-[11px] text-neutral-500 leading-tight ml-auto shrink-0 tabular-nums">
              {timeStr}
            </span>
          )}
        </div>

        {/* Step summary toggle button */}
        {stepCount > 0 && (
          <button
            type="button"
            className={[
              "flex items-center gap-2 text-xs rounded-md px-2.5 py-1.5 mb-1 border transition-colors w-full",
              item.finished
                ? "bg-neutral-800/60 border-neutral-700 text-neutral-300 hover:bg-neutral-700/60"
                : "bg-neutral-800/40 border-neutral-700/60 text-neutral-400 hover:bg-neutral-700/40",
            ].join(" ")}
            onClick={() => setStepsOpen((v) => !v)}
          >
            {/* Status icon */}
            {item.finished ? (
              <span className="text-emerald-400 text-sm">✓</span>
            ) : (
              <span className="inline-block w-3.5 h-3.5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            <span className="flex-1 text-left">
              {item.finished ? "Processed" : "Processing"} {stepCount} step
              {stepCount !== 1 ? "s" : ""}
            </span>
            <span
              className={[
                "text-neutral-500 transition-transform duration-150",
                stepsOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            >
              ∧
            </span>
          </button>
        )}

        {/* Steps list */}
        {stepsOpen && item.steps.length > 0 && (
          <div className="flex flex-col gap-1 mb-1.5 ml-0.5">
            {item.steps.map((step, idx) => (
              <StepCard
                key={idx}
                step={step}
                artifacts={artifacts}
                onPreview={onPreview}
              />
            ))}
          </div>
        )}

        {/* Summary text (agent_end) */}
        {item.finished && item.summary && (
          <p className="mt-1 text-xs text-neutral-300 leading-relaxed">
            {item.summary}
          </p>
        )}

        {/* Error state */}
        {item.hasError && (
          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
            <span>⚠</span>
            <span>Bir hata oluştu. Lütfen tekrar deneyin.</span>
          </div>
        )}
      </div>
    </div>
  );
}
