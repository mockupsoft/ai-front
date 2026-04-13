"use client";

import * as React from "react";
import { File, Folder, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: FileTreeNode[];
  content?: string;
  size?: number;
}

interface FileTreeProps {
  files: FileTreeNode[];
  selectedFile?: string;
  onFileSelect?: (file: FileTreeNode) => void;
  className?: string;
}

function buildFileTree(fileList: Array<{ name: string; path: string; content?: string; size?: number }>): FileTreeNode[] {
  const tree: FileTreeNode[] = [];
  const pathMap = new Map<string, FileTreeNode>();

  for (const file of fileList) {
    const parts = file.path.split("/").filter(Boolean);
    let currentPath = "";
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      
      if (!pathMap.has(currentPath)) {
        const node: FileTreeNode = {
          name: part,
          path: currentPath,
          type: isLast ? "file" : "folder",
          children: isLast ? undefined : [],
          content: isLast ? file.content : undefined,
          size: isLast ? file.size : undefined,
        };
        
        pathMap.set(currentPath, node);
        
        if (i === 0) {
          tree.push(node);
        } else {
          const parentPath = parts.slice(0, i).join("/");
          const parent = pathMap.get(parentPath);
          if (parent && parent.children) {
            parent.children.push(node);
          }
        }
      } else if (isLast) {
        // Update file node with content
        const node = pathMap.get(currentPath)!;
        node.content = file.content;
        node.size = file.size;
      }
    }
  }

  return tree;
}

function FileTreeItem({
  node,
  level = 0,
  selectedFile,
  onFileSelect,
}: {
  node: FileTreeNode;
  level?: number;
  selectedFile?: string;
  onFileSelect?: (file: FileTreeNode) => void;
}) {
  const [isExpanded, setIsExpanded] = React.useState(level < 2); // Auto-expand first 2 levels
  const isSelected = selectedFile === node.path;
  const hasChildren = node.children && node.children.length > 0;

  const handleClick = () => {
    if (node.type === "file") {
      onFileSelect?.(node);
    } else if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 px-2 py-1.5 text-sm cursor-pointer rounded hover:bg-zinc-100 dark:hover:bg-zinc-800",
          isSelected && "bg-zinc-200 dark:bg-zinc-700",
          node.type === "file" && "text-zinc-700 dark:text-zinc-300",
          node.type === "folder" && "text-zinc-900 dark:text-zinc-100 font-medium"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleClick}
      >
        {node.type === "folder" && (
          <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </span>
        )}
        {node.type === "file" && <span className="flex-shrink-0 w-4" />}
        
        {node.type === "folder" ? (
          <Folder className="h-4 w-4 flex-shrink-0 text-zinc-500" />
        ) : (
          <File className="h-4 w-4 flex-shrink-0 text-zinc-400" />
        )}
        
        <span className="truncate">{node.name}</span>
        
        {node.type === "file" && node.size !== undefined && (
          <span className="ml-auto text-xs text-zinc-500">
            {(node.size / 1024).toFixed(1)} KB
          </span>
        )}
      </div>
      
      {node.type === "folder" && isExpanded && hasChildren && (
        <div>
          {node.children!.map((child) => (
            <FileTreeItem
              key={child.path}
              node={child}
              level={level + 1}
              selectedFile={selectedFile}
              onFileSelect={onFileSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  files: fileList,
  selectedFile,
  onFileSelect,
  className,
}: FileTreeProps) {
  const tree = React.useMemo(() => {
    // If files are already in tree format, use them directly
    if (fileList.length > 0 && "children" in fileList[0]) {
      return fileList as FileTreeNode[];
    }
    // Otherwise, build tree from flat list
    return buildFileTree(fileList as any[]);
  }, [fileList]);

  if (tree.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center p-4", className)}>
        <div className="text-center text-zinc-500 dark:text-zinc-400">
          <File className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">No files available</p>
          <p className="text-xs mt-2">Files will appear here when the project is generated</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full w-full overflow-y-auto", className)}>
      {tree.map((node) => (
        <FileTreeItem
          key={node.path}
          node={node}
          selectedFile={selectedFile}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}










