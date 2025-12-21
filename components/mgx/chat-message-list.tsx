import * as React from "react";
import { ChatMessage, type ChatMessageProps } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";
import { cn } from "@/lib/utils";
import { Bot, ArrowDown } from "lucide-react";
import { Button } from "@/components/mgx/ui/button";

interface ChatMessageListProps {
  messages: ChatMessageProps[];
  isTyping?: boolean;
  typingAgentName?: string;
  taskId?: string;
  onPinToMemory?: (messageId: string, content: string, title: string) => void;
  className?: string;
}

export function ChatMessageList({
  messages,
  isTyping,
  typingAgentName,
  taskId,
  onPinToMemory,
  className,
}: ChatMessageListProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);

  const scrollToBottom = React.useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShowScrollButton(!isAtBottom);
  };

  React.useEffect(() => {
    // Initial scroll to bottom
    scrollToBottom("auto");
  }, []);

  React.useEffect(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isTyping, scrollToBottom]);

  return (
    <div className={cn("relative flex flex-1 flex-col overflow-hidden", className)}>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div className="flex justify-center py-4 text-xs text-zinc-400">
          <span>Start of conversation</span>
        </div>
        
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
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
