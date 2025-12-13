'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface ServiceWorkerMessage {
  type: string;
  payload: unknown;
}

export function useServiceWorker() {
  const swRef = useRef<ServiceWorkerRegistration | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.warn('Service Workers not supported');
      return;
    }

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });
        swRef.current = reg;
        setRegistration(reg);
        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();

    // Listen for messages from service worker
    const handleMessage = (event: MessageEvent<ServiceWorkerMessage>) => {
      const { type, payload } = event.data;
      console.log('Message from Service Worker:', type, payload);

      // You can handle different message types here
      switch (type) {
        case 'TASK_STARTED':
        case 'TASK_STATUS_UPDATE':
        case 'MESSAGES_SYNCED':
        case 'SYNC_PENDING_TASKS':
          // Dispatch custom events that components can listen to
          window.dispatchEvent(
            new CustomEvent('sw-message', {
              detail: { type, payload }
            })
          );
          break;
        default:
          break;
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  const sendMessage = useCallback((message: ServiceWorkerMessage) => {
    if (swRef.current?.active) {
      swRef.current.active.postMessage(message);
    }
  }, []);

  const startBackgroundTask = useCallback(
    (taskId: string, runId: string) => {
      sendMessage({
        type: 'START_BACKGROUND_TASK',
        payload: { taskId, runId }
      });

      // Request background sync
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((reg) => {
          const syncManager = (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync;
          if (syncManager) {
            syncManager.register('sync-pending-tasks').catch(console.error);
          }
        });
      }
    },
    [sendMessage]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, runId: string, status: string) => {
      sendMessage({
        type: 'UPDATE_TASK_STATUS',
        payload: { taskId, runId, status }
      });
    },
    [sendMessage]
  );

  const syncMessages = useCallback(
    (taskId: string, runId: string, messages: unknown[]) => {
      sendMessage({
        type: 'SYNC_MESSAGES',
        payload: { taskId, runId, messages }
      });
    },
    [sendMessage]
  );

  return {
    isAvailable: typeof window !== 'undefined' && 'serviceWorker' in navigator,
    startBackgroundTask,
    updateTaskStatus,
    syncMessages,
    registration,
  };
}
