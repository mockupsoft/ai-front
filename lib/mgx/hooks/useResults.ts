import useSWR from "swr";

import { mgxRestClient } from "@/lib/mgx/rest-client";
import type { MgxResult } from "@/lib/mgx/types";

const fetchResults = () => mgxRestClient.get<MgxResult[]>("/results");

export function useResults() {
  return useSWR("mgx:results", fetchResults);
}
