'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useMetrics } from '@/lib/hooks';
import { useWebSocket } from './WebSocketProvider';
import type { Metrics, TaskPhase } from '@/lib/types';

const PHASE_LABELS: Record<TaskPhase, string> = {
  analyze: 'Analyze',
  plan: 'Plan',
  execute: 'Execute',
  review: 'Review',
};

const MetricCard = ({
  title,
  value,
  unit,
}: {
  title: string;
  value: string | number;
  unit?: string;
}) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
    <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</h3>
    <div className="mt-2 flex items-baseline">
      <span className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</span>
      {unit ? <span className="ml-1 text-sm text-zinc-600 dark:text-zinc-400">{unit}</span> : null}
    </div>
  </div>
);

export function MetricsDashboard() {
  const { metrics: initialMetrics, isLoading } = useMetrics();
  const { lastMessage } = useWebSocket();

  const [metricsData, setMetricsData] = useState<Metrics[]>([]);
  const [timeRange, setTimeRange] = useState<'1h' | '24h'>('1h');

  const [thresholds, setThresholds] = useState({
    latencyMs: 250,
    cacheHitsMin: 80,
    memoryMb: 1024,
  });

  const initialData = useMemo(() => initialMetrics || [], [initialMetrics]);

  useEffect(() => {
    setMetricsData(initialData);
  }, [initialData]);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'metrics_update') {
      const newMetric = lastMessage.payload as Metrics;
      setMetricsData((prev) => {
        const next = [...prev, newMetric];
        return next.length > 200 ? next.slice(-200) : next;
      });
    }
  }, [lastMessage]);

  const latest = metricsData[metricsData.length - 1];

  const phaseDurations = useMemo(() => {
    const durations = latest?.phaseDurationsMs;
    const base: Array<{ phase: string; ms: number }> = Object.keys(PHASE_LABELS).map((k) => ({
      phase: PHASE_LABELS[k as TaskPhase],
      ms: durations?.[k as TaskPhase] ?? 0,
    }));
    return base;
  }, [latest?.phaseDurationsMs]);

  const hasAlerts = useMemo(() => {
    if (!latest) return false;
    const memory = latest.memoryUsageMB ?? 0;

    return (
      latest.latency > thresholds.latencyMs ||
      latest.cacheHits < thresholds.cacheHitsMin ||
      memory > thresholds.memoryMb
    );
  }, [latest, thresholds.cacheHitsMin, thresholds.latencyMs, thresholds.memoryMb]);

  if (isLoading && metricsData.length === 0) return <div>Loading metrics...</div>;

  const cacheValue = latest?.cacheHits ?? 0;
  const memoryValue = latest?.memoryUsageMB ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Real-time metrics</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange('1h')}
            className={`rounded-md px-3 py-1 text-sm ${
              timeRange === '1h'
                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            1h
          </button>
          <button
            onClick={() => setTimeRange('24h')}
            className={`rounded-md px-3 py-1 text-sm ${
              timeRange === '24h'
                ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            24h
          </button>
        </div>
      </div>

      {hasAlerts ? (
        <div className="rounded-xl border border-amber-300/50 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200">
          One or more metrics exceeded the configured alert thresholds.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <MetricCard title="Latency" value={(latest?.latency ?? 0).toFixed(2)} unit="ms" />
        <MetricCard title="Cache Hits" value={latest?.cacheHits ?? 0} unit="%" />
        <MetricCard title="Throughput" value={latest?.throughput ?? 0} unit="req/s" />
        <MetricCard title="Memory" value={memoryValue.toFixed(0)} unit="MB" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Async execution timeline
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Throughput over time (proxy for async execution rate).
          </p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip labelFormatter={(t) => new Date(Number(t)).toLocaleString()} />
                <Line type="monotone" dataKey="throughput" stroke="#0ea5e9" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Cache hit rate</h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Gauge representation of cache hits.
          </p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  dataKey="value"
                  data={[
                    { name: 'Hits', value: cacheValue },
                    { name: 'Misses', value: Math.max(0, 100 - cacheValue) },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#e5e7eb" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="-mt-24 text-center">
              <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {cacheValue}%
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">hit rate</div>
            </div>
          </div>
        </div>

        <div className="h-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Memory usage over time
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">From metrics_update.</p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip labelFormatter={(t) => new Date(Number(t)).toLocaleString()} />
                <Line type="monotone" dataKey="memoryUsageMB" stroke="#a855f7" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-72 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Phase duration breakdown
          </h3>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Duration in milliseconds for the latest run.
          </p>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phaseDurations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="phase" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="ms" fill="#0ea5e9" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Performance metrics
            </h3>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Latest point and configured thresholds.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              Latency &lt;
              <input
                className="h-8 w-20 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                type="number"
                value={thresholds.latencyMs}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, latencyMs: Number(e.target.value) }))
                }
              />
              ms
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              Cache hits ≥
              <input
                className="h-8 w-20 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                type="number"
                value={thresholds.cacheHitsMin}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, cacheHitsMin: Number(e.target.value) }))
                }
              />
              %
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              Memory &lt;
              <input
                className="h-8 w-20 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
                type="number"
                value={thresholds.memoryMb}
                onChange={(e) =>
                  setThresholds((prev) => ({ ...prev, memoryMb: Number(e.target.value) }))
                }
              />
              MB
            </label>
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="min-w-full text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-left text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
              <tr>
                <th className="px-3 py-2">Metric</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2">Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              <tr>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">Latency</td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">
                  {(latest?.latency ?? 0).toFixed(2)} ms
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                  &lt; {thresholds.latencyMs} ms
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">Cache hits</td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">{cacheValue}%</td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                  ≥ {thresholds.cacheHitsMin}%
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">Memory</td>
                <td className="px-3 py-2 text-zinc-900 dark:text-zinc-50">
                  {memoryValue.toFixed(0)} MB
                </td>
                <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">
                  &lt; {thresholds.memoryMb} MB
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
