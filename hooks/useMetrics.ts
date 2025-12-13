"use client";

import useSWR from "swr";

import { fetcher } from "@/lib/api";
import type { Metrics } from "@/lib/types";

export function useMetrics() {
  const { data, error, isLoading, mutate } = useSWR<Metrics[]>("/metrics", fetcher, {
    refreshInterval: 5000,
  });

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  };
}
