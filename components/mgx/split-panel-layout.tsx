"use client";

import * as React from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

interface SplitPanelLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftPanelMinSize?: number;
  rightPanelMinSize?: number;
  leftPanelDefaultSize?: number;
  rightPanelDefaultSize?: number;
  className?: string;
}

export function SplitPanelLayout({
  leftPanel,
  rightPanel,
  leftPanelMinSize = 30,
  rightPanelMinSize = 30,
  leftPanelDefaultSize = 40,
  rightPanelDefaultSize = 60,
  className,
}: SplitPanelLayoutProps) {
  return (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        height: '100%', 
        width: '100%',
        flex: 1,
        overflow: 'hidden'
      }}
    >
      <PanelGroup 
        orientation="horizontal" 
        style={{ 
          display: 'flex',
          flex: 1, 
          width: '100%', 
          height: '100%',
          overflow: 'hidden'
        }}
      >
        <Panel
          defaultSize={leftPanelDefaultSize}
          minSize={leftPanelMinSize}
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
        >
          {leftPanel}
        </Panel>
        <PanelResizeHandle className="w-1 bg-zinc-700 hover:bg-zinc-600 transition-colors cursor-col-resize" />
        <Panel
          defaultSize={rightPanelDefaultSize}
          minSize={rightPanelMinSize}
          style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}
        >
          {rightPanel}
        </Panel>
      </PanelGroup>
    </div>
  );
}

