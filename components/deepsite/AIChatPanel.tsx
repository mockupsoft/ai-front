"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

type Props = {
  messages: ChatMessage[];
  onSend: (prompt: string) => Promise<void>;
  streaming?: boolean;
};

export function AIChatPanel({ messages, onSend, streaming }: Props) {
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t || streaming) return;
    setInput("");
    await onSend(t);
  }

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-zinc-700 bg-zinc-950">
      <div className="border-b border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200">
        AI Assistant
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-zinc-500">
            Describe the page you want (e.g. &quot;landing page for a coffee shop with hero and menu&quot;).
            Generated HTML will appear in the editor and preview.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-4 rounded-lg bg-violet-900/40 p-2 text-violet-100"
                : "mr-4 rounded-lg bg-zinc-800 p-2 text-zinc-200 whitespace-pre-wrap"
            }
          >
            {m.content}
          </div>
        ))}
        {streaming && (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="border-t border-zinc-700 p-2">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for changes…"
            rows={3}
            disabled={streaming}
            className="min-h-[72px] flex-1 resize-none rounded-lg border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={streaming || !input.trim()}
            className="self-end rounded-lg bg-violet-600 p-2 text-white hover:bg-violet-700 disabled:opacity-50"
            aria-label="Send"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
