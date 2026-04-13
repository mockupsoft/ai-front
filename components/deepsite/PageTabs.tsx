"use client";

type Props = {
  paths: string[];
  active: string;
  onSelect: (path: string) => void;
};

/** Minimal tab bar for multi-page projects (single-page typical). */
export function PageTabs({ paths, active, onSelect }: Props) {
  if (paths.length <= 1) return null;
  return (
    <div className="flex gap-1 border-b border-zinc-700 bg-zinc-900 px-2 py-1">
      {paths.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onSelect(p)}
          className={`rounded-t px-3 py-1 text-xs font-medium ${
            active === p
              ? "bg-zinc-800 text-white"
              : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
          }`}
        >
          {p || "/"}
        </button>
      ))}
    </div>
  );
}
