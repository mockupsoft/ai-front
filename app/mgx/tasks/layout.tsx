"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function TasksLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  // Chat ekranı: /mgx/tasks/[taskId] formatında, yani pathname'de 3 segment var
  // Örnek: /mgx/tasks/de25acfb-21b5-4217-8889-f5b773fd8197
  // /mgx/tasks sayfası için isChatScreen false olmalı
  const isChatScreen = pathname && pathname !== '/mgx/tasks' && pathname.match(/^\/mgx\/tasks\/[^\/]+$/);

  useEffect(() => {
    const main = document.querySelector('main');
    const mainContentWrapper = document.querySelector('.main-content-wrapper');
    if (!main || !mainContentWrapper) return;

    if (isChatScreen) {
      // Chat ekranı için main element'inin scroll'unu kapat
      main.style.overflow = 'hidden';
      main.style.overflowY = 'hidden';
      // main-content-wrapper'ı da height: 100% yap
      (mainContentWrapper as HTMLElement).style.height = '100%';
      (mainContentWrapper as HTMLElement).style.maxHeight = '100%';
      (mainContentWrapper as HTMLElement).style.overflow = 'hidden';
    } else {
      // Diğer sayfalar için scroll'u aç
      main.style.overflow = '';
      main.style.overflowY = 'auto';
      (mainContentWrapper as HTMLElement).style.height = '';
      (mainContentWrapper as HTMLElement).style.maxHeight = '';
      (mainContentWrapper as HTMLElement).style.overflow = '';
    }
  }, [isChatScreen]);

  return (
    <div 
      className="flex flex-1 flex-col w-full overflow-hidden tasks-layout"
      style={{ 
        flex: 1,
        minHeight: 0,
        height: '100%',
        maxHeight: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {children}
    </div>
  );
}
