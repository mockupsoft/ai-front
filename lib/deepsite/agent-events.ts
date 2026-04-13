/**
 * MGX Agent Event Types — DeepSite Chat Timeline
 *
 * Backend (mgx_bridge.py) bu formatta NDJSON satırları yayar.
 * Her satır bir JSON objesidir; satırlar \n ile ayrılır.
 * HTML sentinel (__HTML_START__) sonrası ham HTML gelir.
 */

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export type AgentName = "Mike" | "Alex" | "Bob" | "Charlie" | "System";
export type AgentRole = "Team Leader" | "Engineer" | "Tester" | "Reviewer" | "System";

export type StepAction =
  | "write_file"
  | "read_file"
  | "run_cmd"
  | "message"
  | "review";

export type AgentEventType =
  | "task_created"
  | "agent_start"
  | "step"
  | "artifact_ready"
  | "agent_end"
  | "html_ready"
  | "version_created"
  | "error"
  | "done";

// ---------------------------------------------------------------------------
// Individual event shapes
// ---------------------------------------------------------------------------

export interface TaskCreatedEvent {
  type: "task_created";
  task: string;
  ts?: number;
}

export interface AgentStartEvent {
  type: "agent_start";
  agent: AgentName;
  role: AgentRole;
  ts?: number;
}

export interface StepEvent {
  type: "step";
  agent: AgentName;
  action: StepAction;
  /** Dosya adı, mesaj metni, komut vb. */
  label: string;
  /** artifact_ready ile eşleşecek ID (isteğe bağlı) */
  content_id?: string;
  ts?: number;
}

export interface ArtifactReadyEvent {
  type: "artifact_ready";
  content_id: string;
  filename: string;
  language: string;
  /** Dosya içeriği (küçük dosyalar için inline) */
  content: string;
}

export interface AgentEndEvent {
  type: "agent_end";
  agent: AgentName;
  step_count: number;
  summary?: string;
  ts?: number;
}

export interface HtmlReadyEvent {
  type: "html_ready";
  char_count?: number;
}

export interface VersionCreatedEvent {
  type: "version_created";
  version: number;
  title: string;
}

export interface ErrorEvent {
  type: "error";
  agent?: AgentName;
  message: string;
}

export interface DoneEvent {
  type: "done";
}

export interface WarningEvent {
  type: "warning";
  message: string;
  ts?: number;
}

export interface FileReadyEvent {
  type: "file_ready";
  path: string;
  content: string;
  ts?: number;
}

export interface ProjectRulesEvent {
  type: "project_rules";
  rules: string;
  stack?: string;
  ts?: number;
}

/** Union of all agent events */
export type AgentEvent =
  | TaskCreatedEvent
  | AgentStartEvent
  | StepEvent
  | ArtifactReadyEvent
  | AgentEndEvent
  | HtmlReadyEvent
  | VersionCreatedEvent
  | ErrorEvent
  | DoneEvent
  | WarningEvent
  | FileReadyEvent
  | ProjectRulesEvent;

// ---------------------------------------------------------------------------
// Frontend state shapes (derived from events)
// ---------------------------------------------------------------------------

export interface ChatStep {
  action: StepAction;
  label: string;
  contentId?: string;
}

export interface ChatItem {
  id: string;
  type: "task_header" | "agent_block" | "warning_banner";
  agent?: AgentName;
  role?: AgentRole;
  ts: number;
  steps: ChatStep[];
  summary?: string;
  finished: boolean;
  stepCount?: number;
  stepsExpanded: boolean;
  hasError?: boolean;
}

export interface Artifact {
  filename: string;
  language: string;
  content: string;
}

// ---------------------------------------------------------------------------
// Agent metadata (avatars, colors)
// ---------------------------------------------------------------------------

export const AGENT_META: Record<AgentName, { color: string; initials: string }> = {
  Mike: { color: "bg-amber-500", initials: "M" },
  Alex: { color: "bg-blue-500", initials: "A" },
  Bob: { color: "bg-green-500", initials: "B" },
  Charlie: { color: "bg-purple-500", initials: "C" },
  System: { color: "bg-neutral-500", initials: "S" },
};

export const AGENT_ROLE: Record<AgentName, AgentRole> = {
  Mike: "Team Leader",
  Alex: "Engineer",
  Bob: "Tester",
  Charlie: "Reviewer",
  System: "System",
};

// ---------------------------------------------------------------------------
// Step icon helpers
// ---------------------------------------------------------------------------

export const STEP_ICON: Record<StepAction, string> = {
  write_file: "✏️",
  read_file: "📄",
  run_cmd: "⬡",
  message: "💬",
  review: "🔍",
};

export const STEP_LABEL_PREFIX: Record<StepAction, string> = {
  write_file: "Write file",
  read_file: "Read file",
  run_cmd: "Run command in Terminal",
  message: "",
  review: "Review",
};

// ---------------------------------------------------------------------------
// HTML sentinel constant (must match backend)
// ---------------------------------------------------------------------------

export const HTML_SENTINEL = "__HTML_START__";
