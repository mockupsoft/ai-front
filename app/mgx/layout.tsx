import type { Metadata } from "next";

import { MgxBreadcrumb } from "@/components/mgx/breadcrumb";
import { MgxHeader } from "@/components/mgx/header";
import { MgxSidebar } from "@/components/mgx/sidebar";
import { MgxSidebarNav } from "@/components/mgx/sidebar-nav";
import { SidebarProvider } from "@/contexts/sidebar-context";

export const metadata: Metadata = {
  title: "MGX Dashboard",
  description: "TEM dashboard shell",
};

export default function MgxLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      <div 
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
        }}
        className="text-zinc-900 dark:text-zinc-50"
      >
        <MgxSidebar />

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          height: '100vh', 
          width: '100%',
          overflow: 'hidden',
          minWidth: 0,
          minHeight: 0
        }}>
          <MgxHeader />

          <div className="border-b border-zinc-200 bg-white px-6 py-2 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
            <MgxSidebarNav variant="horizontal" />
          </div>

          <div className="border-b border-zinc-200 bg-white px-6 py-2 dark:border-zinc-800 dark:bg-zinc-950">
            <MgxBreadcrumb />
          </div>

          <main 
            className="overflow-y-auto"
            style={{ 
              flex: 1, 
              minHeight: 0, 
              overflowY: 'auto', 
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              maxHeight: 'calc(100vh - 57px - 37px)'
            }}
          >
            <div 
              className="main-content-wrapper"
              style={{ 
                minHeight: 0, 
                flex: '1 1 0%', 
                display: 'flex', 
                flexDirection: 'column',
                overflow: 'hidden',
                height: '100%',
                maxHeight: '100%'
              }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
