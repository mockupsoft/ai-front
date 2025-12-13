import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RepositoryConnectForm } from "@/components/mgx/repository-connect-form";
import * as api from "@/lib/api";
import * as workspaceContext from "@/lib/mgx/workspace/workspace-context";
import * as sonner from "sonner";

jest.mock("@/lib/api");
jest.mock("sonner");
jest.mock("@/lib/mgx/workspace/workspace-context");

describe("RepositoryConnectForm", () => {
  const mockWorkspace = { id: "workspace1", name: "Test Workspace" };
  const mockProject = { id: "project1", name: "Test Project" };

  beforeEach(() => {
    jest.clearAllMocks();

    (workspaceContext.useWorkspace as jest.Mock).mockReturnValue({
      currentWorkspace: mockWorkspace,
      currentProject: mockProject,
    });

    (api.connectRepository as jest.Mock).mockResolvedValue({
      id: "repo1",
      name: "test-repo",
      status: "connected",
    });
  });

  it("renders the form with required fields", () => {
    render(<RepositoryConnectForm />);

    expect(screen.getByLabelText("Repository URL")).toBeInTheDocument();
    expect(screen.getByLabelText("Branch Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /connect repository/i })).toBeInTheDocument();
  });

  it("submits form with repository URL and branch", async () => {
    const onSuccess = jest.fn();
    render(<RepositoryConnectForm onSuccess={onSuccess} />);

    const urlInput = screen.getByPlaceholderText("https://github.com/owner/repo");
    const branchInput = screen.getByPlaceholderText("main");
    const submitButton = screen.getByRole("button", { name: /connect repository/i });

    fireEvent.change(urlInput, {
      target: { value: "https://github.com/test/repo" },
    });
    fireEvent.change(branchInput, { target: { value: "develop" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.connectRepository).toHaveBeenCalledWith(
        "project1",
        {
          url: "https://github.com/test/repo",
          branch: "develop",
          oauthToken: undefined,
          appInstallId: undefined,
        },
        expect.any(Object)
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("displays error when URL is missing", async () => {
    render(<RepositoryConnectForm />);

    const submitButton = screen.getByRole("button", { name: /connect repository/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Repository URL is required")).toBeInTheDocument();
    });
  });

  it("submits form with optional OAuth token", async () => {
    const onSuccess = jest.fn();
    render(<RepositoryConnectForm onSuccess={onSuccess} />);

    const urlInput = screen.getByPlaceholderText("https://github.com/owner/repo");
    const branchInput = screen.getByPlaceholderText("main");
    const tokenInput = screen.getByPlaceholderText("ghp_xxxxxxxxxxxxxxxxxxxx");
    const submitButton = screen.getByRole("button", { name: /connect repository/i });

    fireEvent.change(urlInput, {
      target: { value: "https://github.com/test/repo" },
    });
    fireEvent.change(branchInput, { target: { value: "main" } });
    fireEvent.change(tokenInput, {
      target: { value: "ghp_test_token" },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.connectRepository).toHaveBeenCalledWith(
        "project1",
        {
          url: "https://github.com/test/repo",
          branch: "main",
          oauthToken: "ghp_test_token",
          appInstallId: undefined,
        },
        expect.any(Object)
      );
    });
  });

  it("handles API errors gracefully", async () => {
    (api.connectRepository as jest.Mock).mockRejectedValue(
      new Error("Failed to authenticate with GitHub")
    );
    const mockToast = sonner.toast as jest.Mocked<typeof sonner.toast>;

    render(<RepositoryConnectForm />);

    const urlInput = screen.getByPlaceholderText("https://github.com/owner/repo");
    const branchInput = screen.getByPlaceholderText("main");
    const submitButton = screen.getByRole("button", { name: /connect repository/i });

    fireEvent.change(urlInput, {
      target: { value: "https://github.com/test/repo" },
    });
    fireEvent.change(branchInput, { target: { value: "main" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Failed to authenticate with GitHub")).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalled();
    });
  });
});
