'use client'

import { ReactNode } from 'react'
import { WorkspaceProvider } from '@/lib/mgx/workspace/workspace-context'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'
import { HydrationFix } from '@/components/hydration-fix'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ServiceWorkerProvider>
      <HydrationFix />
      <WorkspaceProvider>
        <WebSocketProvider>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
            {children}
          </div>
          <Toaster />
        </WebSocketProvider>
      </WorkspaceProvider>
    </ServiceWorkerProvider>
  )
}
