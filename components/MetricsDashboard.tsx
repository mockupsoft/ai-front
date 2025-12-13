'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { useMetrics } from '@/lib/hooks';
import { useWebSocket } from './WebSocketProvider';
import { Metrics } from '@/lib/types';

// Helper for Card
const MetricCard = ({ title, value, unit }: { title: string, value: string | number, unit?: string }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
    <h3 className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</h3>
    <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</span>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
    </div>
  </div>
);

export function MetricsDashboard() {
  const { metrics: initialMetrics, isLoading } = useMetrics();
  const { lastMessage } = useWebSocket();
  const [metricsData, setMetricsData] = useState<Metrics[]>([]);
  const [timeRange, setTimeRange] = useState('1h');

  // Initialize metrics data with initial metrics
  const initialData = useMemo(() => {
    return initialMetrics || [];
  }, [initialMetrics]);

  useEffect(() => {
    setMetricsData(initialData);
  }, [initialData]);

  // Handle WS updates
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'metrics_update') {
      const newMetric = lastMessage.payload as Metrics;
      setMetricsData((prev: Metrics[]) => {
          const newData = [...prev, newMetric];
          // Keep only last N points to avoid memory issues if running long
          if (newData.length > 100) return newData.slice(newData.length - 100);
          return newData;
      });
    }
  }, [lastMessage]);

  const latest = metricsData[metricsData.length - 1] || { latency: 0, cacheHits: 0, throughput: 0 };

  if (isLoading && metricsData.length === 0) return <div>Loading metrics...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Real-time Metrics</h1>
        <div className="space-x-2">
            <button onClick={() => setTimeRange('1h')} className={`px-3 py-1 rounded ${timeRange === '1h' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>1h</button>
            <button onClick={() => setTimeRange('24h')} className={`px-3 py-1 rounded ${timeRange === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>24h</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Latency" value={latest.latency.toFixed(2)} unit="ms" />
        <MetricCard title="Cache Hits" value={latest.cacheHits} unit="%" />
        <MetricCard title="Throughput" value={latest.throughput} unit="req/s" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Latency & Throughput</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
              <Line yAxisId="left" type="monotone" dataKey="latency" stroke="#8884d8" dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#82ca9d" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="h-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-4">Cache Hits</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metricsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString()} />
              <YAxis />
              <Tooltip labelFormatter={(t) => new Date(t).toLocaleString()} />
              <Bar dataKey="cacheHits" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
