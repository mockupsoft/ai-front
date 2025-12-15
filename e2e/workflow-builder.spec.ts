import { test, expect } from "@playwright/test";

test("creates a workflow from a template, validates, and saves", async ({ page }) => {
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

  const templateDefinition = {
    schemaVersion: 1,
    steps: [
      {
        id: "step-1",
        type: "agent_task",
        name: "Start",
        position: { x: 120, y: 120 },
        bindings: {},
      },
    ],
    edges: [],
    variables: [],
  };

  const template = {
    id: "tpl-1",
    name: "Starter template",
    description: "One-step starter",
    definition: templateDefinition,
  };

  const agentDefs = [{ id: "agent-1", name: "Agent One", description: "" }];

  let savedWorkflow: Record<string, unknown> | null = null;

  await page.route("**/api/mgx/workspaces", async (route) => {
    await route.fulfill({ json: [workspace] });
  });

  await page.route("**/api/mgx/projects**", async (route) => {
    await route.fulfill({ json: [project] });
  });

  await page.route("**/api/mgx/agents/definitions**", async (route) => {
    await route.fulfill({ json: agentDefs });
  });

  await page.route("**/api/mgx/workflows/templates**", async (route) => {
    await route.fulfill({ json: [template] });
  });

  await page.route("**/api/mgx/workflows/validate**", async (route) => {
    const body = route.request().postDataJSON() as
      | {
          definition?: { steps?: Array<{ agentId?: string }> };
        }
      | undefined;
    const step = body?.definition?.steps?.[0];

    if (!step?.agentId) {
      await route.fulfill({
        json: {
          valid: false,
          issues: [
            {
              message: "Agent assignment required",
              severity: "error",
              stepId: "step-1",
            },
          ],
        },
      });
      return;
    }

    await route.fulfill({ json: { valid: true, issues: [] } });
  });

  await page.route("**/api/mgx/workflows/wf-123**", async (route) => {
    if (!savedWorkflow) {
      await route.fulfill({ status: 404, json: { message: "Not found" } });
      return;
    }
    await route.fulfill({ json: savedWorkflow });
  });

  await page.route("**/api/mgx/workflows**", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON() as {
        name: string;
        description?: string;
        definition: unknown;
      };

      savedWorkflow = {
        id: "wf-123",
        name: body.name,
        description: body.description,
        createdAt: now,
        updatedAt: now,
        definition: body.definition,
      };

      await route.fulfill({ json: savedWorkflow });
      return;
    }

    await route.fulfill({ json: [] });
  });

  await page.goto("/mgx/workflows/new");

  await page.getByRole("button", { name: "Starter template" }).click();

  await expect(page.getByLabel("Workflow canvas")).toBeVisible();
  const stepNode = page.getByLabel("Step Start");
  await expect(stepNode).toBeVisible();

  await page.getByRole("button", { name: "Validate" }).click();
  await expect(stepNode).toContainText("1");
  await expect(page.getByText("Agent assignment required")).toBeVisible();

  await stepNode.click();
  await page.getByLabel("Agent assignment").selectOption("agent-1");

  await page.getByRole("button", { name: "Validate" }).click();
  await expect(page.getByText("Valid")).toBeVisible();

  await page.getByLabel("Name").fill("My workflow");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/mgx\/workflows\/wf-123\/builder/);
  await expect(page.getByLabel("Workflow canvas")).toBeVisible();
  await expect(page.getByLabel("Name")).toHaveValue("My workflow");
});
