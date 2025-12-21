"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Search, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  RefreshCw, 
  ServerCrash,
  Clock,
  ShieldOff,
  Globe
} from "lucide-react";

import { Button } from "@/components/mgx/ui/button";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import type { Workspace, WorkspaceHealth, WorkspaceError } from "@/lib/types/workspace";

interface WorkspaceSwitcherProps {
  className?: string;
  showCreateButton?: boolean;
  enableSearch?: boolean;
  enableHealthCheck?: boolean;
}

interface HealthIndicatorProps {
  health: WorkspaceHealth | null;
  size?: "sm" | "md" | "lg";
}

function HealthIndicator({ health, size = "sm" }: HealthIndicatorProps) {
  if (!health) return null;

  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  };

  const statusColors = {
    healthy: "bg-green-500 text-green-500",
    degraded: "bg-yellow-500 text-yellow-500",
    offline: "bg-red-500 text-red-500",
  };

  const wsStatusColors = {
    connected: "text-green-500",
    disconnected: "text-red-500",
    connecting: "text-yellow-500 animate-pulse",
  };

  return (
    <div className="flex items-center gap-1">
      <div 
        className={`${sizeClasses[size]} rounded-full ${statusColors[health.status]} animate-pulse`} 
        title={`API Status: ${health.status}`}
      />
      {health.wsStatus && (
        <span title={`WS Status: ${health.wsStatus}`}>
          <Wifi className={`h-3 w-3 ${wsStatusColors[health.wsStatus]}`} />
        </span>
      )}
    </div>
  );
}

interface ErrorDetailsProps {
  error: Error;
}

function ErrorDetails({ error }: ErrorDetailsProps) {
  const isDev = process.env.NODE_ENV === 'development';
  const workspaceError = error as WorkspaceError;

  const getErrorIcon = () => {
    if (workspaceError.isTimeout) return <Clock className="h-4 w-4" />;
    if (workspaceError.isCorsError) return <Globe className="h-4 w-4" />;
    if (workspaceError.isNetworkError) return <WifiOff className="h-4 w-4" />;
    if (workspaceError.isAuthError) return <ShieldOff className="h-4 w-4" />;
    if (workspaceError.statusCode && workspaceError.statusCode >= 500) return <ServerCrash className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  const getErrorMessage = () => {
    if (workspaceError.isTimeout) return 'Connection timeout - Server is taking too long to respond';
    if (workspaceError.isCorsError) return 'CORS error - Cross-origin request blocked';
    if (workspaceError.isNetworkError) return 'Network error - Unable to reach server';
    if (workspaceError.isAuthError) return 'Authentication failed - Please log in again';
    if (workspaceError.statusCode && workspaceError.statusCode === 404) return 'Workspaces not found - Invalid endpoint';
    if (workspaceError.statusCode && workspaceError.statusCode >= 500) return `Server error (${workspaceError.statusCode}) - Please try again later`;
    return workspaceError.message || 'Failed to load workspaces';
  };

  return (
    <div className="text-left">
      <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
        {getErrorIcon()}
        <span className="font-medium">Failed to load workspaces</span>
      </div>
      <div className="text-sm text-red-500 dark:text-red-300 mb-2">
        {getErrorMessage()}
      </div>
      {isDev && workspaceError.stack && (
        <details className="text-xs text-red-400 dark:text-red-200">
          <summary className="cursor-pointer">Debug Info</summary>
          <pre className="mt-1 overflow-auto bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {workspaceError.stack}
          </pre>
        </details>
      )}
    </div>
  );
}

export function WorkspaceSwitcher({ 
  className = "", 
  showCreateButton = true,
  enableSearch = true,
  enableHealthCheck = true,
}: WorkspaceSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingWorkspace, setPendingWorkspace] = useState<Workspace | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    workspaces,
    currentWorkspace,
    filteredWorkspaces,
    health,
    isLoading,
    isError,
    error,
    searchTerm,
    retry,
    refresh,
    setSearchTerm,
    switchWorkspace,
    createWorkspace,
  } = useWorkspaces({
    searchTerm: "",
    enableHealthCheck,
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && enableSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, enableSearch]);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    // Check for running tasks
    const hasRunningTasks = typeof window !== 'undefined' && 
                           sessionStorage.getItem('mgx-running-tasks');

    if (hasRunningTasks && workspace.id !== currentWorkspace?.id) {
      setPendingWorkspace(workspace);
      setShowConfirmDialog(true);
    } else {
      handleSwitchWorkspace(workspace);
    }
  };

  const handleSwitchWorkspace = (workspace: Workspace) => {
    switchWorkspace(workspace);
    setIsOpen(false);
    setShowConfirmDialog(false);
    setPendingWorkspace(null);
  };

  const handleCancelSwitch = () => {
    setShowConfirmDialog(false);
    setPendingWorkspace(null);
  };

  const handleCreateWorkspace = async () => {
    const name = prompt('Enter workspace name:');
    if (!name) return;

    const description = prompt('Enter workspace description (optional):');
    try {
      await createWorkspace(name, description || undefined);
      setIsOpen(false);
    } catch (err) {
      alert(`Failed to create workspace: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRetry = async () => {
    await retry();
  };

  const noWorkspaces = !isLoading && workspaces.length === 0 && !isError;
  const usingOfflineFallback = isError && workspaces.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className="flex items-center gap-2 h-9 px-3 min-w-0"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate max-w-32">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span className="sr-only">Loading...</span>
              </span>
            ) : currentWorkspace ? (
              currentWorkspace.name
            ) : (
              "No workspace"
            )}
          </span>
          {enableHealthCheck && health && (
            <HealthIndicator health={health} size="sm" />
          )}
          {isOpen ? (
            <ChevronUp className="h-3 w-3 flex-shrink-0" />
          ) : (
            <ChevronDown className="h-3 w-3 flex-shrink-0" />
          )}
        </Button>
        
        {usingOfflineFallback && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="h-8 px-2"
            title="Using cached data - Click to retry"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10 bg-black/50 sm:hidden" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 sm:left-0 sm:right-auto top-full z-50 mt-1 w-full sm:w-80 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-lg max-h-96 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Workspaces
              </h3>
              
              {enableSearch && (
                <div className="mt-3 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search workspaces..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:text-zinc-100 focus:bg-white dark:focus:bg-zinc-800"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="max-h-64 overflow-y-auto">
              {isError && error ? (
                <div className="p-4">
                  <ErrorDetails error={error} />
                  <div className="mt-3 space-y-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRetry}
                      className="w-full"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry
                    </Button>
                    {usingOfflineFallback && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                        Using cached data from offline mode
                      </p>
                    )}
                  </div>
                </div>
              ) : isLoading ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-500 border-t-transparent" />
                  <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Loading workspaces...</p>
                </div>
              ) : noWorkspaces ? (
                <div className="p-6 text-center">
                  <Building2 className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                    No workspaces available
                  </p>
                  <Button variant="primary" size="sm" onClick={handleRetry}>
                    Refresh
                  </Button>
                </div>
              ) : filteredWorkspaces.length === 0 ? (
                <div className="p-6 text-center">
                  <Search className="h-8 w-8 text-zinc-400 dark:text-zinc-600 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No workspaces match your search
                  </p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredWorkspaces.map((workspace) => (
                    <button
                      key={workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      className={`w-full px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors ${
                        currentWorkspace?.id === workspace.id
                          ? "bg-zinc-50 dark:bg-zinc-800 border-l-2 border-zinc-500"
                          : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                              {workspace.name}
                            </span>
                            <HealthIndicator health={health} size="sm" />
                          </div>
                          {workspace.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                              {workspace.description}
                            </p>
                          )}
                        </div>
                        {currentWorkspace?.id === workspace.id && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                            Current
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isError && !usingOfflineFallback ? (
                    <span className="text-red-600 dark:text-red-400">Connection failed</span>
                  ) : usingOfflineFallback ? (
                    <span className="text-amber-600 dark:text-amber-400">Offline mode</span>
                  ) : health ? (
                    <span className="flex items-center gap-1">
                      <HealthIndicator health={health} size="sm" />
                      API: {health.apiLatency ? `${health.apiLatency}ms` : 'N/A'}
                    </span>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
                {showCreateButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateWorkspace}
                    disabled={isError}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Create
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 m-4 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Switch Workspace?
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              You have running tasks. Switching to <strong>{pendingWorkspace?.name}</strong> will cancel them. Do you want to continue?
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSwitchWorkspace(pendingWorkspace!)}
                className="flex-1"
              >
                Switch & Cancel Tasks
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelSwitch}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}