"use client";

import * as React from "react";
import { CheckCircle, XCircle, Code, Zap } from "lucide-react";
import { Button } from "@/components/mgx/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/mgx/ui/card";
import { cn } from "@/lib/utils";

export interface PlanItem {
  id: string;
  text: string;
  completed?: boolean;
}

export interface PlanPreviewProps {
  title?: string;
  outputs?: string[];
  commands?: string[];
  checklist?: PlanItem[];
  onApprove?: () => void;
  onReject?: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export function PlanPreview({
  title = "Plan Preview",
  outputs = [],
  commands = [],
  checklist = [],
  onApprove,
  onReject,
  isSubmitting = false,
  className,
}: PlanPreviewProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Outputs Section */}
      {outputs.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            Çıktılar
          </h3>
          <ol className="space-y-2">
            {outputs.map((output, index) => (
              <li key={index} className="text-sm text-zinc-700 dark:text-zinc-300">
                {index + 1}. {output}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Commands Section */}
      {commands.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <Code className="h-4 w-4" />
            Komutlar Dahil
          </h3>
          <div className="rounded-lg border border-zinc-200 bg-zinc-950 p-4 font-mono text-xs text-zinc-200 dark:border-zinc-800">
            {commands.map((cmd, index) => (
              <div key={index} className="mb-1 last:mb-0">
                {cmd}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Checklist Section */}
      {checklist.length > 0 && (
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            <Zap className="h-4 w-4" />
            Sonraki Adım
          </h3>
          <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
            Aşağıda 'Approve' butonuna tıkla ve task başlayacak:
          </p>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
              >
                <CheckCircle
                  className={cn(
                    "mt-0.5 h-4 w-4 flex-shrink-0",
                    item.completed
                      ? "text-green-600 dark:text-green-400"
                      : "text-zinc-400 dark:text-zinc-600"
                  )}
                />
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confirmation Question */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Onaylamak istiyor musun?
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {onReject && (
          <Button
            variant="secondary"
            onClick={onReject}
            disabled={isSubmitting}
            className="flex-1"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
        )}
        {onApprove && (
          <Button
            variant="primary"
            onClick={onApprove}
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

