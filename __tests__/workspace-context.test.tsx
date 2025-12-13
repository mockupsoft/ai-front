import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { render } from "@testing-library/react";

import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";

describe("useWorkspace Hook", () => {
  it("should throw error when used outside provider", () => {
    // Suppress console error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const TestComponent = () => {
      useWorkspace();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      "useWorkspace must be used within a WorkspaceProvider"
    );

    consoleSpy.mockRestore();
  });
});