'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function PlanViewer({ plan }: { plan: string | undefined }) {
  if (!plan) return <div className="text-gray-500 italic">No plan available.</div>;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">Execution Plan</h3>
        </div>
        <SyntaxHighlighter
            language="markdown"
            style={vscDarkPlus}
            customStyle={{ margin: 0, borderRadius: 0 }}
        >
            {plan}
        </SyntaxHighlighter>
    </div>
  );
}
