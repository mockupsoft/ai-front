"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/mgx/ui/card";
import { Button } from "@/components/mgx/ui/button";
import { testLlmConnection } from "@/lib/api";
import type { LlmProvider, LlmConnectionTestResult } from "@/lib/types";
import type { ApiRequestOptions } from "@/lib/api";

interface ApiKeyInputProps {
  provider: LlmProvider | null;
  apiKey: string;
  onApiKeyChange: (apiKey: string) => void;
  onSave?: (config: { provider: LlmProvider; model: string; apiKey: string }) => void;
  apiOptions?: ApiRequestOptions;
  disabled?: boolean;
}

type ConnectionStatus = "idle" | "testing" | "success" | "failed";

export function ApiKeyInput({
  provider,
  apiKey,
  onApiKeyChange,
  onSave,
  apiOptions,
  disabled = false,
}: ApiKeyInputProps) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("idle");
  const [testResult, setTestResult] = useState<LlmConnectionTestResult | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleTestConnection = async () => {
    if (!provider || !apiKey.trim()) {
      return;
    }

    setConnectionStatus("testing");
    setTestResult(null);

    try {
      const result = await testLlmConnection(provider, apiKey.trim(), apiOptions);
      setTestResult(result);
      setConnectionStatus(result.success ? "success" : "failed");
    } catch (error) {
      setTestResult({
        success: false,
        message: "Connection test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      setConnectionStatus("failed");
    }
  };

  const handleSave = () => {
    if (onSave && provider && apiKey.trim()) {
      onSave({
        provider,
        model: "", // This should be passed from parent component
        apiKey: apiKey.trim(),
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case "testing":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-900 dark:border-zinc-50"></div>
        );
      case "success":
        return <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">✓</div>;
      case "failed":
        return <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">✗</div>;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "success":
        return "text-green-600 dark:text-green-400";
      case "failed":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-zinc-600 dark:text-zinc-400";
    }
  };

  if (!provider) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>API Key</CardTitle>
          <CardDescription>
            Enter your API key to configure LLM access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Select a provider above to enter your API key
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Configuration</CardTitle>
        <CardDescription>
          Enter your {provider} API key and test the connection
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            API Key for {provider}
          </label>
          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={`Enter your ${provider} API key`}
              disabled={disabled}
              className={`
                w-full px-3 py-2 pr-20 border rounded-md text-sm
                ${disabled 
                  ? "bg-zinc-100 dark:bg-zinc-800 cursor-not-allowed" 
                  : "bg-white dark:bg-zinc-900"
                }
                border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-50
                placeholder:text-zinc-500 dark:placeholder:text-zinc-400
                focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:border-transparent
              `}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                disabled={disabled}
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleTestConnection}
            disabled={!apiKey.trim() || disabled || connectionStatus === "testing"}
            size="sm"
            variant="secondary"
          >
            {connectionStatus === "testing" ? "Testing..." : "Test Connection"}
          </Button>

          {onSave && (
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim() || disabled}
              size="sm"
              variant="primary"
            >
              Save Configuration
            </Button>
          )}
        </div>

        {testResult && (
          <div className={`
            p-3 rounded-md border
            ${testResult.success 
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800" 
              : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }
          `}>
            <div className="flex items-start space-x-2">
              {getStatusIcon()}
              <div className="flex-1">
                <p className={`text-sm font-medium ${getStatusColor()}`}>
                  {testResult.success ? "Connection Successful" : "Connection Failed"}
                </p>
                <p className={`text-xs mt-1 ${getStatusColor()}`}>
                  {testResult.message}
                </p>
                {testResult.latency && testResult.success && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                    Response time: {testResult.latency}ms
                  </p>
                )}
                {testResult.error && !testResult.success && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Error: {testResult.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md">
          <p className="font-medium mb-1">Security Note:</p>
          <p>Your API key is masked for security. It will only be used to test the connection and will be encrypted when stored.</p>
        </div>
      </CardContent>
    </Card>
  );
}