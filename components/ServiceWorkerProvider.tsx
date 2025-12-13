'use client';

import React, { useEffect } from 'react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  const { isAvailable } = useServiceWorker();

  useEffect(() => {
    if (!isAvailable) {
      console.log('Service Worker not available');
      return;
    }

    // Listen for custom service worker events
    const handleSWMessage = (event: CustomEvent) => {
      const { type, payload } = event.detail;

      // Handle different message types from service worker
      switch (type) {
        case 'TASK_STARTED':
          console.log('Background task started:', payload);
          break;
        case 'TASK_STATUS_UPDATE':
          console.log('Task status updated in background:', payload);
          break;
        case 'SYNC_PENDING_TASKS':
          console.log('Syncing pending tasks...');
          break;
        default:
          break;
      }
    };

    window.addEventListener('sw-message', handleSWMessage as EventListener);

    return () => {
      window.removeEventListener('sw-message', handleSWMessage as EventListener);
    };
  }, [isAvailable]);

  return <>{children}</>;
}
