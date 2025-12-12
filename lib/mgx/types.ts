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

export type MgxResult = {
  id: string;
  taskId: string;
  createdAt: string;
  summary: string;
};
