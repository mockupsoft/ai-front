"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { fetchWorkspaceWorkspaces } from "@/lib/api";
import type { Workspace, Project, WorkspaceContextType, WorkspaceContextState } from "@/lib/types/workspace";

// API URL resolution (local copy to avoid import cycle)
const API_BASE =
  process.env.NEXT_PUBLIC_MGX_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

function joinPath(basePath: string, path: string) {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

function resolveUrl(path: string) {
  if (!API_BASE) return path;
  return joinPath(API_BASE, path);
}

// URL parameter keys for persistence
const WORKSPACE_PARAM = "workspace";
const PROJECT_PARAM = "project";

// Local storage keys
const WORKSPACE_STORAGE_KEY = "mgx-selected-workspace";
const PROJECT_STORAGE_KEY = "mgx-selected-project";

// Enhanced error tracking
interface WorkspaceError extends Error {
  statusCode?: number;
  isTimeout?: boolean;
  isCorsError?: boolean;
  isNetworkError?: boolean;
  isAuthError?: boolean;
}

// Health status tracking
interface WorkspaceHealth {
  workspaceId: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastChecked: Date;
  apiLatency?: number;
  wsStatus?: 'connected' | 'disconnected' | 'connecting';
}

// Default context state
const defaultState: WorkspaceContextState = {
  currentWorkspace: null,
  currentProject: null,
  workspaces: [],
  projects: [],
  isLoadingWorkspaces: false,
  isLoadingProjects: false,
  error: null,
  health: null,
};

// Create context
export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

interface WorkspaceProviderProps {
  children: React.ReactNode;
}

export function WorkspaceProvider({ children }: WorkspaceProviderProps) {
  const [state, setState] = useState<WorkspaceContextState>(defaultState);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial selection from URL params or localStorage
  const getInitialSelection = useCallback(() => {
    // Try URL params first (only if searchParams is available)
    const urlWorkspaceId = searchParams?.get(WORKSPACE_PARAM) || null;

    // Fallback to localStorage (only in browser)
    let storedWorkspaceId = null;
    if (typeof window !== 'undefined') {
      storedWorkspaceId = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    }

    return {
      workspaceId: urlWorkspaceId || storedWorkspaceId,
    };
  }, [searchParams]);

  // Enhanced error classification
  const classifyError = useCallback((error: unknown): WorkspaceError => {
    const err = error as Error;
    const enhancedError: WorkspaceError = new Error(err.message);
    enhancedError.name = err.name;
    enhancedError.stack = err.stack;

    // Check for specific error types
    if (err.message.includes('timeout') || err.message.includes('Timeout')) {
      enhancedError.isTimeout = true;
    }
    if (err.message.includes('CORS')) {
      enhancedError.isCorsError = true;
    }
    if (err.message.includes('network') || err.message.includes('Network')) {
      enhancedError.isNetworkError = true;
    }
    if (err.message.includes('401') || err.message.includes('403') || err.message.includes('Unauthorized')) {
      enhancedError.isAuthError = true;
      enhancedError.statusCode = 401;
    }
    if (err.message.includes('404')) {
      enhancedError.statusCode = 404;
    }
    if (err.message.includes('500')) {
      enhancedError.statusCode = 500;
    }

    return enhancedError;
  }, []);

  // Fetch workspaces with enhanced error handling
  const fetchWorkspaces = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingWorkspaces: true, error: null }));
    
    try {
      const startTime = Date.now();
      const workspaces = await fetchWorkspaceWorkspaces();
      const apiLatency = Date.now() - startTime;
      
      // Update health status on success
      const health: WorkspaceHealth = {
        workspaceId: 'global', // Global workspace health
        status: apiLatency > 5000 ? 'degraded' : 'healthy', // Degraded if slow
        lastChecked: new Date(),
        apiLatency,
      };
      
      setState((prev) => ({
        ...prev,
        workspaces,
        health,
        isLoadingWorkspaces: false,
        error: null,
      }));

      // Save to localStorage for offline fallback
      if (typeof window !== 'undefined') {
        localStorage.setItem('mgx-workspaces-cache', JSON.stringify({
          workspaces,
          timestamp: new Date().toISOString(),
        }));
      }

      return workspaces;
    } catch (err) {
      console.error('Failed to fetch workspaces:', err);
      const classifiedError = classifyError(err);
      
      setState((prev) => ({
        ...prev,
        error: classifiedError,
        isLoadingWorkspaces: false,
        health: {
          workspaceId: 'global',
          status: 'offline',
          lastChecked: new Date(),
        },
      }));
      
      // Try offline fallback
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('mgx-workspaces-cache');
        if (cached) {
          try {
            const { workspaces } = JSON.parse(cached);
            setState((prev) => ({
              ...prev,
              workspaces,
              error: classifiedError, // Keep error but show cached data
            }));
            return workspaces;
          } catch {
            // Ignore parse errors
          }
        }
      }
      return [];
    }
  }, [classifyError]);

  // Fetch projects for a workspace
  const fetchProjects = useCallback(async (workspaceId: string) => {
    if (!workspaceId) {
      setState((prev) => ({ ...prev, projects: [], isLoadingProjects: false }));
      return [];
    }

    setState((prev) => ({ ...prev, isLoadingProjects: true, error: null }));
    
    try {
      const response = await fetch(resolveUrl(`/projects?workspace_id=${workspaceId}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`);
      }
      
      const projects = await response.json() as Project[];
      
      setState((prev) => ({
        ...prev,
        projects,
        isLoadingProjects: false,
      }));

      return projects;
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoadingProjects: false,
      }));
      return [];
    }
  }, []);

  // Select workspace
  const selectWorkspace = useCallback(async (workspace: Workspace) => {
    // Update URL params (only if searchParams is available)
    const newSearchParams = searchParams 
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();
    newSearchParams.set(WORKSPACE_PARAM, workspace.id);
    
    // Clear project when workspace changes
    newSearchParams.delete(PROJECT_PARAM);

    // Update localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace.id);
      localStorage.removeItem(PROJECT_STORAGE_KEY);
      
      // Save to offline cache
      localStorage.setItem('mgx-selected-workspace-cache', JSON.stringify({
        id: workspace.id,
        name: workspace.name,
        timestamp: new Date().toISOString(),
      }));
    }

    // Update state
    setState((prev) => ({
      ...prev,
      currentWorkspace: workspace,
      currentProject: null,
      projects: [],
    }));

    // Fetch projects for new workspace
    await fetchProjects(workspace.id);

    // Update URL (only if router is available)
    if (router) {
      router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [router, pathname, searchParams, fetchProjects]);

  // Select project
  const selectProject = useCallback(async (project: Project) => {
    // Update URL params (only if searchParams is available)
    const newSearchParams = searchParams
      ? new URLSearchParams(searchParams.toString())
      : new URLSearchParams();
    newSearchParams.set(PROJECT_PARAM, project.id);

    // Update localStorage (only in browser)
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROJECT_STORAGE_KEY, project.id);
    }

    // Update state
    setState((prev) => ({
      ...prev,
      currentProject: project,
    }));

    // Update URL (only if router is available)
    if (router) {
      router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  // Refresh workspaces
  const refreshWorkspaces = useCallback(async () => {
    await fetchWorkspaces();
    
    // If current workspace is no longer available, clear it
    const { workspaceId } = getInitialSelection();
    if (workspaceId && !state.workspaces.find(w => w.id === workspaceId)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        localStorage.removeItem(PROJECT_STORAGE_KEY);
      }
      setState((prev) => ({
        ...prev,
        currentWorkspace: null,
        currentProject: null,
      }));
    }
  }, [fetchWorkspaces, getInitialSelection, state.workspaces]);

  // Refresh projects
  const refreshProjects = useCallback(async () => {
    if (state.currentWorkspace) {
      await fetchProjects(state.currentWorkspace.id);
    }
  }, [fetchProjects, state.currentWorkspace]);

  // App-wide data refresh when workspace changes
  const refreshWorkspaceData = useCallback(async () => {
    // Reload all workspace-related data
    if (state.currentWorkspace) {
      await Promise.all([
        fetchProjects(state.currentWorkspace.id),
        refreshWorkspaces(),
      ]);
      
      // Trigger custom event for other components to refresh
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('workspaceRefresh', {
          detail: { workspaceId: state.currentWorkspace.id },
        }));
      }
    }
  }, [state.currentWorkspace, fetchProjects, refreshWorkspaces]);

  // Get workspace health status
  const getWorkspaceHealth = useCallback((workspaceId?: string): WorkspaceHealth | null => {
    if (!workspaceId && !state.currentWorkspace) {
      return state.health;
    }
    
    const targetId = workspaceId || state.currentWorkspace?.id;
    if (!targetId) return null;
    
    return state.health; // For now, return global health status
  }, [state.health, state.currentWorkspace]);

  // Initialize context
  useEffect(() => {
    const initializeContext = async () => {
      const { workspaceId } = getInitialSelection();
      
      // Fetch workspaces
      const workspaces = await fetchWorkspaces();
      
      // Set current workspace if found
      if (workspaceId && workspaces.length > 0) {
        const workspace = workspaces.find((w: Workspace) => w.id === workspaceId) || workspaces[0];
        setState((prev) => ({ ...prev, currentWorkspace: workspace }));
        
        // Fetch projects for the workspace
        const projects = await fetchProjects(workspace.id);
        
        // Auto-select first project if available
        if (projects.length > 0) {
          setState((prev) => ({ ...prev, currentProject: projects[0] }));
        }
      } else if (workspaces.length > 0) {
        // Auto-select first workspace if none selected
        const workspace = workspaces[0];
        setState((prev) => ({ ...prev, currentWorkspace: workspace }));
        
        // Fetch projects for the workspace
        const projects = await fetchProjects(workspace.id);
        
        // Auto-select first project if available
        if (projects.length > 0) {
          setState((prev) => ({ ...prev, currentProject: projects[0] }));
        }
      }
    };

    initializeContext();
  }, [getInitialSelection, fetchWorkspaces, fetchProjects]);

  const value: WorkspaceContextType = {
    ...state,
    selectWorkspace,
    selectProject,
    refreshWorkspaces,
    refreshProjects,
    refreshWorkspaceData,
    getWorkspaceHealth,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// Hook to use workspace context
export function useWorkspace(): WorkspaceContextType {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    // During static generation, return default state instead of throwing
    // This allows components to render safely during build time
    if (typeof window === 'undefined') {
      return {
        ...defaultState,
        selectWorkspace: async () => {},
        selectProject: async () => {},
        refreshWorkspaces: async () => {},
        refreshProjects: async () => {},
        refreshWorkspaceData: async () => {},
        getWorkspaceHealth: () => null,
      };
    }
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}