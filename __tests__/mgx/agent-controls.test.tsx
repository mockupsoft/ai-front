import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AgentControls } from "@/components/mgx/agent-controls";

jest.mock("lucide-react", () => ({
  Power: ({ className }: { className?: string }) => (
    <span className={className}>Power</span>
  ),
  PowerOff: ({ className }: { className?: string }) => (
    <span className={className}>PowerOff</span>
  ),
  AlertCircle: ({ className }: { className?: string }) => (
    <span className={className}>AlertCircle</span>
  ),
}));

describe("AgentControls", () => {
  const mockOnActivate = jest.fn();
  const mockOnDeactivate = jest.fn();
  const mockOnShutdown = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders activate and deactivate buttons for idle agents", () => {
    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="idle"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    expect(screen.getByRole("button", { name: /Activate/ })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Deactivate/ })
    ).toBeDisabled();
  });

  it("disables controls when agent is offline", () => {
    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="offline"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    expect(
      screen.getByRole("button", { name: /Activate/ })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /Deactivate/ })
    ).toBeDisabled();
    expect(screen.getByText(/This agent is currently offline/)).toBeInTheDocument();
  });

  it("calls onActivate when activate button is clicked", async () => {
    mockOnActivate.mockResolvedValue(undefined);

    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="idle"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Activate/ }));

    await waitFor(() => {
      expect(mockOnActivate).toHaveBeenCalled();
    });
  });

  it("shows shutdown confirmation dialog", async () => {
    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="active"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Shutdown/ }));

    await waitFor(() => {
      expect(
        screen.getByText(/Are you sure you want to shutdown/)
      ).toBeInTheDocument();
    });
  });

  it("calls onShutdown when shutdown is confirmed", async () => {
    mockOnShutdown.mockResolvedValue(undefined);

    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="active"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Shutdown/ }));

    const confirmButton = await screen.findByRole("button", { name: /Confirm/ });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockOnShutdown).toHaveBeenCalled();
    });
  });

  it("cancels shutdown when cancel button is clicked", async () => {
    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="active"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Shutdown/ }));

    const cancelButton = await screen.findByRole("button", { name: /Cancel/ });
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Are you sure you want to shutdown/)
      ).not.toBeInTheDocument();
    });
    expect(mockOnShutdown).not.toHaveBeenCalled();
  });

  it("displays current agent state", () => {
    render(
      <AgentControls
        agentId="test-id-123"
        agentName="Test Agent"
        status="executing"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
      />
    );

    expect(screen.getByText(/executing/)).toBeInTheDocument();
    expect(screen.getByText(/test-id-123/)).toBeInTheDocument();
  });

  it("respects disabled prop", () => {
    render(
      <AgentControls
        agentId="agent-1"
        agentName="Test Agent"
        status="idle"
        onActivate={mockOnActivate}
        onDeactivate={mockOnDeactivate}
        onShutdown={mockOnShutdown}
        disabled={true}
      />
    );

    expect(
      screen.getByRole("button", { name: /Activate/ })
    ).toBeDisabled();
  });
});
