import useSWR from "swr";

import { mgxRestClient } from "@/lib/mgx/rest-client";
import type { MgxTask } from "@/lib/mgx/types";

export function useTask(id: string | undefined) {
  return useSWR(id ? `mgx:tasks:${id}` : null, () =>
    mgxRestClient.get<MgxTask>(`/tasks/${id!}`),
  );
}
