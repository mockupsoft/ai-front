import { test, expect } from "@playwright/test";

test("triggers workflow execution and monitors timeline with live updates", async ({
  page,
}) => {
  const now = new Date().toISOString();

  const workspace = {
    id: "ws-1",
    name: "Workspace",
    createdAt: now,
    updatedAt: now,
    userId: "user-1",
  };

  const project = {
    id: "proj-1",
    workspaceId: "ws-1",
    name: "Project",
    createdAt: now,
    updatedAt: now,
  };

  const workflow = {
    id: "wf-1",
    name: "Test Workflow",
    description: "Test workflow execution",
    createdAt: now,
    updatedAt: now,
    definition: {
      schemaVersion: 1,
      steps: [
        {
          id: "step-1",
          type: "agent_task",
          name: "Initialize",
          position: { x: 120, y: 120 },
          bindings: {},
        },
        {
          id: "step-2",
          type: "agent_task",
          name: "Process",
          position: { x: 320, y: 120 },
          bindings: {},
        },
        {
          id: "step-3",
          type: "agent_task",
          name: "Finalize",
          position: { x: 520, y: 120 },
          bindings: {},
        },
      ],
      edges: [],
      variables: [],
    },
  };

  const initialExecution = {
    id: "exec-1",
    workflowId: "wf-1",
    status: "pending",
    startedAt: Date.now(),
    steps: [
      {
        stepId: "step-1",
        stepName: "Initialize",
        status: "pending",
      },
      {
        stepId: "step-2",
        stepName: "Process",
        status: "pending",
      },
      {
        stepId: "step-3",
        stepName: "Finalize",
        status: "pending",
      },
    ],
  };

  // Mock workspace endpoint
  await page.route("**/api/mgx/workspaces", async (route) => {
    await route.fulfill({ json: [workspace] });
  });

  // Mock project endpoint
  await page.route("**/api/mgx/projects", async (route) => {
    await route.fulfill({ json: [project] });
  });

  // Mock workflow fetch
  await page.route("**/api/mgx/workflows/wf-1", async (route) => {
    await route.fulfill({ json: workflow });
  });

  // Mock executions list endpoint
  let executionsList = [initialExecution];
  await page.route("**/api/mgx/workflows/wf-1/executions**", async (route) => {
    if (route.request().method() === "POST") {
      const execution = {
        ...initialExecution,
        id: "exec-" + Date.now(),
        status: "running",
        startedAt: Date.now(),
      };
      executionsList = [execution, ...executionsList];
      await route.fulfill({ json: execution });
    } else {
      await route.fulfill({ json: executionsList });
    }
  });

  // Mock execution detail endpoint - simulate progression
  let executionState = { ...initialExecution, status: "running" };
  await page.route("**/api/mgx/executions/exec-1**", async (route) => {
    // Simulate step progression
    if (executionState.steps[0].status === "pending") {
      executionState.steps[0].status = "running";
      executionState.steps[0].startedAt = Date.now();
    }

    await route.fulfill({ json: executionState });
  });

  // Mock execution metrics
  await page.route("**/api/mgx/executions/exec-1/metrics", async (route) => {
    const completedSteps = executionState.steps.filter(
      (s) => s.status === "completed"
    ).length;
    await route.fulfill({
      json: {
        totalDuration: 30000,
        successRate: completedSteps / executionState.steps.length,
        totalSteps: executionState.steps.length,
        completedSteps,
        failedSteps: 0,
        retryCount: 0,
        agentUtilization: {},
      },
    });
  });

  // Mock logs endpoint
  await page.route("**/api/mgx/executions/exec-1/logs**", async (route) => {
    const logs = [
      "[INFO] Starting workflow execution",
      "[INFO] Step 1: Initialize started",
      "[INFO] Loading configuration",
      "[INFO] Step 1: Initialize completed",
      "[INFO] Step 2: Process started",
      "[INFO] Processing data",
      "[INFO] Step 2: Process completed",
      "[INFO] Step 3: Finalize started",
      "[INFO] Finalizing results",
      "[INFO] Workflow execution completed successfully",
    ];
    await route.fulfill({ json: logs });
  });

  // Navigate to workflows page
  await page.goto("/mgx/workflows");
  await page.waitForLoadState("networkidle");

  // Navigate to executions page
  await page.goto("/mgx/workflows/wf-1/executions");
  await page.waitForLoadState("networkidle");

  // Trigger execution
  const triggerButton = page.getByRole("button", { name: /Trigger Execution/i });
  await expect(triggerButton).toBeVisible();
  await triggerButton.click();

  // Should navigate to execution detail page
  await page.waitForURL(/\/mgx\/workflows\/wf-1\/executions\/exec-\d+/, {
    timeout: 5000,
  });

  // Verify execution timeline loads
  const timelineHeader = page.getByText("Execution Timeline");
  await expect(timelineHeader).toBeVisible();

  // Verify metrics cards are displayed
  await expect(page.getByText("Total Duration")).toBeVisible();
  await expect(page.getByText("Success Rate")).toBeVisible();
  await expect(page.getByText("Steps Completed")).toBeVisible();
  await expect(page.getByText("Retries")).toBeVisible();

  // Verify steps are displayed in timeline
  await expect(page.getByText("Initialize")).toBeVisible();
  await expect(page.getByText("Process")).toBeVisible();
  await expect(page.getByText("Finalize")).toBeVisible();

  // Click on a step to view details
  const step1 = page.locator("text=Initialize").first();
  await step1.click();

  // Verify step details panel appears
  await expect(page.getByText("Step Details")).toBeVisible();

  // Verify logs panel loads
  const logsPanel = page.getByText("All Logs");
  await expect(logsPanel).toBeVisible();

  // Check that logs contain expected content
  await expect(
    page.getByText(/Starting workflow execution|Workflow execution completed/i)
  ).toBeVisible();

  // Verify refresh button exists
  const refreshButton = page.getByRole("button", { name: /Refresh/i });
  await expect(refreshButton).toBeVisible();
  await refreshButton.click();

  // Verify status pill is displayed
  const statusPill = page.locator("[class*='inline-flex'][class*='rounded-full']").first();
  await expect(statusPill).toBeVisible();

  // Verify timeline bars are rendered
  const timelineBars = page.locator("div[style*='width'][class*='h-full']");
  await expect(timelineBars.first()).toBeVisible();
});

test("handles execution failure and shows error indicators", async ({ page }) => {
  const workspace = {
    id: "ws-1",
    name: "Workspace",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-1",
  };

  const project = {
    id: "proj-1",
    workspaceId: "ws-1",
    name: "Project",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const failedExecution = {
    id: "exec-failed",
    workflowId: "wf-1",
    status: "failed",
    startedAt: Date.now() - 30000,
    completedAt: Date.now(),
    durationMs: 30000,
    error: "Step 2 failed: timeout",
    steps: [
      {
        stepId: "step-1",
        stepName: "Initialize",
        status: "completed",
        startedAt: Date.now() - 30000,
        completedAt: Date.now() - 20000,
        durationMs: 10000,
      },
      {
        stepId: "step-2",
        stepName: "Process",
        status: "failed",
        startedAt: Date.now() - 20000,
        completedAt: Date.now(),
        durationMs: 20000,
        error: "Process timeout after 20s",
      },
    ],
  };

  await page.route("**/api/mgx/workspaces", async (route) => {
    await route.fulfill({ json: [workspace] });
  });

  await page.route("**/api/mgx/projects", async (route) => {
    await route.fulfill({ json: [project] });
  });

  await page.route("**/api/mgx/executions/exec-failed", async (route) => {
    await route.fulfill({ json: failedExecution });
  });

  await page.route("**/api/mgx/executions/exec-failed/metrics", async (route) => {
    await route.fulfill({
      json: {
        totalDuration: 30000,
        successRate: 0.5,
        totalSteps: 2,
        completedSteps: 1,
        failedSteps: 1,
        retryCount: 0,
        agentUtilization: {},
      },
    });
  });

  await page.route("**/api/mgx/executions/exec-failed/logs**", async (route) => {
    await route.fulfill({
      json: [
        "[INFO] Starting workflow",
        "[INFO] Step 1 completed",
        "[ERROR] Step 2 failed: timeout",
      ],
    });
  });

  // Navigate to failed execution
  await page.goto("/mgx/workflows/wf-1/executions/exec-failed");
  await page.waitForLoadState("networkidle");

  // Verify failure status is shown
  const failureStatus = page.locator("text=failed");
  await expect(failureStatus).toBeVisible();

  // Verify error message is displayed
  await expect(
    page.getByText("Process timeout after 20s")
  ).toBeVisible();

  // Verify success rate reflects failure
  await expect(page.getByText("50%")).toBeVisible();

  // Click failed step to see error details
  const failedStep = page.locator("text=Process").first();
  await failedStep.click();

  // Verify error appears in step details
  await expect(
    page.getByText("Process timeout after 20s")
  ).toBeVisible();
});

test("shows retry indicators for retried steps", async ({ page }) => {
  const workspace = {
    id: "ws-1",
    name: "Workspace",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: "user-1",
  };

  const project = {
    id: "proj-1",
    workspaceId: "ws-1",
    name: "Project",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const executionWithRetries = {
    id: "exec-retry",
    workflowId: "wf-1",
    status: "completed",
    startedAt: Date.now() - 60000,
    completedAt: Date.now(),
    durationMs: 60000,
    steps: [
      {
        stepId: "step-1",
        stepName: "Resilient Step",
        status: "completed",
        startedAt: Date.now() - 60000,
        completedAt: Date.now(),
        durationMs: 60000,
        retryCount: 2,
      },
    ],
  };

  await page.route("**/api/mgx/workspaces", async (route) => {
    await route.fulfill({ json: [workspace] });
  });

  await page.route("**/api/mgx/projects", async (route) => {
    await route.fulfill({ json: [project] });
  });

  await page.route("**/api/mgx/executions/exec-retry", async (route) => {
    await route.fulfill({ json: executionWithRetries });
  });

  await page.route("**/api/mgx/executions/exec-retry/metrics", async (route) => {
    await route.fulfill({
      json: {
        totalDuration: 60000,
        successRate: 1.0,
        totalSteps: 1,
        completedSteps: 1,
        failedSteps: 0,
        retryCount: 2,
        agentUtilization: {},
      },
    });
  });

  await page.route("**/api/mgx/executions/exec-retry/logs**", async (route) => {
    await route.fulfill({
      json: [
        "[INFO] Step started",
        "[ERROR] Attempt 1 failed",
        "[INFO] Retrying step",
        "[ERROR] Attempt 2 failed",
        "[INFO] Retrying step",
        "[INFO] Attempt 3 succeeded",
      ],
    });
  });

  await page.goto("/mgx/workflows/wf-1/executions/exec-retry");
  await page.waitForLoadState("networkidle");

  // Verify retry indicator is shown
  const retryIndicator = page.getByText(/Retried 2 times/);
  await expect(retryIndicator).toBeVisible();

  // Verify retry count in metrics
  await expect(page.getByText("Retries")).toBeVisible();
});
