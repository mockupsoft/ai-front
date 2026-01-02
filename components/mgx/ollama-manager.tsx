"use client";

import * as React from "react";
import { Plus, Trash2, RefreshCw, CheckCircle, AlertCircle, Loader2, Download, Server } from "lucide-react";
import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import {
  fetchOllamaModels,
  pullOllamaModel,
  deleteOllamaModel,
  fetchOllamaHealth,
  type OllamaModelInfo,
  type OllamaListResponse,
} from "@/lib/api";
import { toast } from "sonner";
import useSWR from "swr";

interface OllamaManagerProps {
  className?: string;
}

export function OllamaManager({ className }: OllamaManagerProps) {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullingModel, setPullingModel] = React.useState<string | null>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [newModelName, setNewModelName] = React.useState("");

  // Try backend API first, fallback to direct Ollama connection
  const { data: modelsData, error, isLoading, mutate } = useSWR<OllamaListResponse>(
    "/api/llm/ollama/models",
    async (key) => {
      try {
        return await fetchOllamaModels();
      } catch (err) {
        console.warn("Backend Ollama API failed, trying direct Ollama connection:", err);
        // Fallback: Direct Ollama connection (CORS should be enabled by default in Ollama)
        try {
          const response = await fetch("http://localhost:11434/api/tags", {
            method: "GET",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log("Direct Ollama connection successful, models:", data.models?.length || 0);
            return {
              models: (data.models || []).map((m: any) => ({
                name: m.name,
                size: m.size,
                modified_at: m.modified_at,
              })),
              connected: true,
              base_url: "http://localhost:11434",
            };
          } else {
            throw new Error(`Ollama API returned status ${response.status}`);
          }
        } catch (e: any) {
          console.error("Direct Ollama connection failed:", e);
          // If both backend and direct connection fail, return empty result
          return {
            models: [],
            connected: false,
            base_url: "http://localhost:11434",
          };
        }
      }
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      onError: (err) => {
        console.error("SWR error in Ollama models fetch:", err);
      },
    }
  );

  const { data: healthData, mutate: refreshHealth } = useSWR(
    "/api/llm/ollama/health",
    async (key) => {
      try {
        return await fetchOllamaHealth();
      } catch (err) {
        console.warn("Backend Ollama Health API failed, trying direct Ollama connection:", err);
        // Fallback: Direct Ollama connection (CORS should be enabled by default in Ollama)
        try {
          const response = await fetch("http://localhost:11434/api/tags", {
            method: "GET",
            mode: "cors",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            return {
              connected: true,
              base_url: "http://localhost:11434",
              model_count: data.models?.length || 0,
              models: (data.models || []).map((m: any) => m.name),
            };
          } else {
            throw new Error(`Ollama health check returned status ${response.status}`);
          }
        } catch (e: any) {
          console.error("Direct Ollama health check connection failed:", e);
        }
        return {
          connected: false,
          base_url: "http://localhost:11434",
          model_count: 0,
          models: [],
        };
      }
    },
    {
      refreshInterval: 10000,
      onError: (err) => {
        console.error("SWR error in Ollama health check:", err);
      },
    }
  );

  const handlePullModel = async (modelName: string) => {
    if (!modelName.trim()) {
      toast.error("Model name is required");
      return;
    }

    setIsPulling(true);
    setPullingModel(modelName);
    
    try {
      try {
        await pullOllamaModel(modelName.trim());
      } catch (apiError: any) {
        // Fallback: Direct Ollama API call
        const response = await fetch("http://localhost:11434/api/pull", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: modelName.trim() }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to pull model");
        }
        
        // Stream the response
        const reader = response.body?.getReader();
        if (reader) {
          const decoder = new TextDecoder();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            // Parse progress updates if needed
          }
        }
      }
      
      toast.success(`Model '${modelName}' is being pulled. This may take a few minutes.`);
      setShowAddModal(false);
      setNewModelName("");
      // Refresh after a delay to see the new model
      setTimeout(() => {
        mutate();
        refreshHealth();
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to pull model");
    } finally {
      setIsPulling(false);
      setPullingModel(null);
    }
  };

  const handleDeleteModel = async (modelName: string) => {
    if (!confirm(`Are you sure you want to delete model '${modelName}'?`)) {
      return;
    }

    try {
      try {
        await deleteOllamaModel(modelName);
      } catch (apiError: any) {
        // Fallback: Direct Ollama API call
        const response = await fetch("http://localhost:11434/api/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: modelName }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to delete model");
        }
      }
      
      toast.success(`Model '${modelName}' deleted successfully`);
      mutate();
      refreshHealth();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete model");
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "Unknown";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  // Format dates on client-side only to avoid hydration mismatch
  const [formattedDates, setFormattedDates] = React.useState<Record<string, string>>({});
  
  React.useEffect(() => {
    if (modelsData?.models) {
      const formatted: Record<string, string> = {};
      modelsData.models.forEach((model) => {
        if (model.modified_at) {
          try {
            formatted[model.modified_at] = new Date(model.modified_at).toLocaleString();
          } catch {
            formatted[model.modified_at] = model.modified_at;
          }
        }
      });
      setFormattedDates(formatted);
    }
  }, [modelsData?.models]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    return formattedDates[dateStr] || dateStr;
  };

  const popularModels = [
    "mistral",
    "llama2",
    "codellama",
    "phi",
    "gemma",
    "neural-chat",
    "starling-lm",
    "llama2:13b",
    "mistral:7b",
  ];

  return (
    <div className={className}>
      {/* Ollama Manager Component */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Ollama Management
              </CardTitle>
              <CardDescription>
                Manage local Ollama models. Pull, delete, and monitor your installed models.
              </CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                mutate();
                refreshHealth();
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Status */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
            <div className="flex items-center gap-3">
              {(modelsData?.connected || healthData?.connected) ? (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {(modelsData?.connected || healthData?.connected) ? "Connected" : "Disconnected"}
                </p>
                <p className="text-xs text-zinc-500">
                  {modelsData?.base_url || healthData?.base_url || "http://localhost:11434"}
                </p>
              </div>
            </div>
            {(modelsData || healthData) && (
              <div className="text-right">
                <p className="text-sm font-medium">
                  {modelsData?.models?.length || healthData?.model_count || 0} models
                </p>
                <p className="text-xs text-zinc-500">installed</p>
              </div>
            )}
          </div>

          {/* Add Model Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Add Model</h3>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddModal(true)}
                disabled={!modelsData?.connected}
              >
                <Plus className="h-4 w-4 mr-2" />
                Pull Model
              </Button>
            </div>

            {showAddModal && (
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Model Name</label>
                  <input
                    type="text"
                    value={newModelName}
                    onChange={(e) => setNewModelName(e.target.value)}
                    placeholder="e.g., mistral, llama2, codellama"
                    className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder-zinc-500"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newModelName.trim()) {
                        handlePullModel(newModelName);
                      }
                    }}
                  />
                </div>

                <div>
                  <p className="text-xs text-zinc-500 mb-2">Popular Models:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularModels.map((model) => (
                      <button
                        key={model}
                        onClick={() => {
                          setNewModelName(model);
                          handlePullModel(model);
                        }}
                        disabled={isPulling}
                        className="px-2 py-1 text-xs rounded-md border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50"
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handlePullModel(newModelName)}
                    disabled={!newModelName.trim() || isPulling}
                    className="flex-1"
                  >
                    {isPulling && pullingModel === newModelName ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Pulling...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Pull Model
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowAddModal(false);
                      setNewModelName("");
                    }}
                    disabled={isPulling}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Models List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Installed Models</h3>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 py-4">
                <AlertCircle className="h-5 w-5" />
                <span>Failed to load models</span>
              </div>
            )}

            {modelsData && modelsData.models.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                <p>No models installed</p>
                <p className="text-xs mt-1">Pull a model to get started</p>
              </div>
            )}

            {modelsData && modelsData.models.length > 0 && (
              <div className="space-y-2">
                {modelsData.models.map((model) => (
                  <div
                    key={model.name}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{model.name}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-zinc-500">
                        {model.size && <span>Size: {formatBytes(model.size)}</span>}
                        {model.modified_at && (
                          <span>Modified: {formatDate(model.modified_at)}</span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDeleteModel(model.name)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

