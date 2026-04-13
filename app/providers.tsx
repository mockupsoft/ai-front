'use client'

import { ReactNode, Suspense } from 'react'
import { WorkspaceProvider } from '@/lib/mgx/workspace/workspace-context'
import { WebSocketProvider } from '@/components/WebSocketProvider'
import { ServiceWorkerProvider } from '@/components/ServiceWorkerProvider'
import { HydrationFix } from '@/components/hydration-fix'
import { Toaster } from 'sonner'

function WorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceProvider>
      <WebSocketProvider>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', width: '100%', overflow: 'hidden' }}>
          {children}
        </div>
        <Toaster
          position="bottom-right"
          duration={4500}
          closeButton
          toastOptions={{ duration: 4500 }}
        />
      </WebSocketProvider>
    </WorkspaceProvider>
  )
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ServiceWorkerProvider>
      <HydrationFix />
      <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-zinc-500">Loading…</div>}>
        <WorkspaceShell>{children}</WorkspaceShell>
      </Suspense>
    </ServiceWorkerProvider>
  )
}
