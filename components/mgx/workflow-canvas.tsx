"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent,
} from "react";

import type {
  WorkflowEdge,
  WorkflowStep,
  WorkflowStepPosition,
  WorkflowStepType,
} from "@/lib/types/workflows";
import { cn } from "@/lib/utils";

const CANVAS_SIZE = 2400;
const NODE_WIDTH = 200;
const NODE_HEIGHT = 72;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stepCenter(step: WorkflowStep) {
  return {
    x: step.position.x + NODE_WIDTH / 2,
    y: step.position.y + NODE_HEIGHT / 2,
  };
}

export type WorkflowCanvasView = {
  x: number;
  y: number;
  zoom: number;
};

export interface WorkflowCanvasProps {
  steps: WorkflowStep[];
  edges: WorkflowEdge[];
  selectedStepId?: string;
  linkingFromStepId?: string | null;
  issuesByStepId?: Record<string, number>;

  view: WorkflowCanvasView;
  onChangeView: (view: WorkflowCanvasView) => void;

  onSelectStep: (stepId: string | undefined) => void;
  onMoveStep: (stepId: string, position: WorkflowStepPosition) => void;
  onDropNewStep: (type: WorkflowStepType, position: WorkflowStepPosition) => void;
  onCreateEdge: (fromStepId: string, toStepId: string) => void;
}

export function WorkflowCanvas({
  steps,
  edges,
  selectedStepId,
  linkingFromStepId,
  issuesByStepId,
  view,
  onChangeView,
  onSelectStep,
  onMoveStep,
  onDropNewStep,
  onCreateEdge,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dragState, setDragState] = useState<
    | {
        stepId: string;
        startClientX: number;
        startClientY: number;
        startX: number;
        startY: number;
      }
    | null
  >(null);

  const [panState, setPanState] = useState<
    | {
        startClientX: number;
        startClientY: number;
        startX: number;
        startY: number;
      }
    | null
  >(null);

  const stepsById = useMemo(() => {
    const map = new Map<string, WorkflowStep>();
    for (const step of steps) map.set(step.id, step);
    return map;
  }, [steps]);

  const renderedEdges = useMemo(() => {
    return edges
      .map((edge) => {
        const from = stepsById.get(edge.fromStepId);
        const to = stepsById.get(edge.toStepId);
        if (!from || !to) return null;
        const a = stepCenter(from);
        const b = stepCenter(to);
        return { id: edge.id, a, b };
      })
      .filter(Boolean) as { id: string; a: { x: number; y: number }; b: { x: number; y: number } }[];
  }, [edges, stepsById]);

  useEffect(() => {
    if (!dragState && !panState) return;

    const handleMove = (event: PointerEvent) => {
      if (dragState) {
        const dx = (event.clientX - dragState.startClientX) / view.zoom;
        const dy = (event.clientY - dragState.startClientY) / view.zoom;
        onMoveStep(dragState.stepId, {
          x: clamp(dragState.startX + dx, 0, CANVAS_SIZE - NODE_WIDTH),
          y: clamp(dragState.startY + dy, 0, CANVAS_SIZE - NODE_HEIGHT),
        });
        return;
      }

      if (panState) {
        const dx = event.clientX - panState.startClientX;
        const dy = event.clientY - panState.startClientY;
        onChangeView({ ...view, x: panState.startX + dx, y: panState.startY + dy });
      }
    };

    const handleUp = () => {
      setDragState(null);
      setPanState(null);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState, panState, onMoveStep, onChangeView, view]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();

    const delta = event.deltaY;
    const direction = delta > 0 ? -1 : 1;
    const nextZoom = clamp(view.zoom + direction * 0.1, 0.4, 2.5);
    onChangeView({ ...view, zoom: nextZoom });
  };

  const clientToCanvas = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    const x = (clientX - rect.left - view.x) / view.zoom;
    const y = (clientY - rect.top - view.y) / view.zoom;

    return {
      x: clamp(x, 0, CANVAS_SIZE - NODE_WIDTH),
      y: clamp(y, 0, CANVAS_SIZE - NODE_HEIGHT),
    };
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/x-workflow-step-type") as WorkflowStepType;
    if (!type) return;

    const position = clientToCanvas(event.clientX, event.clientY);
    onDropNewStep(type, position);
  };

  const handlePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-step-node]")) return;

    setPanState({
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: view.x,
      startY: view.y,
    });
    onSelectStep(undefined);
  };

  const canvasTransform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePanStart}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={cn(
        "relative h-[620px] w-full overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950",
        "touch-none",
      )}
      aria-label="Workflow canvas"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(148,163,184,0.25) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          width: CANVAS_SIZE,
          height: CANVAS_SIZE,
          transform: canvasTransform,
        }}
      >
        <svg
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="absolute left-0 top-0"
        >
          {renderedEdges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.a.x}
              y1={edge.a.y}
              x2={edge.b.x}
              y2={edge.b.y}
              stroke="rgba(148,163,184,0.9)"
              strokeWidth={2}
              markerEnd="url(#arrow)"
            />
          ))}
          <defs>
            <marker
              id="arrow"
              markerWidth="10"
              markerHeight="10"
              refX="8"
              refY="3"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L0,6 L9,3 z" fill="rgba(148,163,184,0.9)" />
            </marker>
          </defs>
        </svg>

        {steps.map((step) => {
          const issueCount = issuesByStepId?.[step.id] ?? 0;
          const isSelected = selectedStepId === step.id;
          const isLinkSource = linkingFromStepId === step.id;

          return (
            <div
              key={step.id}
              data-step-node
              role="button"
              tabIndex={0}
              aria-label={`Step ${step.name}`}
              className={cn(
                "absolute rounded-lg border bg-white px-3 py-2 shadow-sm",
                "dark:bg-zinc-950",
                isSelected
                  ? "border-zinc-900 ring-2 ring-zinc-900/10 dark:border-zinc-50 dark:ring-zinc-50/10"
                  : "border-zinc-200 dark:border-zinc-800",
                isLinkSource && "ring-2 ring-emerald-400",
              )}
              style={{
                width: NODE_WIDTH,
                height: NODE_HEIGHT,
                left: step.position.x,
                top: step.position.y,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                setDragState({
                  stepId: step.id,
                  startClientX: event.clientX,
                  startClientY: event.clientY,
                  startX: step.position.x,
                  startY: step.position.y,
                });
                onSelectStep(step.id);
              }}
              onClick={(event) => {
                event.stopPropagation();

                if (linkingFromStepId && linkingFromStepId !== step.id) {
                  onCreateEdge(linkingFromStepId, step.id);
                  return;
                }

                onSelectStep(step.id);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  onSelectStep(step.id);
                }
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                    {step.name}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {step.type}
                  </p>
                </div>

                {issueCount > 0 ? (
                  <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-rose-100 px-2 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">
                    {issueCount}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-3 right-3 rounded-md bg-white/90 px-2 py-1 text-xs text-zinc-600 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-300">
        {Math.round(view.zoom * 100)}%
      </div>
    </div>
  );
}
