"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";

import { fetchWorkspaceWorkspaces } from "@/lib/api";
import type { Workspace, Project, WorkspaceContextType, WorkspaceContextState, WorkspaceError, WorkspaceHealth } from "@/lib/types/workspace";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Track if we've initialized workspace/project selection
  const [hasInitialized, setHasInitialized] = useState(false);

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

  // SWR configuration
  const swrConfig = useMemo(() => ({
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryCount: 5,
    errorRetryInterval: 2000,
    dedupingInterval: 2000,
    refreshInterval: 0,
  }), []);

  // Backend health check fetcher
  const healthFetcher = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/health/`);
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Backend health check with SWR - more aggressive retry
  const { data: isBackendHealthy, error: healthError } = useSWR<boolean>(
    'backend-health',
    healthFetcher,
    {
      ...swrConfig,
      refreshInterval: 5000, // Check every 5 seconds
      errorRetryCount: 10, // More retries for health check
      errorRetryInterval: 1000, // Faster retry for health check
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Workspaces fetcher for SWR
  const workspacesFetcher = useCallback(async (): Promise<Workspace[]> => {
    const startTime = Date.now();
    const workspaces = await fetchWorkspaceWorkspaces();
    const apiLatency = Date.now() - startTime;
    
    // Save to localStorage for offline fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgx-workspaces-cache', JSON.stringify({
        workspaces,
        timestamp: new Date().toISOString(),
      }));
    }

    return workspaces;
  }, []);

  // Projects fetcher for SWR
  const projectsFetcher = useCallback(async (key: string, workspaceId: string): Promise<Project[]> => {
    if (!workspaceId) return [];
    
    const url = resolveUrl('/api/projects/'); // Added trailing slash to avoid 307 redirect CORS issue
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Workspace-Id': workspaceId,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`);
    }
    
    const data = await response.json() as { items: Project[]; total: number; skip: number; limit: number };
    return data.items || [];
  }, []);

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

  // Always try to fetch workspaces - SWR will handle retries
  // Optimized retry strategy for backend connectivity
  // Debug: Log when SWR is called
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[WorkspaceContext] SWR will fetch workspaces with key: workspaces');
    }
  }, []);
  
  const { 
    data: workspaces = [], 
    error: workspacesError, 
    isLoading: isLoadingWorkspaces,
    mutate: mutateWorkspaces 
  } = useSWR<Workspace[]>(
    'workspaces', // Always try to fetch
    workspacesFetcher,
    {
      ...swrConfig,
      errorRetryCount: 10, // Reasonable retry count
      errorRetryInterval: 2000, // 2 second intervals
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Prevent duplicate requests
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Only retry network/fetch errors - don't retry on 4xx/5xx errors
        const isNetworkError = error.message.includes('fetch') || 
                              error.message.includes('Network') || 
                              error.message.includes('Failed to fetch') ||
                              error.message.includes('timeout') ||
                              error.message.includes('Cannot connect');
        
        if (isNetworkError && retryCount < 10) {
          // Exponential backoff: 1s, 2s, 4s, 8s, etc. (max 10s)
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
          setTimeout(() => revalidate({ retryCount }), delay);
        }
        // Don't retry on other errors (4xx, 5xx, etc.)
      },
      fallbackData: (() => {
        // Try to load from cache on initial load
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('mgx-workspaces-cache');
          if (cached) {
            try {
              const { workspaces, timestamp } = JSON.parse(cached);
              // Only use cache if it's less than 5 minutes old
              const cacheAge = Date.now() - new Date(timestamp).getTime();
              if (cacheAge < 5 * 60 * 1000) {
                return workspaces;
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
        return undefined;
      })(),
    }
  );

  // Get current workspace ID
  const { workspaceId: currentWorkspaceId } = getInitialSelection();
  
  // Use SWR for projects - fetch if workspace is selected, SWR will handle retries
  const { 
    data: projects = [], 
    error: projectsError, 
    isLoading: isLoadingProjects,
    mutate: mutateProjects 
  } = useSWR<Project[]>(
    currentWorkspaceId ? ['projects', currentWorkspaceId] : null,
    ([, workspaceId]: [string, string]) => projectsFetcher('projects', workspaceId),
    {
      ...swrConfig,
      errorRetryCount: 8, // More retries
      errorRetryInterval: 1500,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  // Calculate health status from workspaces fetch
  const health: WorkspaceHealth | null = useMemo(() => {
    if (workspacesError) {
      return {
        workspaceId: 'global',
        status: 'offline',
        lastChecked: new Date(),
      };
    }
    if (workspaces.length > 0) {
      return {
        workspaceId: 'global',
        status: 'healthy',
        lastChecked: new Date(),
      };
    }
    return null;
  }, [workspaces, workspacesError]);

  // Classify error from SWR
  const error: WorkspaceError | null = useMemo(() => {
    if (workspacesError) {
      return classifyError(workspacesError);
    }
    if (projectsError) {
      return classifyError(projectsError);
    }
    return null;
  }, [workspacesError, projectsError, classifyError]);

  // Get current workspace and project from workspaces/projects data
  const currentWorkspace = useMemo(() => {
    if (!currentWorkspaceId || !workspaces.length) return null;
    return workspaces.find(w => w.id === currentWorkspaceId) || workspaces[0] || null;
  }, [currentWorkspaceId, workspaces]);

  const currentProject = useMemo(() => {
    if (!currentWorkspace || !projects.length) return null;
    const projectId = searchParams?.get(PROJECT_PARAM) || 
                     (typeof window !== 'undefined' ? localStorage.getItem(PROJECT_STORAGE_KEY) : null);
    if (projectId) {
      return projects.find(p => p.id === projectId) || null;
    }
    return projects[0] || null;
  }, [currentWorkspace, projects, searchParams]);

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

    // Update URL (only if router is available)
    if (router) {
      router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    }

    // SWR will automatically refetch projects when workspaceId changes
  }, [router, pathname, searchParams]);

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

    // Update URL (only if router is available)
    if (router) {
      router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [router, pathname, searchParams]);

  // Refresh workspaces using SWR mutate
  const refreshWorkspaces = useCallback(async () => {
    await mutateWorkspaces();
    
    // If current workspace is no longer available, clear it
    const { workspaceId } = getInitialSelection();
    if (workspaceId && !workspaces.find(w => w.id === workspaceId)) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(WORKSPACE_STORAGE_KEY);
        localStorage.removeItem(PROJECT_STORAGE_KEY);
      }
    }
  }, [mutateWorkspaces, getInitialSelection, workspaces]);

  // Refresh projects using SWR mutate
  const refreshProjects = useCallback(async () => {
    if (currentWorkspaceId) {
      await mutateProjects();
    }
  }, [mutateProjects, currentWorkspaceId]);

  // App-wide data refresh when workspace changes
  const refreshWorkspaceData = useCallback(async () => {
    // Reload all workspace-related data
    await Promise.all([
      mutateWorkspaces(),
      currentWorkspaceId && mutateProjects(),
    ]);
    
    // Trigger custom event for other components to refresh
    if (typeof window !== 'undefined' && currentWorkspaceId) {
      window.dispatchEvent(new CustomEvent('workspaceRefresh', {
        detail: { workspaceId: currentWorkspaceId },
      }));
    }
  }, [currentWorkspaceId, mutateWorkspaces, mutateProjects]);

  // Get workspace health status
  const getWorkspaceHealth = useCallback((workspaceId?: string): WorkspaceHealth | null => {
    return health;
  }, [health]);

  // Auto-select workspace and project when data is available (only once on initial load)
  // Skip URL updates on /deepsite/* routes — those pages manage their own state
  const isDeepSiteRoute = pathname?.startsWith('/deepsite');

  useEffect(() => {
    if (hasInitialized || !workspaces.length) return;
    
    const { workspaceId } = getInitialSelection();
    const workspace = workspaceId 
      ? workspaces.find(w => w.id === workspaceId) || workspaces[0]
      : workspaces[0];
    
    if (workspace) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(WORKSPACE_STORAGE_KEY, workspace.id);
      }
      
      // Only push to URL on MGX routes, not on DeepSite routes
      if (router && !isDeepSiteRoute) {
        const newSearchParams = searchParams 
          ? new URLSearchParams(searchParams.toString())
          : new URLSearchParams();
        newSearchParams.set(WORKSPACE_PARAM, workspace.id);
        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
      }
      
      setHasInitialized(true);
    }
  }, [hasInitialized, workspaces, getInitialSelection, searchParams, router, pathname, isDeepSiteRoute]);

  // Auto-select project when workspace is selected and projects are available
  useEffect(() => {
    if (!currentWorkspace || currentProject || !projects.length) return;
    if (isDeepSiteRoute) return; // Skip URL updates on DeepSite routes
    
    const projectId = searchParams?.get(PROJECT_PARAM) || 
                     (typeof window !== 'undefined' ? localStorage.getItem(PROJECT_STORAGE_KEY) : null);
    const project = projectId 
      ? projects.find(p => p.id === projectId) || projects[0]
      : projects[0];
    
    if (project) {
      const newSearchParams = searchParams
        ? new URLSearchParams(searchParams.toString())
        : new URLSearchParams();
      newSearchParams.set(PROJECT_PARAM, project.id);
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(PROJECT_STORAGE_KEY, project.id);
      }
      
      if (router) {
        router.push(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
      }
    }
  }, [currentWorkspace, currentProject, projects, searchParams, router, pathname, isDeepSiteRoute]);

  const value: WorkspaceContextType = {
    currentWorkspace,
    currentProject,
    workspaces,
    projects,
    isLoadingWorkspaces,
    isLoadingProjects,
    error,
    selectWorkspace,
    selectProject,
    refreshWorkspaces,
    refreshProjects,
    refreshWorkspaceData,
    getWorkspaceHealth,
    health,
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
        error: null,
        health: null,
      };
    }
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}