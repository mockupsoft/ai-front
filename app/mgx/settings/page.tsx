"use client";

import { useState } from "react";

import { Save } from "lucide-react";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";

export default function MgxSettingsPage() {
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_MGX_API_BASE_URL ?? "/api/mgx",
  );
  const [wsUrl, setWsUrl] = useState(
    process.env.NEXT_PUBLIC_MGX_WS_URL ?? "ws://localhost:4000/ws",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Configure your MGX dashboard preferences and connections.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Backend REST API settings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="api-url"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                API Base URL
              </label>
              <input
                id="api-url"
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                placeholder="/api/mgx"
              />
              <p className="text-xs text-zinc-500">
                Set via NEXT_PUBLIC_MGX_API_BASE_URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>WebSocket Configuration</CardTitle>
              <CardDescription>Real-time connection settings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="ws-url"
                className="text-sm font-medium text-zinc-900 dark:text-zinc-50"
              >
                WebSocket URL
              </label>
              <input
                id="ws-url"
                type="text"
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                className="h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500"
                placeholder="ws://localhost:4000/ws"
              />
              <p className="text-xs text-zinc-500">
                Set via NEXT_PUBLIC_MGX_WS_URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Display Preferences</CardTitle>
              <CardDescription>Customize your dashboard view</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Dark Mode
                </p>
                <p className="text-xs text-zinc-500">
                  Follows system preference
                </p>
              </div>
              <div className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Auto
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Compact View
                </p>
                <p className="text-xs text-zinc-500">
                  Reduce spacing and padding
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-zinc-900 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-zinc-700 dark:peer-checked:bg-zinc-50" />
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage alert preferences</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  Task Completion
                </p>
                <p className="text-xs text-zinc-500">
                  Notify when tasks finish
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-zinc-900 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-zinc-700 dark:peer-checked:bg-zinc-50" />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                  System Alerts
                </p>
                <p className="text-xs text-zinc-500">Critical system events</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" defaultChecked className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-zinc-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-zinc-900 peer-checked:after:translate-x-5 peer-focus:outline-none dark:bg-zinc-700 dark:peer-checked:bg-zinc-50" />
              </label>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="primary" size="md">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
