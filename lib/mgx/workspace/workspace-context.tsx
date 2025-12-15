"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { fetcher } from "@/lib/api";
import type { Workspace, Project, WorkspaceContextType, WorkspaceContextState } from "@/lib/types/workspace";

// URL parameter keys for persistence
const WORKSPACE_PARAM = "workspace";
const PROJECT_PARAM = "project";

// Default context state
const defaultState: WorkspaceContextState = {
  currentWorkspace: null,
  currentProject: null,
  workspaces: [],
  projects: [],
  isLoadingWorkspaces: false,
  isLoadingProjects: false,
  error: null,
};

// Create context
export const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Local storage keys
const WORKSPACE_STORAGE_KEY = "mgx-selected-workspace";
const PROJECT_STORAGE_KEY = "mgx-selected-project";

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

  // Fetch workspaces
  const fetchWorkspaces = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingWorkspaces: true, error: null }));
    
    try {
      const workspaces = await fetcher<Workspace[]>("/workspaces");
      
      setState((prev) => ({
        ...prev,
        workspaces,
        isLoadingWorkspaces: false,
      }));

      return workspaces;
    } catch (err) {
      console.error("Failed to fetch workspaces:", err);
      setState((prev) => ({
        ...prev,
        error: err as Error,
        isLoadingWorkspaces: false,
      }));
      return [];
    }
  }, []);

  // Fetch projects for a workspace
  const fetchProjects = useCallback(async (workspaceId: string) => {
    if (!workspaceId) {
      setState((prev) => ({ ...prev, projects: [], isLoadingProjects: false }));
      return [];
    }

    setState((prev) => ({ ...prev, isLoadingProjects: true, error: null }));
    
    try {
      const projects = await fetcher<Project[]>(`/projects?workspace_id=${workspaceId}`);
      
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

  // Initialize context
  useEffect(() => {
    const initializeContext = async () => {
      const { workspaceId } = getInitialSelection();
      
      // Fetch workspaces
      const workspaces = await fetchWorkspaces();
      
      // Set current workspace if found
      if (workspaceId && workspaces.length > 0) {
        const workspace = workspaces.find(w => w.id === workspaceId) || workspaces[0];
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
      };
    }
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}