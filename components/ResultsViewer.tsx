'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Artifact } from '@/lib/types';
import { Download } from 'lucide-react';
import { downloadArtifact } from '@/lib/api';

interface ResultsViewerProps {
  artifacts: Artifact[];
  taskId: string;
  runId: string;
}

export function ResultsViewer({ artifacts, taskId, runId }: ResultsViewerProps) {
  if (!artifacts || artifacts.length === 0) {
    return <div className="text-gray-500 italic">No artifacts available.</div>;
  }

  return (
    <div className="space-y-8">
      {artifacts.map((artifact) => (
        <div key={artifact.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="font-medium text-sm text-gray-700 dark:text-gray-300">{artifact.name} ({artifact.type})</h3>
            <button
              onClick={() => downloadArtifact(taskId, runId, artifact.id)}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-xs"
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </button>
          </div>
          <div className="text-sm">
            <SyntaxHighlighter
              language={artifact.language || 'text'}
              style={vscDarkPlus}
              customStyle={{ margin: 0, borderRadius: 0 }}
              showLineNumbers={true}
            >
              {artifact.content}
            </SyntaxHighlighter>
          </div>
        </div>
      ))}
    </div>
  );
}
