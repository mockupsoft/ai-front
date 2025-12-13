import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { ResultsViewer } from "@/components/mgx/results-viewer";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <pre>{children}</pre>,
}));

jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  vscDarkPlus: {},
}));

describe("ResultsViewer", () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("copies content and downloads artifact", async () => {
    render(
      <ResultsViewer
        taskId="t1"
        runId="r1"
        artifacts={[
          {
            id: "a1",
            name: "index.ts",
            type: "code",
            content: "console.log('hi')",
            language: "typescript",
          },
        ]}
      />,
    );

    fireEvent.click(screen.getByTitle("Copy to clipboard"));

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("console.log('hi')");
    });

    fireEvent.click(screen.getByTitle("Download"));

    expect(api.downloadArtifact).toHaveBeenCalledWith("t1", "r1", "a1");
  });
});
