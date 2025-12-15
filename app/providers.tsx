'use client'

import { ReactNode, Suspense } from 'react'
import { WorkspaceProvider } from '@/lib/mgx/workspace/workspace-context'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'
import { Toaster } from 'sonner'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ServiceWorkerProvider>
      <Suspense
        fallback={
          <WebSocketProvider>
            {children}
            <Toaster />
          </WebSocketProvider>
        }
      >
        <WorkspaceProvider>
          <WebSocketProvider>
            {children}
            <Toaster />
          </WebSocketProvider>
        </WorkspaceProvider>
      </Suspense>
    </ServiceWorkerProvider>
  )
}
