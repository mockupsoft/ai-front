import React from "react";
import { render, screen } from "@testing-library/react";

import MgxSettingsPage from "@/app/mgx/settings/page";

describe("MgxSettingsPage", () => {
  it("renders settings page heading", () => {
    render(<MgxSettingsPage />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders API configuration section", () => {
    render(<MgxSettingsPage />);
    expect(screen.getByText("API Configuration")).toBeInTheDocument();
    expect(screen.getByLabelText("API Base URL")).toBeInTheDocument();
  });

  it("renders WebSocket configuration section", () => {
    render(<MgxSettingsPage />);
    expect(screen.getByText("WebSocket Configuration")).toBeInTheDocument();
    expect(screen.getByLabelText("WebSocket URL")).toBeInTheDocument();
  });

  it("renders display preferences section", () => {
    render(<MgxSettingsPage />);
    expect(screen.getByText("Display Preferences")).toBeInTheDocument();
    expect(screen.getByText("Dark Mode")).toBeInTheDocument();
    expect(screen.getByText("Compact View")).toBeInTheDocument();
  });

  it("renders notifications section", () => {
    render(<MgxSettingsPage />);
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    expect(screen.getByText("Task Completion")).toBeInTheDocument();
    expect(screen.getByText("System Alerts")).toBeInTheDocument();
  });

  it("renders save button", () => {
    render(<MgxSettingsPage />);
    expect(screen.getByText("Save Changes")).toBeInTheDocument();
  });
});
