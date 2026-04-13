import { PiGearSixFill } from "react-icons/pi";
import { useState, useEffect, useRef } from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/deepsite-v2/ui/popover";
import { PROVIDERS, MODELS } from "@/lib/deepsite/providers";
import { Button } from "@/components/deepsite-v2/ui/button";
import { useMemo } from "react";
import { useUpdateEffect } from "react-use";
import { Input } from "@/components/deepsite-v2/ui/input";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const MODE_KEY = "deepsite_mode";
const SESSION_MODE_KEY = "deepsite_mode_session";
const STACK_TYPE_KEY = "deepsite_stack_type";

export type StackType = "html" | "web" | "mobile" | "special";

export function getStackType(): StackType {
  if (typeof window === "undefined") return "html";
  const v = localStorage.getItem(STACK_TYPE_KEY);
  if (v === "web" || v === "mobile" || v === "special") return v;
  return "html";
}

const STACK_OPTIONS: {
  value: StackType;
  label: string;
  shortLabel: string;
  desc: string;
  emoji: string;
}[] = [
  {
    value: "html",
    label: "Web Page",
    shortLabel: "Web Page",
    desc: "Tek sayfa HTML/CSS/JS (vanilla)",
    emoji: "🌐",
  },
  {
    value: "web",
    label: "Web App",
    shortLabel: "Web App",
    desc: "Laravel + Blade + PostgreSQL",
    emoji: "🖥️",
  },
  {
    value: "mobile",
    label: "Mobile App",
    shortLabel: "Mobile",
    desc: "Flutter + Laravel API + PostgreSQL",
    emoji: "📱",
  },
  {
    value: "special",
    label: "Full-Stack SPA",
    shortLabel: "SPA",
    desc: "Laravel API + React + PostgreSQL",
    emoji: "⚡",
  },
];

/** Toolbar'da görünen kompakt proje tipi seçici */
export function StackTypeSelector({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<StackType>("html");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelected(getStackType());
  }, []);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = STACK_OPTIONS.find((o) => o.value === selected)!;

  const handleSelect = (v: StackType) => {
    setSelected(v);
    localStorage.setItem(STACK_TYPE_KEY, v);
    setOpen(false);
    toast.success(`Project type: ${STACK_OPTIONS.find((o) => o.value === v)!.label}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 h-[28px] px-2.5 rounded-md border border-neutral-600 bg-neutral-800 text-xs text-neutral-200 hover:border-neutral-500 hover:bg-neutral-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{current.emoji}</span>
        <span className="font-medium">{current.shortLabel}</span>
        <ChevronDown className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute bottom-[calc(100%+6px)] left-0 z-50 w-56 rounded-xl border border-neutral-700 bg-neutral-900 shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-neutral-800">
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">
              Project Type
            </p>
          </div>
          {STACK_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={[
                "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-100",
                selected === opt.value
                  ? "bg-blue-500/15 text-white"
                  : "text-neutral-300 hover:bg-neutral-800",
              ].join(" ")}
            >
              <span className="text-base shrink-0">{opt.emoji}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-tight">{opt.label}</p>
                <p className="text-[10px] text-neutral-500 leading-tight truncate">
                  {opt.desc}
                </p>
              </div>
              {selected === opt.value && (
                <span className="ml-auto text-blue-400 text-xs shrink-0">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Settings({
  open,
  onClose,
  provider,
  model,
  error,
  onChange,
  onModelChange,
}: {
  open: boolean;
  provider: string;
  model: string;
  error?: string;
  isFollowUp?: boolean;
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  onChange: (provider: string) => void;
  onModelChange: (model: string) => void;
}) {
  const [customModel, setCustomModel] = useState("");
  const [genMode, setGenMode] = useState<"direct" | "agent">("agent");

  useEffect(() => {
    setCustomModel(localStorage.getItem("openai_model") || "");
    const m = sessionStorage.getItem(SESSION_MODE_KEY);
    setGenMode(m === "direct" ? "direct" : "agent");
  }, [open]);

  const modelAvailableProviders = useMemo(() => {
    const availableProviders = MODELS.find(
      (m: { value: string }) => m.value === model
    )?.providers;
    if (!availableProviders) return Object.keys(PROVIDERS);
    return Object.keys(PROVIDERS).filter((id) =>
      availableProviders.includes(id)
    );
  }, [model]);

  useUpdateEffect(() => {
    if (provider !== "auto" && !modelAvailableProviders.includes(provider)) {
      onChange("auto");
    }
  }, [model, provider]);

  const handleSaveSettings = () => {
    localStorage.setItem("openai_model", customModel);
    sessionStorage.setItem(SESSION_MODE_KEY, genMode);
    localStorage.setItem(MODE_KEY, genMode);
    onModelChange(customModel || "default");
    toast.success("Settings saved!");
    onClose(false);
  };

  return (
    <div className="">
      <Popover open={open} onOpenChange={onClose}>
        <PopoverTrigger asChild>
          <Button variant="black" size="sm">
            <PiGearSixFill className="size-4" />
            Settings
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="!rounded-2xl p-0 !w-80 !bg-neutral-900"
          align="end"
          side="top"
          sideOffset={8}
        >
          <header className="flex items-center justify-center text-sm px-4 py-2.5 border-b gap-2 bg-neutral-950 border-neutral-800 font-semibold text-neutral-200 rounded-t-2xl">
            DeepSite Settings
          </header>
          <main className="px-4 pt-4 pb-4 space-y-4">
            {error !== "" && error != null && (
              <p className="text-red-500 text-sm font-medium flex items-center justify-between bg-red-500/10 p-2 rounded-md">
                {error}
              </p>
            )}

            {/* Generation mode */}
            <div>
              <p className="text-neutral-400 text-xs mb-1.5 uppercase tracking-wider font-semibold">Generation Mode</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={genMode === "direct" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => setGenMode("direct")}
                >
                  Direct
                </Button>
                <Button
                  type="button"
                  variant={genMode === "agent" ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => setGenMode("agent")}
                >
                  Agent team
                </Button>
              </div>
            </div>

            {/* Model override */}
            <div>
              <p className="text-neutral-400 text-xs mb-1.5 uppercase tracking-wider font-semibold">Model override</p>
              <Input
                type="text"
                placeholder="default"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="!bg-neutral-800 !border-neutral-700 !text-neutral-200 !h-8 text-xs"
              />
            </div>

            <Button
              variant="default"
              size="sm"
              onClick={handleSaveSettings}
              className="w-full h-8 text-xs"
            >
              Save Settings
            </Button>
          </main>
        </PopoverContent>
      </Popover>
    </div>
  );
}
