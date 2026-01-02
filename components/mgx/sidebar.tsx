"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Search, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import { MgxSidebarNav } from "@/components/mgx/sidebar-nav";
import { Button } from "@/components/mgx/ui/button";
import { useTasks } from "@/hooks/useTasks";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

export function MgxSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const router = useRouter();
  const { tasks, isLoading } = useTasks();
  const [now, setNow] = useState<Date | null>(null);
  const [previousTasksLimit, setPreviousTasksLimit] = useState(20);
  const previousTasksRef = useRef<HTMLDivElement>(null);

  // Set current date on client-side only to avoid hydration mismatch
  useEffect(() => {
    setNow(new Date());
  }, []);

  // Ensure tasks is an array
  const tasksArray = Array.isArray(tasks) ? tasks : [];

  // Group tasks by date (only when now is available)
  const yesterday = now ? new Date(now) : null;
  if (yesterday) {
    yesterday.setDate(yesterday.getDate() - 1);
  }

  const filteredTasks = tasksArray.filter((task) =>
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tasks by createdAt or updatedAt (newest first)
  const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.createdAt || a.updatedAt || 0).getTime();
    const dateB = new Date(b.createdAt || b.updatedAt || 0).getTime();
    return dateB - dateA; // Descending order (newest first)
  });

  const yesterdayTasks = now && yesterday ? sortedFilteredTasks.filter((task) => {
    const taskDate = new Date(task.createdAt || task.updatedAt || 0);
    return taskDate >= yesterday && taskDate < now;
  }) : [];

  const allPreviousTasks = yesterday ? sortedFilteredTasks.filter((task) => {
    const taskDate = new Date(task.createdAt || task.updatedAt || 0);
    return taskDate < yesterday;
  }) : [];

  // Apply limit for infinite scroll
  const previousTasks = allPreviousTasks.slice(0, previousTasksLimit);

  const formatTaskName = (name: string, maxLength: number = 30) => {
    return name.length > maxLength ? `${name.substring(0, maxLength)}...` : name;
  };

  // Infinite scroll handler for previous tasks
  const handlePreviousTasksScroll = useCallback(() => {
    if (!previousTasksRef.current) return;
    
    const element = previousTasksRef.current;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Load more when scrolled to 80% of the container
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      if (previousTasksLimit < allPreviousTasks.length) {
        setPreviousTasksLimit(prev => Math.min(prev + 20, allPreviousTasks.length));
      }
    }
  }, [previousTasksLimit, allPreviousTasks.length]);

  // Attach scroll listener to previous tasks container
  useEffect(() => {
    const element = previousTasksRef.current;
    if (!element || isCollapsed) return;

    element.addEventListener('scroll', handlePreviousTasksScroll);
    return () => {
      element.removeEventListener('scroll', handlePreviousTasksScroll);
    };
  }, [handlePreviousTasksScroll, isCollapsed]);

  return (
    <aside 
      className={cn(
        "hidden shrink-0 border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 lg:flex flex-col h-full transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex h-14 items-center border-b border-zinc-200 dark:border-zinc-800 shrink-0",
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <Link
          href="/mgx"
          className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          title="MGX Dashboard"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900 shrink-0">
            <span className="text-xs font-bold">MGX</span>
          </div>
          {!isCollapsed && <span>MGX Dashboard</span>}
        </Link>
        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
            title="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {isCollapsed && (
        <div className="px-2 py-3 shrink-0">
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center justify-center"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className={cn(
        "flex-1 overflow-y-auto py-4",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {/* New Chat Button */}
        <div className="mb-4">
          {isCollapsed ? (
            <button
              onClick={() => router.push("/mgx/chat/new")}
              className="w-full p-2 rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 flex items-center justify-center"
              title="Start new chat"
            >
              <Plus className="h-5 w-5" />
            </button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              className="w-full"
              onClick={() => router.push("/mgx/chat/new")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Start new chat
            </Button>
          )}
        </div>

        {/* Navigation */}
        <MgxSidebarNav collapsed={isCollapsed} />
        
        {/* Search Chats - only show when expanded */}
        {!isCollapsed && (
          <div className="mt-6 mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-zinc-200 bg-white px-8 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-700 dark:focus:ring-zinc-50"
              />
            </div>
          </div>
        )}

        {/* Chat History */}
        {!isLoading && (yesterdayTasks.length > 0 || previousTasks.length > 0) && (
          <div className="space-y-4">
            {isCollapsed ? (
              /* Collapsed: show chat icon with count */
              <div className="flex flex-col items-center gap-2">
                <div 
                  className="relative p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                  title={`${filteredTasks.length} chats`}
                  onClick={() => setIsCollapsed(false)}
                >
                  <MessageSquare className="h-5 w-5 text-zinc-500" />
                  {filteredTasks.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-zinc-900 dark:bg-zinc-100 text-[10px] font-medium text-white dark:text-zinc-900 flex items-center justify-center">
                      {filteredTasks.length > 9 ? '9+' : filteredTasks.length}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Expanded: show full chat history */
              <>
                {yesterdayTasks.length > 0 && (
                  <div>
                    <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Yesterday
                    </h3>
                    <div className="space-y-1">
                      {yesterdayTasks.map((task) => (
                        <Link
                          key={task.id}
                          href={`/mgx/tasks/${task.id}`}
                          className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                          {formatTaskName(task.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {previousTasks.length > 0 && (
                  <div>
                    <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Previous
                    </h3>
                    <div 
                      ref={previousTasksRef}
                      className="space-y-1 max-h-[400px] overflow-y-auto"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {previousTasks.map((task) => (
                        <Link
                          key={task.id}
                          href={`/mgx/tasks/${task.id}`}
                          className="block rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                        >
                          {formatTaskName(task.name)}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
