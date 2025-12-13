import type { AgentMessage, TaskRun } from "@/lib/types";

const DB_NAME = "task-executor";
const DB_VERSION = 1;
const STORE_NAMES = {
  AGENT_MESSAGES: "agent-messages",
  TASK_RUNS: "task-runs",
};

let db: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains(STORE_NAMES.AGENT_MESSAGES)) {
        const messagesStore = database.createObjectStore(STORE_NAMES.AGENT_MESSAGES, {
          keyPath: "id",
        });
        messagesStore.createIndex("taskId", "taskId", { unique: false });
        messagesStore.createIndex("runId", "runId", { unique: false });
        messagesStore.createIndex("timestamp", "timestamp", { unique: false });
      }

      if (!database.objectStoreNames.contains(STORE_NAMES.TASK_RUNS)) {
        const runsStore = database.createObjectStore(STORE_NAMES.TASK_RUNS, {
          keyPath: "runId",
        });
        runsStore.createIndex("taskId", "taskId", { unique: false });
        runsStore.createIndex("startedAt", "startedAt", { unique: false });
      }
    };
  });
}

export async function saveAgentMessage(message: AgentMessage): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAMES.AGENT_MESSAGES], "readwrite");
    const store = transaction.objectStore(STORE_NAMES.AGENT_MESSAGES);
    const request = store.put(message);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getAgentMessages(taskId: string, runId?: string): Promise<AgentMessage[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAMES.AGENT_MESSAGES], "readonly");
    const store = transaction.objectStore(STORE_NAMES.AGENT_MESSAGES);

    const request = store.index("taskId").getAll(taskId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const results = request.result;
      if (runId) {
        resolve(results.filter((msg) => msg.runId === runId));
      } else {
        resolve(results);
      }
    };
  });
}

export async function saveTaskRun(run: TaskRun): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAMES.TASK_RUNS], "readwrite");
    const store = transaction.objectStore(STORE_NAMES.TASK_RUNS);
    const request = store.put(run);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getTaskRun(runId: string): Promise<TaskRun | undefined> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAMES.TASK_RUNS], "readonly");
    const store = transaction.objectStore(STORE_NAMES.TASK_RUNS);
    const request = store.get(runId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function getTaskRunsByTaskId(taskId: string): Promise<TaskRun[]> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAMES.TASK_RUNS], "readonly");
    const store = transaction.objectStore(STORE_NAMES.TASK_RUNS);
    const request = store.index("taskId").getAll(taskId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

export async function clearOldMessages(taskId: string, olderThan: number): Promise<void> {
  const database = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction([STORE_NAMES.AGENT_MESSAGES], "readwrite");
    const store = transaction.objectStore(STORE_NAMES.AGENT_MESSAGES);
    const request = store.index("taskId").getAll(taskId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const messagesToDelete = request.result.filter((msg) => msg.timestamp < olderThan);
      messagesToDelete.forEach((msg) => {
        store.delete(msg.id);
      });
      resolve();
    };
  });
}
