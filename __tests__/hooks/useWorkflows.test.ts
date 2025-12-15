import { renderHook } from "@testing-library/react";
import useSWR from "swr";

import { useWorkflow, useWorkflows, useWorkflowTemplates } from "@/hooks/useWorkflows";
import * as workspaceContext from "@/lib/mgx/workspace/workspace-context";

jest.mock("swr");
jest.mock("@/lib/mgx/workspace/workspace-context");

describe("useWorkflows", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not fetch when workspace is not selected", () => {
    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: null,
      currentProject: null,
    });

    (useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWorkflows());

    expect(result.current.workflows).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  it("returns workflows list", () => {
    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    const mockWorkflows = [{ id: "wf-1", name: "Workflow 1" }];

    (useSWR as jest.Mock).mockReturnValue({
      data: mockWorkflows,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWorkflows());

    expect(result.current.workflows).toEqual(mockWorkflows);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });
});

describe("useWorkflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns workflow details", () => {
    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    const workflow = {
      id: "wf-1",
      name: "Workflow 1",
      definition: { schemaVersion: 1, steps: [], edges: [], variables: [] },
    };

    (useSWR as jest.Mock).mockReturnValue({
      data: workflow,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWorkflow("wf-1"));

    expect(result.current.workflow).toEqual(workflow);
  });
});

describe("useWorkflowTemplates", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns templates", () => {
    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: { id: "workspace-1" },
      currentProject: { id: "project-1" },
    });

    const templates = [
      {
        id: "tpl-1",
        name: "Template",
        definition: { schemaVersion: 1, steps: [], edges: [], variables: [] },
      },
    ];

    (useSWR as jest.Mock).mockReturnValue({
      data: templates,
      error: null,
      isLoading: false,
      mutate: jest.fn(),
    });

    const { result } = renderHook(() => useWorkflowTemplates());

    expect(result.current.templates).toEqual(templates);
  });
});
