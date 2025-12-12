import useSWR from "swr";

import { mgxRestClient } from "@/lib/mgx/rest-client";
import type { MgxTask } from "@/lib/mgx/types";

const fetchTasks = () => mgxRestClient.get<MgxTask[]>("/tasks");

export function useTasks() {
  return useSWR("mgx:tasks", fetchTasks);
}
