"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/mgx/ui/card";
import { ModelSelector } from "./model-selector";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { LlmProvider } from "@/lib/types";
import type { ApiRequestOptions } from "@/lib/api";
import useSWR from "swr";
import { fetchLlmModels } from "@/lib/api";

interface LlmProviderInfo {
  provider: LlmProvider;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const LLM_PROVIDERS: LlmProviderInfo[] = [
  {
    provider: "openai",
    name: "OpenAI",
    description: "GPT-4, GPT-3.5 Turbo models with strong reasoning capabilities",
    icon: "🤖",
    color: "bg-green-500",
  },
  {
    provider: "anthropic",
    name: "Anthropic",
    description: "Claude models optimized for safety and helpful dialogue",
    icon: "🧠",
    color: "bg-orange-500",
  },
  {
    provider: "gemini",
    name: "Google Gemini",
    description: "Multimodal models with strong reasoning and image understanding",
    icon: "💎",
    color: "bg-blue-500",
  },
  {
    provider: "deepseek",
    name: "DeepSeek",
    description: "High-performance models with competitive pricing",
    icon: "🚀",
    color: "bg-purple-500",
  },
  {
    provider: "cohere",
    name: "Cohere",
    description: "Enterprise-focused models for business applications",
    icon: "🏢",
    color: "bg-indigo-500",
  },
];

interface LlmProviderSelectorProps {
  selectedProvider: LlmProvider | null;
  selectedModel: string | null;
  onProviderSelect: (provider: LlmProvider) => void;
  onModelSelect: (modelId: string) => void;
  disabled?: boolean;
  apiOptions?: ApiRequestOptions;
}

export function LlmProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderSelect,
  onModelSelect,
  disabled = false,
  apiOptions,
}: LlmProviderSelectorProps) {
  // Check provider availability by trying to fetch models
  const { data: models, error: availabilityError, isLoading: isCheckingAvailability } = useSWR(
    selectedProvider ? ["llm-provider-availability", selectedProvider] : null,
    selectedProvider
      ? async () => {
          try {
            await fetchLlmModels(selectedProvider, apiOptions);
            return { available: true };
          } catch {
            return { available: false };
          }
        }
      : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  const isAvailable = models?.available ?? true; // Default to true if not checked yet

  return (
    <Card>
      <CardHeader>
        <CardTitle>LLM Provider</CardTitle>
        <CardDescription>
          Choose your preferred language model provider
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {LLM_PROVIDERS.map((providerInfo) => {
            const isSelected = selectedProvider === providerInfo.provider;
            return (
              <div
                key={providerInfo.provider}
                className={`
                  relative flex items-start space-x-3 rounded-lg border-2 p-4 cursor-pointer transition-all
                  ${isSelected 
                    ? "border-zinc-900 dark:border-zinc-50 bg-zinc-50 dark:bg-zinc-900" 
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }
                  ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                `}
                onClick={() => !disabled && onProviderSelect(providerInfo.provider)}
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
                
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`
                    flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg
                    ${providerInfo.color}
                  `}>
                    {providerInfo.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                        {providerInfo.name}
                      </h3>
                      {isSelected && isCheckingAvailability && (
                        <Loader2 className="h-3 w-3 animate-spin text-zinc-400" />
                      )}
                      {isSelected && !isCheckingAvailability && isAvailable && (
                        <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" title="Available" />
                      )}
                      {isSelected && !isCheckingAvailability && !isAvailable && (
                        <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" title="Not available" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      {providerInfo.description}
                    </p>
                    {isSelected && !isAvailable && !isCheckingAvailability && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Provider is not available. Please check your configuration.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      
      {/* Model Selector */}
      {selectedProvider && (
        <div className="mt-4 border-t pt-4">
          <ModelSelector
            provider={selectedProvider}
            selectedModel={selectedModel}
            onModelSelect={onModelSelect}
            apiOptions={apiOptions}
            disabled={disabled}
          />
        </div>
      )}
    </Card>
  );
}