import * as React from "react";
import { ChatMessage, type ChatMessageProps } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { cn } from "@/lib/utils";
import { Bot, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/mgx/ui/button";

interface ChatMessageListProps {
  messages: ChatMessageProps[];
  isTyping?: boolean;
  typingAgentName?: string;
  taskId?: string;
  onPinToMemory?: (messageId: string, content: string, title: string) => void;
  onLoadOlder?: () => void;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
  className?: string;
}

export function ChatMessageList({
  messages,
  isTyping,
  typingAgentName,
  taskId,
  onPinToMemory,
  onLoadOlder,
  isLoadingMore = false,
  hasMoreMessages = false,
  className,
}: ChatMessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
    
    // Detect when user scrolls near top (within 200px) to load older messages
    if (scrollTop < 200 && hasMoreMessages && !isLoadingMore && onLoadOlder) {
      onLoadOlder();
    }
  }, [hasMoreMessages, isLoadingMore, onLoadOlder]);

  // Scroll to bottom when messages are first loaded or when new messages are added
  React.useEffect(() => {
    // Always scroll to bottom when messages change (initial load or new messages)
    // This ensures newest messages (at the bottom) are visible
    // Use requestAnimationFrame + setTimeout to ensure DOM is fully rendered
    const scrollTimeout = setTimeout(() => {
      requestAnimationFrame(() => {
        if (bottomRef.current && scrollRef.current) {
          // Force scroll to bottom by setting scrollTop to max
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        } else {
          // Fallback to scrollIntoView
          scrollToBottom("auto");
        }
      });
    }, 150);
    return () => clearTimeout(scrollTimeout);
  }, [messages.length, scrollToBottom]);

  // Auto-scroll when new messages arrive (if user is already at bottom)
  React.useEffect(() => {
    if (!scrollRef.current || messages.length === 0) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // Check if user is near the bottom (within 150px threshold)
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 150;

    // Only auto-scroll to bottom if user is already at the bottom
    // This prevents interrupting user's manual scrolling
    if (isAtBottom) {
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      });
    }
  }, [messages, isTyping]);

  return (
    <div className={cn("relative flex flex-1 flex-col overflow-hidden", className)} style={{ minHeight: 0 }}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4"
        style={{ minHeight: 0 }}
      >
        {/* Loading indicator for older messages */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          </div>
        )}
        
        {!hasMoreMessages && messages.length > 0 && (
          <div className="flex justify-center py-4 text-xs text-zinc-400">
            <span>Start of conversation</span>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage 
            key={message.messageId || message.timestamp || `msg-${message.content?.substring(0, 20)}`} 
            {...message} 
            taskId={taskId}
            onPinToMemory={onPinToMemory}
          />
        ))}

        {isTyping && (
          <div className="flex w-full gap-3 py-2">
             <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200">
               <Bot className="h-5 w-5" />
             </div>
             <div className="flex max-w-[80%] flex-col items-start">
               <div className="mb-1 text-xs font-medium text-zinc-900 dark:text-zinc-100">
                 {typingAgentName || "Agent"}
               </div>
               <div className="rounded-lg rounded-tl-none bg-zinc-100 px-4 py-3 dark:bg-zinc-800">
                 <TypingIndicator />
               </div>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showScrollButton && (
        <Button
          size="sm"
          variant="secondary"
          className="absolute bottom-4 right-4 h-8 w-8 p-0 rounded-full opacity-80 shadow-md transition-opacity hover:opacity-100"
          onClick={() => scrollToBottom()}
        >
          <ArrowDown className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
