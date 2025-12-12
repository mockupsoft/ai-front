import useSWR from "swr";

import { mgxRestClient } from "@/lib/mgx/rest-client";
import type { MgxMetricSeries } from "@/lib/mgx/types";

const fetchMetrics = () => mgxRestClient.get<MgxMetricSeries[]>("/metrics");

export function useMetrics() {
  return useSWR("mgx:metrics", fetchMetrics);
}
