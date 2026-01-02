export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  metadata?: Record<string, any> | string; // Backend returns as "metadata" field
  createdAt: string;
  updatedAt: string;
  created_at?: string; // Backend field name
  updated_at?: string; // Backend field name
  userId?: string;
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

export interface WorkspaceHealth {
  workspaceId: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastChecked: Date;
  apiLatency?: number;
  wsStatus?: 'connected' | 'disconnected' | 'connecting';
}

export interface WorkspaceError extends Error {
  statusCode?: number;
  isTimeout?: boolean;
  isCorsError?: boolean;
  isNetworkError?: boolean;
  isAuthError?: boolean;
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
  refreshWorkspaceData: () => Promise<void>;
  
  // Health monitoring
  getWorkspaceHealth: (workspaceId?: string) => WorkspaceHealth | null;
  
  // Error state
  error: Error | null;
  
  // Health status
  health: WorkspaceHealth | null;
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
  health: WorkspaceHealth | null;
}