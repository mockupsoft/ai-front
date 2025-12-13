// Service Worker for background task execution

self.addEventListener('install', () => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('Service Worker activating...');
  clients.claim();
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case 'START_BACKGROUND_TASK':
      handleStartBackgroundTask(payload);
      break;
    case 'UPDATE_TASK_STATUS':
      handleUpdateTaskStatus(payload);
      break;
    case 'SYNC_MESSAGES':
      handleSyncMessages(payload);
      break;
    default:
      console.log('Unknown message type:', type);
  }
});

function handleStartBackgroundTask(payload) {
  const { taskId, runId } = payload;
  console.log(`Starting background task: ${taskId}/${runId}`);

  // Store active task run in IndexedDB through cache
  self.registration.active.postMessage({
    type: 'TASK_STARTED',
    payload: { taskId, runId, startedAt: Date.now() }
  });
}

function handleUpdateTaskStatus(payload) {
  const { taskId, runId, status } = payload;
  console.log(`Task ${runId} status updated to: ${status}`);

  // Notify all clients about status update
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'TASK_STATUS_UPDATE',
        payload: { taskId, runId, status }
      });
    });
  });
}

function handleSyncMessages(payload) {
  const { taskId, runId, messages } = payload;
  console.log(`Syncing ${messages?.length || 0} messages for task ${runId}`);

  // Broadcast synced messages to all clients
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'MESSAGES_SYNCED',
        payload: { taskId, runId, messages }
      });
    });
  });
}

// Periodic background sync (when connection is restored)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-tasks') {
    event.waitUntil(syncPendingTasks());
  }
});

async function syncPendingTasks() {
  try {
    // Try to sync any pending operations
    console.log('Syncing pending tasks...');
    
    // Notify all clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'SYNC_PENDING_TASKS',
        payload: {}
      });
    });
  } catch (error) {
    console.error('Error syncing pending tasks:', error);
  }
}

// Handle push notifications for task updates
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { taskId, runId, status, message } = data;

  const title = `Task Update: ${status}`;
  const options = {
    body: message || `Task ${runId} is now ${status}`,
    icon: '/icon-192x192.png',
    tag: `task-${runId}`,
    requireInteraction: false,
    data: { taskId, runId }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const { taskId } = event.notification.data;

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Look for an existing window/tab with the task open
      for (const client of clientList) {
        if (client.url.includes(`/tasks/${taskId}`) && 'focus' in client) {
          return client.focus();
        }
      }
      // Open a new window if one doesn't exist
      if (clients.openWindow) {
        return clients.openWindow(`/mgx/tasks/${taskId}`);
      }
      return null;
    })
  );
});
