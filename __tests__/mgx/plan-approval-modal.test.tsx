import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PlanApprovalModal } from "@/components/mgx/plan-approval-modal";
import * as api from "@/lib/api";

jest.mock("@/lib/api");

jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: React.ReactNode }) => <pre>{children}</pre>,
}));

jest.mock("react-syntax-highlighter/dist/cjs/styles/prism", () => ({
  vscDarkPlus: {},
}));

describe("PlanApprovalModal", () => {
  it("approves plan and closes", async () => {
    (api.reviewPlan as jest.Mock).mockResolvedValue({});

    const onClose = jest.fn();

    render(
      <PlanApprovalModal
        open={true}
        taskId="t1"
        runId="r1"
        plan="Mock plan"
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Optional notes for reviewers..."), {
      target: { value: "Looks good" },
    });

    fireEvent.click(screen.getByText("Approve"));

    await waitFor(() => {
      expect(api.reviewPlan).toHaveBeenCalledWith("t1", "r1", {
        decision: "approve",
        comment: "Looks good",
      });
      expect(onClose).toHaveBeenCalled();
    });
  });
});
