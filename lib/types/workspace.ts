export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  isActive?: boolean;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
}

export interface WorkspaceContextType {
  // Current selections
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  
  // Available options
  workspaces: Workspace[];
  projects: Project[];
  
  // Loading states
  isLoadingWorkspaces: boolean;
  isLoadingProjects: boolean;
  
  // Selection actions
  selectWorkspace: (workspace: Workspace) => void;
  selectProject: (project: Project) => void;
  
  // Data fetching
  refreshWorkspaces: () => Promise<void>;
  refreshProjects: () => Promise<void>;
  
  // Error state
  error: Error | null;
}

export interface WorkspaceSelectionProps {
  className?: string;
}

export interface WorkspaceContextState {
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  workspaces: Workspace[];
  projects: Project[];
  isLoadingWorkspaces: boolean;
  isLoadingProjects: boolean;
  error: Error | null;
}