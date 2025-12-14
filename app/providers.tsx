'use client'

import { ReactNode } from 'react'
import { WorkspaceProvider } from '@/lib/mgx/workspace/workspace-context'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ServiceWorkerProvider>
      <WorkspaceProvider>
        <WebSocketProvider>
          {children}
          <Toaster />
        </WebSocketProvider>
      </WorkspaceProvider>
    </ServiceWorkerProvider>
  )
}
