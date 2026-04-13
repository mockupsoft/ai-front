"use client";

import { useMemo } from "react";

type Props = {
  html: string;
  className?: string;
};

/** Sandboxed preview: single HTML document in iframe srcDoc. */
export function LivePreview({ html, className = "" }: Props) {
  const srcDoc = useMemo(() => {
    if (!html?.trim()) {
      return "<!DOCTYPE html><html><body style='font-family:system-ui;padding:2rem;color:#888'>No preview yet</body></html>";
    }
    return html;
  }, [html]);

  return (
    <iframe
      title="DeepSite preview"
      className={`h-full w-full border-0 bg-white ${className}`}
      sandbox="allow-scripts allow-same-origin"
      srcDoc={srcDoc}
    />
  );
}
