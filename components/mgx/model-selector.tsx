"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/mgx/ui/card";
import { Button } from "@/components/mgx/ui/button";
import useSWR from "swr";
import { fetchLlmModels } from "@/lib/api";
import type { LlmProvider, LlmModel } from "@/lib/types";
import type { ApiRequestOptions } from "@/lib/api";

interface ModelSelectorProps {
  provider: LlmProvider | null;
  selectedModel: string | null;
  onModelSelect: (modelId: string) => void;
  apiOptions?: ApiRequestOptions;
  disabled?: boolean;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function getSpeedColor(speed: string): string {
  switch (speed) {
    case "fast":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "slow":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200";
  }
}

export function ModelSelector({
  provider,
  selectedModel,
  onModelSelect,
  apiOptions,
  disabled = false,
}: ModelSelectorProps) {
  const { data: models, error, isLoading } = useSWR<LlmModel[]>(
    provider ? ["llm-models", provider] : null,
    provider
      ? async () => await fetchLlmModels(provider, apiOptions)
      : null,
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  if (!provider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>
            Select a provider first to view available models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Choose a provider above to see available models
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>
            Loading available models for {provider}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
            <span className="ml-2 text-sm text-zinc-600 dark:text-zinc-400">
              Loading models...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>
            Failed to load models for {provider}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-600 dark:text-red-400">
            Error loading models: {error.message}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
            className="mt-2"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!models || models.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Selection</CardTitle>
          <CardDescription>
            No models available for {provider}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No models found for this provider
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Model Selection</CardTitle>
        <CardDescription>
          Choose a model from {provider}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {models.map((model) => {
            const isSelected = selectedModel === model.id;
            return (
              <div
                key={model.id}
                className={`
                  relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all
                  ${isSelected 
                    ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-900" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => !disabled && onModelSelect(model.id)}
              >
                <div className={`
                  flex-shrink-0 w-4 h-4 rounded-full border-2 mt-0.5
                  ${isSelected 
                    ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50" 
                    : "border-zinc-300 dark:border-zinc-600"
                  }
                `}>
                  {isSelected && (
                    <div className="w-2 h-2 bg-white dark:bg-zinc-900 rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {model.name}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                        {model.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${getSpeedColor(model.speed)}
                    `}>
                      {model.speed}
                    </span>
                    
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                      {formatNumber(model.contextWindow)} tokens
                    </span>
                    
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                      ${model.inputCostPer1kTokens}/1k input
                    </span>
                    
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
                      ${model.outputCostPer1kTokens}/1k output
                    </span>
                  </div>
                  
                  {model.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {model.capabilities.slice(0, 3).map((capability) => (
                        <span
                          key={capability}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {capability}
                        </span>
                      ))}
                      {model.capabilities.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs text-zinc-600 dark:text-zinc-400">
                          +{model.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}