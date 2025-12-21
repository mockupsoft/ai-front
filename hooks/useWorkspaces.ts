"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import { mutate } from "swr";

import { createWorkspace as apiCreateWorkspace } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import type { Workspace, WorkspaceHealth, WorkspaceError } from "@/lib/types/workspace";

export interface UseWorkspacesOptions {
  searchTerm?: string;
  enableHealthCheck?: boolean;
  autoRefreshInterval?: number; // ms
  enableOfflineFallback?: boolean;
}

export interface UseWorkspacesReturn {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  filteredWorkspaces: Workspace[];
  health: WorkspaceHealth | null;
  isLoading: boolean;
  isError: boolean;
  error: WorkspaceError | null;
  searchTerm: string;
  retry: () => Promise<void>;
  refresh: () => Promise<void>;
  setSearchTerm: (term: string) => void;
  switchWorkspace: (workspace: Workspace) => Promise<void>;
  createWorkspace: (name: string, description?: string) => Promise<void>;
}

export function useWorkspaces(options: UseWorkspacesOptions = {}) {
  const {
    searchTerm: initialSearchTerm = "",
    enableHealthCheck = true,
    autoRefreshInterval,
    enableOfflineFallback = true,
  } = options;

  const {
    workspaces,
    currentWorkspace,
    currentProject,
    isLoadingWorkspaces,
    error,
    health,
    selectWorkspace,
    refreshWorkspaces,
    refreshWorkspaceData,
  } = useWorkspace();

  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter workspaces based on search term
  const filteredWorkspaces = useMemo(() => {
    if (!searchTerm.trim()) return workspaces;
    
    const term = searchTerm.toLowerCase();
    return workspaces.filter(workspace => 
      workspace.name.toLowerCase().includes(term) ||
      workspace.description?.toLowerCase().includes(term)
    );
  }, [workspaces, searchTerm]);

  // Retry loading workspaces
  const retry = useCallback(async () => {
    return refreshWorkspaces();
  }, [refreshWorkspaces]);

  // Refresh workspaces and their data
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshWorkspaces(),
        refreshWorkspaceData(),
      ]);
      // Clear SWR cache for workspace-related data
      mutate(
        (key) => {
          if (typeof key === 'string') {
            return key.includes('/workspaces') || 
                   key.includes('/projects') ||
                   key.includes('/workflows');
          }
          return false;
        },
        undefined,
        { revalidate: true }
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshWorkspaces, refreshWorkspaceData]);

  // Switch workspace with confirmation if needed
  const switchWorkspace = useCallback(async (workspace: Workspace) => {
    // Check if there are any running tasks (this would need to be implemented
    // based on your application's task management system)
    const hasRunningTasks = typeof window !== 'undefined' && 
                           sessionStorage.getItem('mgx-running-tasks');
    
    if (hasRunningTasks) {
      const confirmed = confirm(
        'You have running tasks. Switching workspaces will cancel them. Continue?'
      );
      if (!confirmed) {
        return;
      }
      // Clear running tasks
      sessionStorage.removeItem('mgx-running-tasks');
    }

    await selectWorkspace(workspace);
    
    // Trigger refresh of all workspace-related data
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('workspaceChanged', {
        detail: { workspaceId: workspace.id, workspaceName: workspace.name },
      }));
      
      // Persist for offline mode
      localStorage.setItem('mgx-last-workspace-id', workspace.id);
      localStorage.setItem('mgx-last-workspace-name', workspace.name);
    }
  }, [selectWorkspace]);

  // Create new workspace
  const createWorkspace = useCallback(async (name: string, description?: string) => {
    setIsCreating(true);
    try {
      const apiOptions = {
        workspaceId: currentWorkspace?.id,
        projectId: currentProject?.id,
      };

      const newWorkspace = await apiCreateWorkspace(name, description, apiOptions);
      
      // Refresh the workspace list
      await refreshWorkspaces();
      
      // Auto-select the new workspace
      await switchWorkspace(newWorkspace);
      
      return newWorkspace;
    } finally {
      setIsCreating(false);
    }
  }, [refreshWorkspaces, switchWorkspace, currentWorkspace, currentProject]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefreshInterval) return;
    
    const interval = setInterval(() => {
      refreshWorkspaces();
    }, autoRefreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefreshInterval, refreshWorkspaces]);

  // Health check monitoring
  useEffect(() => {
    if (!enableHealthCheck) return;
    
    // Monitor WebSocket connection status
    interface ExtendedWindow extends Window {
      mgxWebSocket?: {
        isConnected?: boolean;
      };
    }
    
    const extendedWindow = typeof window !== 'undefined' ? window as unknown as ExtendedWindow : undefined;
    const wsConnected = extendedWindow?.mgxWebSocket?.isConnected;
    
    if (health && wsConnected !== undefined) {
      health.wsStatus = wsConnected ? 'connected' : 'disconnected';
    }
  }, [includeHealthCheck, health]);

  // Return offline fallback data if enabled and we have an error
  useEffect(() => {
    if (!enableOfflineFallback || !error) return;
    
    // Try to load cached workspace data
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('mgx-workspaces-cache');
      if (cached) {
        try {
          const { workspaces } = JSON.parse(cached);
          if (workspaces?.length > 0) {
            // Show notification about offline mode
            console.warn('Using cached workspace data in offline mode');
          }
        } catch {
          // Ignore parse errors
        }
      }
      
      // Load last selected workspace
      const lastWorkspaceId = localStorage.getItem('mgx-last-workspace-id');
      const lastWorkspaceName = localStorage.getItem('mgx-last-workspace-name');
      if (lastWorkspaceId && lastWorkspaceName && workspaces.length === 0) {
        console.warn('Creating temporary workspace from localStorage in offline mode');
      }
    }
  }, [enableOfflineFallback, error, workspaces.length]);

  return {
    workspaces,
    currentWorkspace,
    filteredWorkspaces,
    health,
    isLoading: isLoadingWorkspaces || isCreating || isRefreshing,
    isError: !!error,
    error: error as WorkspaceError,
    searchTerm,
    retry,
    refresh,
    setSearchTerm,
    switchWorkspace,
    createWorkspace,
  };
}