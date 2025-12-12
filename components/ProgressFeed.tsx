'use client';

import React, { useEffect, useRef } from 'react';

export function ProgressFeed({ logs }: { logs: string[] }) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!logs || logs.length === 0) return <div className="text-gray-500 italic">No logs available.</div>;

  return (
    <div className="bg-black text-gray-300 font-mono text-xs p-4 rounded-lg h-96 overflow-y-auto">
      {logs.map((log, index) => (
        <div key={index} className="mb-1 whitespace-pre-wrap">{log}</div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
