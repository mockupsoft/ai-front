"use client";

import { useState, useEffect } from "react";
import { Save, RefreshCw, CheckCircle, AlertCircle, Loader2, Settings2 } from "lucide-react";
import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import { fetchLlmHealth, fetchLlmRoute, type LlmHealthResponse, type LlmRouteRequest, type LlmRouteResponse } from "@/lib/api";
import { OllamaManager } from "@/components/mgx/ollama-manager";
import { toast } from "sonner";
import useSWR from "swr";

export default function LlmManagementPage() {
  const [routingStrategy, setRoutingStrategy] = useState<LlmRouteRequest["strategy"]>("balanced");
  const [preferLocal, setPreferLocal] = useState(false);
  const [testRouteResult, setTestRouteResult] = useState<LlmRouteResponse | null>(null);
  const [isTestingRoute, setIsTestingRoute] = useState(false);

  const { data: health, error: healthError, isLoading: isHealthLoading, mutate: refreshHealth } = useSWR<LlmHealthResponse>(
    "/api/llm/health",
    fetchLlmHealth,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
    }
  );

  const handleTestRoute = async () => {
    setIsTestingRoute(true);
    setTestRouteResult(null);
    
    try {
      const request: LlmRouteRequest = {
        strategy: routingStrategy,
        prefer_local: preferLocal,
      };
      
      const result = await fetchLlmRoute(request);
      setTestRouteResult(result);
      toast.success(`Route test successful: ${result.provider}/${result.model}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to test route");
    } finally {
      setIsTestingRoute(false);
    }
  };

  const handleSaveSettings = async () => {
    // TODO: Implement save to backend
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 p-6" style={{ minHeight: 'fit-content' }}>
      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          LLM Provider Management
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Configure and manage multiple LLM providers, routing strategies, and model selection.
        </p>
      </div>

      {/* Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Provider Health</CardTitle>
              <CardDescription>Current status of all LLM providers</CardDescription>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => refreshHealth()}
              disabled={isHealthLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isHealthLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isHealthLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          )}
          
          {healthError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 py-4">
              <AlertCircle className="h-5 w-5" />
              <span>Failed to load provider health</span>
            </div>
          )}
          
          {health && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Routing Strategy</p>
                  <p className="text-sm font-medium">{health.routing_strategy}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Fallback Enabled</p>
                  <p className="text-sm font-medium">{health.fallback_enabled ? "Yes" : "No"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-zinc-500">Prefer Local</p>
                  <p className="text-sm font-medium">{health.prefer_local ? "Yes" : "No"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Providers</h3>
                <div className="grid gap-3">
                  {health.providers.map((provider) => (
                    <div
                      key={provider.provider}
                      className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
                    >
                      <div className="flex items-center gap-3">
                        {provider.configured ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <p className="text-sm font-medium capitalize">{provider.provider}</p>
                          <p className="text-xs text-zinc-500">
                            {provider.model_count} model{provider.model_count !== 1 ? "s" : ""} available
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {provider.configured ? "Configured" : "Not Configured"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Routing Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Routing Strategy</CardTitle>
          <CardDescription>Configure how LLM providers are selected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Default Strategy
            </label>
            <select
              value={routingStrategy}
              onChange={(e) => setRoutingStrategy(e.target.value as LlmRouteRequest["strategy"])}
              className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <option value="balanced">Balanced (Cost + Quality)</option>
              <option value="cost_optimized">Cost Optimized</option>
              <option value="latency_optimized">Latency Optimized</option>
              <option value="quality_optimized">Quality Optimized</option>
              <option value="local_first">Local First</option>
            </select>
            <p className="text-xs text-zinc-500">
              Strategy used for automatic provider selection
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Prefer Local Models
              </p>
              <p className="text-xs text-zinc-500">
                Prioritize local/private models (Ollama)
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={preferLocal}
                onChange={(e) => setPreferLocal(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-zinc-900 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-zinc-700 dark:peer-checked:bg-zinc-50" />
            </label>
          </div>

          <div className="pt-4 border-t">
            <Button
              variant="secondary"
              onClick={handleTestRoute}
              disabled={isTestingRoute}
              className="w-full"
            >
              {isTestingRoute ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing Route...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Route
                </>
              )}
            </Button>

            {testRouteResult && (
              <div className="mt-4 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4">
                <p className="text-xs text-zinc-500 mb-2">Route Test Result</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Provider:</span>
                    <span className="text-sm capitalize">{testRouteResult.provider}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Model:</span>
                    <span className="text-sm">{testRouteResult.model}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Reason:</span>
                    <span className="text-xs text-zinc-500 capitalize">{testRouteResult.reason.replace(/_/g, " ")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Ollama Management */}
      <OllamaManager className="mt-6" />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" size="md" onClick={handleSaveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

