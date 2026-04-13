import { ReactNode } from "react";
import { Eye, FolderOpen, MessageCircle } from "lucide-react";

import { Button } from "@/components/deepsite-v2/ui/button";
import classNames from "classnames";
import Image from "next/image";

const TABS = [
  {
    value: "chat",
    label: "Chat",
    icon: MessageCircle,
  },
  {
    value: "preview",
    label: "Preview",
    icon: Eye,
  },
  {
    value: "files",
    label: "Files",
    icon: FolderOpen,
  },
];

export function Header({
  tab,
  onNewTab,
  children,
}: {
  tab: string;
  onNewTab: (tab: string) => void;
  children?: ReactNode;
}) {
  return (
    <header className="border-b bg-slate-200 border-slate-300 dark:bg-neutral-950 dark:border-neutral-800 px-3 lg:px-6 py-2 flex items-center max-lg:gap-3 justify-between lg:grid lg:grid-cols-3 z-20">
      <div className="flex items-center justify-start gap-3">
        <h1 className="text-neutral-900 dark:text-white text-lg lg:text-xl font-bold flex items-center justify-start">
          <Image
            src="/deepsite/logo.svg"
            alt="DeepSite Logo"
            width={32}
            height={32}
            className="size-6 lg:size-8 mr-2 invert-100 dark:invert-0"
          />
          <p className="max-md:hidden flex items-center justify-start">
            DeepSite
            <span className="font-mono bg-gradient-to-br from-sky-500 to-emerald-500 text-neutral-950 rounded-full text-xs ml-2 px-1.5 py-0.5">
              {" "}
              v2
            </span>
          </p>
        </h1>
      </div>
      <div
        className="flex min-w-0 flex-1 items-center justify-start gap-1 overflow-x-auto overflow-y-visible py-0.5 max-lg:border-l max-lg:border-l-neutral-800 max-lg:pl-3 sm:gap-2 lg:justify-center"
        role="tablist"
        aria-label="Editör görünümleri"
      >
        {TABS.map((item) => (
          <Button
            key={item.value}
            type="button"
            data-testid={`deepsite-tab-${item.value}`}
            aria-label={item.label}
            variant={tab === item.value ? "secondary" : "ghost"}
            className={classNames("shrink-0 whitespace-nowrap", {
              "opacity-60": tab !== item.value,
            })}
            size="sm"
            title={item.label}
            aria-current={tab === item.value ? "true" : undefined}
            onClick={() => onNewTab(item.value)}
          >
            <item.icon className="size-4 shrink-0" aria-hidden />
            {/* Plan: Chat | Preview | Files — metin her zaman görünsün (dar pencerede ikon+etiket kaybolmasın) */}
            <span className="inline text-xs sm:text-[13px]">{item.label}</span>
          </Button>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">{children}</div>
    </header>
  );
}
