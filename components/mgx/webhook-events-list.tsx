"use client";

import * as React from "react";
import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";

import { Button } from "@/components/mgx/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/mgx/ui/card";
import {
  Table,
  THead,
  TBody,
  Tr,
  Th,
  Td,
} from "@/components/mgx/ui/table";
import { Spinner } from "@/components/mgx/ui/spinner";
import { StatusPill } from "@/components/mgx/ui/status-pill";
import type { WebhookEvent } from "@/lib/types";
import { useWebhookEvents } from "@/hooks/useWebhookEvents";

interface WebhookEventsListProps {
  repoFullName?: string;
  eventType?: string;
  limit?: number;
}

function getEventTypeColor(eventType: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (eventType === "push") return "success";
  if (eventType === "pull_request") return "info";
  if (eventType === "issues") return "warning";
  if (eventType === "workflow_run") return "neutral";
  return "neutral";
}

function formatEventType(eventType: string): string {
  return eventType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}


export function WebhookEventsList({
  repoFullName,
  eventType,
  limit = 50,
}: WebhookEventsListProps) {
  const { events, total, isLoading, isError, error, mutate } = useWebhookEvents({
    repoFullName,
    eventType,
    limit,
    enabled: true,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>Recent GitHub webhook events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>Recent GitHub webhook events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error instanceof Error ? error.message : "Failed to load webhook events"}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Webhook Events</CardTitle>
            <CardDescription>
              {total > 0 ? `${total} total events` : "No events yet"}
            </CardDescription>
          </div>
          <Button variant="secondary" size="sm" onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="py-8 text-center text-sm text-zinc-500">
            No webhook events found. Configure webhooks in your GitHub repository settings.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Delivery ID</Th>
                  <Th>Event Type</Th>
                  <Th>Repository</Th>
                  <Th>Status</Th>
                  <Th>Received</Th>
                </Tr>
              </THead>
              <TBody>
                {events.map((event: WebhookEvent) => (
                  <Tr key={event.id}>
                    <Td>
                      <code className="text-xs text-zinc-600 dark:text-zinc-400">
                        {event.delivery_id.slice(0, 8)}...
                      </code>
                    </Td>
                    <Td>
                      <StatusPill variant={getEventTypeColor(event.event_type)}>
                        {formatEventType(event.event_type)}
                      </StatusPill>
                    </Td>
                    <Td>
                      {event.repo_full_name ? (
                        <span className="text-sm text-zinc-900 dark:text-zinc-50">
                          {event.repo_full_name}
                        </span>
                      ) : (
                        <span className="text-sm text-zinc-500">—</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        {event.processed ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              Processed
                            </span>
                          </>
                        ) : event.error_message ? (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                            <span className="text-sm text-red-700 dark:text-red-300">
                              Failed
                            </span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-sm text-yellow-700 dark:text-yellow-300">
                              Pending
                            </span>
                          </>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formatTimeAgo(event.created_at)}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

