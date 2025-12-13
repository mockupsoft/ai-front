"use client";

import { useState } from "react";
import { ChevronDown, Building2, FolderOpen, Loader2 } from "lucide-react";

import { Button } from "@/components/mgx/ui/button";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import type { Workspace, Project } from "@/lib/types/workspace";

interface WorkspaceSelectorProps {
  className?: string;
}

function WorkspaceDropdown({ 
  workspaces, 
  currentWorkspace, 
  onSelect, 
  isLoading,
  disabled 
}: {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSelect: (workspace: Workspace) => void;
  isLoading: boolean;
  disabled: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || isLoading || workspaces.length === 0}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 h-8 px-3"
      >
        <Building2 className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : currentWorkspace ? (
            currentWorkspace.name
          ) : (
            "No workspace"
          )}
        </span>
        <ChevronDown className="h-3 w-3" />
      </Button>

      {isOpen && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            {workspaces.length === 0 ? (
              <div className="px-3 py-2 text-sm text-zinc-500">
                No workspaces available
              </div>
            ) : (
              workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => {
                    onSelect(workspace);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                    currentWorkspace?.id === workspace.id
                      ? "bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                      : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{workspace.name}</div>
                      {workspace.description && (
                        <div className="text-xs text-zinc-500 truncate">
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ProjectDropdown({ 
  projects, 
  currentProject, 
  onSelect, 
  isLoading,
  disabled,
  selectedWorkspace 
}: {
  projects: Project[];
  currentProject: Project | null;
  onSelect: (project: Project) => void;
  isLoading: boolean;
  disabled: boolean;
  selectedWorkspace: Workspace | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const canShowProjects = selectedWorkspace && projects.length > 0;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || isLoading || !canShowProjects}
        onClick={() => setIsOpen(!!canShowProjects && !disabled)}
        className="flex items-center gap-2 h-8 px-3"
      >
        <FolderOpen className="h-4 w-4" />
        <span className="text-sm font-medium">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : !selectedWorkspace ? (
            "Select workspace first"
          ) : currentProject ? (
            currentProject.name
          ) : projects.length === 0 ? (
            "No projects"
          ) : (
            "Select project"
          )}
        </span>
        {canShowProjects && !disabled && (
          <ChevronDown className="h-3 w-3" />
        )}
      </Button>

      {isOpen && canShowProjects && !disabled && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1 w-64 rounded-md border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onSelect(project);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                  currentProject?.id === project.id
                    ? "bg-zinc-50 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  <div className="flex-1">
                    <div className="font-medium">{project.name}</div>
                    {project.description && (
                      <div className="text-xs text-zinc-500 truncate">
                        {project.description}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function WorkspaceSelector({ className }: WorkspaceSelectorProps) {
  const {
    currentWorkspace,
    currentProject,
    workspaces,
    projects,
    isLoadingWorkspaces,
    isLoadingProjects,
    selectWorkspace,
    selectProject,
    error,
  } = useWorkspace();

  const isLoading = isLoadingWorkspaces || isLoadingProjects;

  return (
    <div 
      data-testid="workspace-selector-container" 
      className={`flex items-center gap-2 ${className || ""}`}
    >
      {/* Workspace Selector */}
      <WorkspaceDropdown
        workspaces={workspaces}
        currentWorkspace={currentWorkspace}
        onSelect={selectWorkspace}
        isLoading={isLoadingWorkspaces}
        disabled={!!error}
      />

      {/* Project Selector */}
      <ProjectDropdown
        projects={projects}
        currentProject={currentProject}
        onSelect={selectProject}
        isLoading={isLoadingProjects}
        disabled={!!error || !currentWorkspace}
        selectedWorkspace={currentWorkspace}
      />

      {/* Error State */}
      {error && (
        <div className="text-xs text-red-600 dark:text-red-400">
          Failed to load workspaces
        </div>
      )}

      {/* Empty State */}
      {!error && workspaces.length === 0 && !isLoading && (
        <div className="text-xs text-amber-600 dark:text-amber-400">
          No workspaces available
        </div>
      )}
    </div>
  );
}