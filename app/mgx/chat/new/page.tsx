"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createTask, triggerRun } from "@/lib/api";
import { useWorkspace } from "@/lib/mgx/workspace/workspace-context";
import { ChatInput } from "@/components/mgx/chat-input";
import { toast } from "sonner";

export default function NewChatPage() {
  const router = useRouter();
  const { currentWorkspace, currentProject } = useWorkspace();
  const [inputValue, setInputValue] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isCreating) return;

    // Check if workspace is available
    if (!currentWorkspace) {
      toast.error("Please select a workspace first");
      router.push("/mgx");
      return;
    }

    setIsCreating(true);
    try {
      // Create task from chat message
      const task = await createTask(
        message.trim().substring(0, 100), // Use first 100 chars as task name
        message.trim(), // Full message as description
        {
          workspaceId: currentWorkspace.id,
          projectId: currentProject?.id,
        }
      );

      toast.success("Task created successfully");
      
      // Trigger run for the task
      try {
        await triggerRun(task.id, {
          workspaceId: currentWorkspace.id,
          projectId: currentProject?.id,
        });
        toast.success("Task execution started");
      } catch (runError) {
        console.error("Failed to start task execution:", runError);
        // Still navigate to task page even if run fails to start
      }
      
      // Navigate to task page with chat tab
      router.push(`/mgx/tasks/${task.id}?tab=chat`);
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Failed to create task";
      toast.error(errorMessage);
      console.error("Task creation error:", error);
      
      // Log additional details
      if (error?.response) {
        console.error("Response error:", await error.response.json().catch(() => ({})));
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
              How can I help you?
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Describe what you'd like to accomplish, and I'll create a task for you.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSendMessage}
              disabled={isCreating}
              placeholder="How can I help you?"
              className="w-full"
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                💡 Example prompts
              </h3>
              <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li>• "Create a new feature for user authentication"</li>
                <li>• "Analyze the codebase and suggest improvements"</li>
                <li>• "Help me debug this error..."</li>
              </ul>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                🚀 What happens next?
              </h3>
              <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <li>• A task will be created from your message</li>
                <li>• You'll be taken to the task page</li>
                <li>• Chat will start automatically</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

