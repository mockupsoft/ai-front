export type MgxTaskStatus = "queued" | "running" | "success" | "failed" | "canceled";

export type MgxTask = {
  id: string;
  name: string;
  status: MgxTaskStatus;
  createdAt: string;
  updatedAt: string;
  owner?: string;
};

export type MgxMetricPoint = {
  ts: string;
  value: number;
};

export type MgxMetricSeries = {
  name: string;
  unit?: string;
  points: MgxMetricPoint[];
};

export type MgxResultType = "summary" | "file" | "report";

export type MgxResultArtifact = {
  id: string;
  name: string;
  type: "code" | "test" | "review" | "markdown" | "json" | "binary";
  content?: string;
  downloadUrl?: string;
  size?: number;
  language?: string;
};

export type MgxResult = {
  id: string;
  taskId: string;
  taskName?: string;
  createdAt: string;
  type: MgxResultType;
  summary: string;
  content?: string; // Full content for report/summary types
  artifacts?: MgxResultArtifact[];
};
