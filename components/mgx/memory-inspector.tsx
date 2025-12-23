"use client";

import * as React from "react";
import useSWR from "swr";
import { 
  Trash2, 
  Archive, 
  RefreshCw, 
  Pin, 
  Plus,
  Database,
  Users,
  Info,
  AlertTriangle,
  CheckCircle,
  Search,
  X,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { Spinner } from "@/components/mgx/ui/spinner";
import { MemoryItemComponent } from "@/components/mgx/memory-item";
import { 
  clearMemory, 
  pruneMemoryItems, 
  removeMemoryItem,
  addManualMemoryItem,
  updateMemoryItem,
  getTaskMemory
} from "@/lib/api";
import type { Memory, MemoryItem, TaskMemory } from "@/lib/types";
import { cn } from "@/lib/utils";

type MemoryType = "thread" | "workspace";
type TabId = "thread" | "workspace";

interface MemoryInspectorProps {
  taskId: string;
  className?: string;
  onMemoryUpdate?: () => void;
}

const MEMORY_TYPE_INFO: Record<MemoryType, { title: string; description: string; icon: React.ReactNode }> = {
  thread: {
    title: "Thread Memory",
    description: "Task-specific context and important information",
    icon: <Database className="h-4 w-4" />
  },
  workspace: {
    title: "Workspace Memory", 
    description: "Shared context across tasks in this workspace",
    icon: <Users className="h-4 w-4" />
  }
};

function MemoryUsageBar({ memory }: { memory: Memory }) {
  const percentage = Math.min((memory.size / memory.maxSize) * 100, 100);
  const isNearLimit = percentage > 80;
  const isAtLimit = percentage > 95;

  const getBarColor = () => {
    if (isAtLimit) return "bg-red-500";
    if (isNearLimit) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
        <span>Memory Usage</span>
        <span>{Math.round(percentage)}% ({Math.round(memory.size / 1024)}KB / {Math.round(memory.maxSize / 1024)}KB)</span>
      </div>
      <div className="h-2 bg-zinc-200 rounded-full dark:bg-zinc-800">
        <div 
          className={cn("h-full rounded-full transition-all", getBarColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function HybridIndicator({ taskMemory }: { taskMemory: TaskMemory | null }) {
  if (!taskMemory) return null;

  const { activeMemory, hybridSources } = taskMemory;

  if (activeMemory === "hybrid") {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
        <Info className="h-4 w-4" />
        <span className="font-medium">Using hybrid memory</span>
        <div className="flex items-center gap-1 ml-auto">
          {hybridSources.thread && <CheckCircle className="h-3 w-3 text-blue-600" />}
          {hybridSources.workspace && <CheckCircle className="h-3 w-3 text-blue-600" />}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
      <Info className="h-4 w-4" />
      <span>Using {activeMemory === "thread" ? "thread" : "workspace"} memory</span>
    </div>
  );
}

function AddMemoryItemForm({ 
  onAdd, 
  onCancel 
}: { 
  onAdd: (item: Omit<MemoryItem, "id" | "timestamp">) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");
  const [type, setType] = React.useState<MemoryItem["type"]>("summary");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onAdd({
      type,
      title: title.trim(),
      content: content.trim(),
      source: "manual",
      tags: []
    });

    setTitle("");
    setContent("");
    setType("summary");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 border border-dashed border-zinc-300 rounded-lg dark:border-zinc-700">
      <h4 className="text-sm font-medium">Add to Memory</h4>
      <div className="grid gap-2">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-300 rounded-md bg-white dark:border-zinc-700 dark:bg-zinc-950"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as MemoryItem["type"])}
          className="px-3 py-2 text-sm border border-zinc-300 rounded-md bg-white dark:border-zinc-700 dark:bg-zinc-950"
        >
          <option value="summary">Summary</option>
          <option value="fact">Fact</option>
          <option value="context">Context</option>
        </select>
        <textarea
          placeholder="Content (key points only, not full text)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="px-3 py-2 text-sm border border-zinc-300 rounded-md bg-white dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Add</Button>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

export function MemoryInspector({ taskId, className, onMemoryUpdate }: MemoryInspectorProps) {
  const [activeTab, setActiveTab] = React.useState<TabId>("thread");
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [clearConfirm, setClearConfirm] = React.useState<MemoryType | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: taskMemory, isLoading, error, mutate } = useSWR<TaskMemory>(
    taskId ? `task-memory-${taskId}` : null,
    () => getTaskMemory(taskId),
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeMemoryItem(taskId, itemId, activeTab);
      mutate(); // Revalidate data
      onMemoryUpdate?.();
      toast.success("Memory item removed");
    } catch {
      toast.error("Failed to remove memory item");
    }
  };

  const handleClearMemory = async (memoryType: MemoryType) => {
    try {
      await clearMemory(taskId, memoryType);
      setClearConfirm(null);
      mutate(); // Revalidate data
      onMemoryUpdate?.();
      toast.success(`${MEMORY_TYPE_INFO[memoryType].title} cleared`);
    } catch {
      toast.error("Failed to clear memory");
    }
  };

  const handlePruneMemory = async (memoryType: MemoryType) => {
    try {
      await pruneMemoryItems(taskId, memoryType, 10);
      mutate(); // Revalidate data
      onMemoryUpdate?.();
      toast.success(`${MEMORY_TYPE_INFO[memoryType].title} pruned`);
    } catch {
      toast.error("Failed to prune memory");
    }
  };

  const handleAddItem = async (item: Omit<MemoryItem, "id" | "timestamp">) => {
    try {
      await addManualMemoryItem(taskId, activeTab, item);
      mutate(); // Revalidate data
      onMemoryUpdate?.();
      toast.success("Memory item added");
      setShowAddForm(false);
    } catch {
      toast.error("Failed to add memory item");
    }
  };

  const handleEditItem = async (itemId: string, updates: Partial<Omit<MemoryItem, "id" | "timestamp">>) => {
    try {
      await updateMemoryItem(taskId, itemId, activeTab, updates);
      mutate(); // Revalidate data
      onMemoryUpdate?.();
      toast.success("Memory item updated");
    } catch {
      toast.error("Failed to update memory item");
    }
  };

  const handleRefresh = () => {
    mutate();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600 dark:text-red-400">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">Failed to load memory data</p>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleRefresh}
            className="mt-2"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const currentMemory = taskMemory?.[activeTab === "thread" ? "threadMemory" : "workspaceMemory"];
  const otherMemory = taskMemory?.[activeTab === "thread" ? "workspaceMemory" : "threadMemory"];

  // Filter items based on search term
  const filteredItems = React.useMemo(() => {
    if (!currentMemory || !searchTerm.trim()) return currentMemory.items;
    
    const term = searchTerm.toLowerCase();
    return currentMemory.items.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.content.toLowerCase().includes(term) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(term)))
    );
  }, [currentMemory?.items, searchTerm]);

  // Calculate analytics
  const analytics = React.useMemo(() => {
    if (!currentMemory) return null;

    const typeDistribution: Record<string, number> = {};
    const sourceDistribution: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    currentMemory.items.forEach(item => {
      typeDistribution[item.type] = (typeDistribution[item.type] || 0) + 1;
      sourceDistribution[item.source] = (sourceDistribution[item.source] || 0) + 1;
      if (item.tags) {
        item.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const mostUsedTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    return {
      typeDistribution,
      sourceDistribution,
      mostUsedTags,
      totalItems: currentMemory.items.length,
    };
  }, [currentMemory]);

  return (
    <div className={cn("space-y-4", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Archive className="h-5 w-5" />
                Memory Inspector
              </CardTitle>
              <CardDescription>
                Manage thread and workspace memory for this task
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {taskMemory && <HybridIndicator taskMemory={taskMemory} />}

          <div className="flex gap-1 p-1 bg-zinc-100 rounded-lg dark:bg-zinc-900">
            {(Object.keys(MEMORY_TYPE_INFO) as MemoryType[]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeTab === type
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                )}
              >
                {MEMORY_TYPE_INFO[type].icon}
                <span className="hidden sm:inline">{MEMORY_TYPE_INFO[type].title}</span>
                {currentMemory && type === activeTab && (
                  <span className="text-xs bg-zinc-200 px-1.5 py-0.5 rounded-full dark:bg-zinc-700">
                    {currentMemory.items.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {currentMemory && (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search memory items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-10 py-2 text-sm placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">{MEMORY_TYPE_INFO[activeTab].title}</h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {MEMORY_TYPE_INFO[activeTab].description}
                    {searchTerm && (
                      <span className="ml-1">
                        ({filteredItems.length} of {currentMemory.items.length} items)
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePruneMemory(activeTab)}
                    disabled={currentMemory.items.length === 0}
                  >
                    Prune
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setClearConfirm(activeTab)}
                    disabled={currentMemory.items.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              {currentMemory.size > 0 && <MemoryUsageBar memory={currentMemory} />}

              {/* Analytics Section */}
              {analytics && analytics.totalItems > 0 && (
                <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                    <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Analytics</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Type Distribution</p>
                      <div className="space-y-1">
                        {Object.entries(analytics.typeDistribution).map(([type, count]) => (
                          <div key={type} className="flex items-center justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400 capitalize">{type}</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="font-medium text-zinc-700 dark:text-zinc-300 mb-2">Source Distribution</p>
                      <div className="space-y-1">
                        {Object.entries(analytics.sourceDistribution).map(([source, count]) => (
                          <div key={source} className="flex items-center justify-between">
                            <span className="text-zinc-600 dark:text-zinc-400 capitalize">{source}</span>
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {analytics.mostUsedTags.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                        <p className="font-medium text-zinc-700 dark:text-zinc-300 text-xs">Most Used Tags</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {analytics.mostUsedTags.map(({ tag, count }) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                          >
                            {tag} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {showAddForm && (
                <AddMemoryItemForm 
                  onAdd={handleAddItem}
                  onCancel={() => setShowAddForm(false)}
                />
              )}

              <div className="space-y-2">
                {filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
                    <Archive className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchTerm 
                        ? `No items found matching "${searchTerm}"`
                        : `No items in ${MEMORY_TYPE_INFO[activeTab].title.toLowerCase()}`
                      }
                    </p>
                    {!searchTerm && (
                      <p className="text-xs mt-1">
                        Pin messages from chat or add manual items to get started
                      </p>
                    )}
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <MemoryItemComponent
                      key={item.id}
                      item={item}
                      onRemove={handleRemoveItem}
                      onEdit={handleEditItem}
                    />
                  ))
                )}
              </div>

              {otherMemory && otherMemory.items.length > 0 && (
                <div className="border-t pt-4">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                    Also available in {MEMORY_TYPE_INFO[activeTab === "thread" ? "workspace" : "thread"].title}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                    <Pin className="h-3 w-3" />
                    {otherMemory.items.length} additional item(s)
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {clearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Clear Memory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Are you sure you want to clear all items from {MEMORY_TYPE_INFO[clearConfirm].title}? 
                This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => handleClearMemory(clearConfirm)}
                  className="flex-1"
                >
                  Clear Memory
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setClearConfirm(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}