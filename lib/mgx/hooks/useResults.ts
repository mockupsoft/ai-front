import useSWR from "swr";

import { mgxRestClient } from "@/lib/mgx/rest-client";
import type { MgxResult } from "@/lib/mgx/types";

const fetchResults = () => mgxRestClient.get<MgxResult[]>("/results");
const fetchResult = (id: string) => mgxRestClient.get<MgxResult>(`/results/${id}`);

export function useResults() {
  return useSWR("mgx:results", fetchResults);
}

export function useResult(id: string) {
  return useSWR(id ? `mgx:result:${id}` : null, () => fetchResult(id));
}
