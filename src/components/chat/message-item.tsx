import React, { useEffect, useRef, useState, memo, useCallback } from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface MessageItemProps {
  message: Message;
  showThinking?: boolean;
}

// 使用memo包装组件，避免不必要的重渲染
export const MessageItem = memo(function MessageItem({ message, showThinking = false }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const contentRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);
  
  // 使用状态来跟踪内容，确保组件重新渲染
  const [content, setContent] = useState(message.content);
  const [reasoningContent, setReasoningContent] = useState(message.reasoning_content);
  
  // 使用ref跟踪最后更新时间，防止频繁更新
  const lastUpdateTime = useRef<number>(Date.now());
  
  // 创建更新处理函数
  const handleContentUpdate = useCallback(() => {
    // 添加节流，避免频繁更新
    const now = Date.now();
    if (now - lastUpdateTime.current < 100) {
      return; // 如果距离上次更新不到100ms，则忽略此次更新
    }
    
    if (message.content !== content) {
      console.log('通过事件更新内容:', message.content);
      setContent(message.content);
      lastUpdateTime.current = now;
      
      // 使用RAF确保DOM更新后再滚动
      requestAnimationFrame(() => {
        if (contentRef.current && !isUser) {
          contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
    }
  }, [message.content, content, isUser]);
  
  const handleReasoningUpdate = useCallback(() => {
    // 添加节流，避免频繁更新
    const now = Date.now();
    if (now - lastUpdateTime.current < 100) {
      return; // 如果距离上次更新不到100ms，则忽略此次更新
    }
    
    if (message.reasoning_content !== reasoningContent) {
      console.log('通过事件更新推理内容:', message.reasoning_content);
      setReasoningContent(message.reasoning_content);
      lastUpdateTime.current = now;
      
      // 使用RAF确保DOM更新后再滚动
      requestAnimationFrame(() => {
        if (reasoningRef.current && message.reasoning_content) {
          reasoningRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      });
    }
  }, [message.reasoning_content, reasoningContent]);
  
  // 添加自定义事件监听器
  useEffect(() => {
    // 监听内容更新事件
    document.addEventListener('content-update', handleContentUpdate);
    document.addEventListener('reasoning-update', handleReasoningUpdate);
    
    return () => {
      document.removeEventListener('content-update', handleContentUpdate);
      document.removeEventListener('reasoning-update', handleReasoningUpdate);
    };
  }, [handleContentUpdate, handleReasoningUpdate]);
  
  // 当消息内容更新时，立即更新本地状态并滚动
  useEffect(() => {
    // 添加节流，避免频繁更新
    const now = Date.now();
    if (now - lastUpdateTime.current < 100 && content !== '') {
      return; // 如果距离上次更新不到100ms且已有内容，则忽略此次更新
    }
    
    if (message.content !== content) {
      console.log('内容更新:', message.content);
      setContent(message.content);
      lastUpdateTime.current = now;
      
      // 不主动滚动，只更新内容
      // 由MessageList统一管理滚动行为
    }
  }, [message.content, content, isUser]);
  
  // 当思考过程更新时，立即更新本地状态并滚动
  useEffect(() => {
    // 添加节流，避免频繁更新
    const now = Date.now();
    if (now - lastUpdateTime.current < 100 && reasoningContent !== '') {
      return; // 如果距离上次更新不到100ms且已有内容，则忽略此次更新
    }
    
    if (message.reasoning_content !== reasoningContent) {
      console.log('推理内容更新:', message.reasoning_content);
      setReasoningContent(message.reasoning_content);
      lastUpdateTime.current = now;
      
      // 不主动滚动，只更新内容
      // 由MessageList统一管理滚动行为
    }
  }, [message.reasoning_content, reasoningContent]);
  
  if (isSystem) return null;
  
  return (
    <div className={cn(
      "flex w-full items-start gap-4 p-4 md:p-6 border-b",
      isUser ? "bg-background" : "bg-muted/30"
    )}>
      <div className="flex size-8 shrink-0 select-none items-center justify-center rounded-full border bg-background shadow-sm">
        {isUser ? (
          <User className="size-4" />
        ) : (
          <Bot className="size-4" />
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-hidden">
        {showThinking && reasoningContent && (
          <div className="mb-4 rounded-lg border bg-muted/30 p-4 shadow-sm">
            <div className="text-xs font-medium text-muted-foreground mb-2">思考过程</div>
            <div 
              ref={reasoningRef}
              className="prose prose-sm max-w-none prose-neutral dark:prose-invert text-xs leading-relaxed"
            >
              <ReactMarkdown>
                {reasoningContent}
              </ReactMarkdown>
            </div>
          </div>
        )}
        <div 
          ref={contentRef}
          className="prose prose-sm max-w-none prose-neutral dark:prose-invert text-xs leading-relaxed"
        >
          <ReactMarkdown>
            {content || (isUser ? '' : '▋')}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // 优化重渲染逻辑：只有当内容或推理内容变化时才重新渲染
  return (
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.reasoning_content === nextProps.message.reasoning_content &&
    prevProps.showThinking === nextProps.showThinking
  );
}); 