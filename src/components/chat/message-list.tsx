import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Message } from '@/lib/types';
import { MessageItem } from './message-item';
import { useStore } from '@/lib/store';
import { useIsMobile } from '@/lib/hooks/use-media-query';

interface MessageListProps {
  conversationId: string;
  showThinking?: boolean;
}

export function MessageList({ conversationId, showThinking = false }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { conversations, isLoading } = useStore();
  const conversation = conversations.find(c => c.id === conversationId);
  const messages = conversation?.messages || [];
  const isMobile = useIsMobile();
  
  // 跟踪最后一条消息的内容，用于检测变化
  const [lastMessageContent, setLastMessageContent] = useState<string>('');
  const [lastMessageId, setLastMessageId] = useState<number>(0);
  // 添加一个强制更新状态
  const [updateTrigger, setUpdateTrigger] = useState(0);
  // 用户是否正在手动滚动
  const [userScrolling, setUserScrolling] = useState(false);
  // 上次滚动时间
  const lastUserScrollTime = useRef<number>(0);
  // 防止过于频繁的滚动更新
  const lastScrollTime = useRef<number>(0);
  
  // 创建更新处理函数
  const handleContentUpdate = useCallback(() => {
    console.log('收到内容更新事件');
    // 触发组件重新渲染
    setUpdateTrigger(prev => prev + 1);
    
    // 检查是否应该自动滚动
    const now = Date.now();
    // 只有当用户超过1.5秒没有手动滚动，并且距离上次自动滚动超过300ms时，才执行自动滚动
    if (now - lastUserScrollTime.current > 1500 && now - lastScrollTime.current > 300) {
      // 设置上次自动滚动时间
      lastScrollTime.current = now;
      // 使用requestAnimationFrame确保在下一帧渲染后滚动
      requestAnimationFrame(() => {
        scrollToBottomSafely();
      });
    }
  }, []);
  
  // 监听用户滚动事件
  useEffect(() => {
    const handleScroll = () => {
      lastUserScrollTime.current = Date.now();
      setUserScrolling(true);
      
      // 1.5秒后重置用户滚动状态
      setTimeout(() => {
        setUserScrolling(false);
      }, 1500);
    };
    
    if (containerRef.current) {
      containerRef.current.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);
  
  // 安全滚动到底部，考虑移动端输入框的高度
  const scrollToBottomSafely = useCallback(() => {
    // 如果用户正在手动滚动，则不干预
    if (userScrolling) {
      console.log('用户正在滚动，取消自动滚动');
      return;
    }
    
    if (bottomRef.current) {
      console.log('执行自动滚动');
      if (isMobile) {
        // 在移动端，考虑底部输入框的高度
        bottomRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'end'
        });
        
        // 额外添加一些偏移，确保内容完全可见
        setTimeout(() => {
          window.scrollBy({
            top: -120, // 增加偏移量，更好地避免被输入框遮挡
            behavior: 'smooth'
          });
        }, 100);
      } else {
        // 桌面端正常滚动
        bottomRef.current.scrollIntoView({ 
          behavior: 'smooth'
        });
      }
    }
  }, [isMobile, userScrolling]);
  
  // 添加自定义事件监听器
  useEffect(() => {
    // 监听内容更新事件
    document.addEventListener('content-update', handleContentUpdate);
    document.addEventListener('reasoning-update', handleContentUpdate);
    
    return () => {
      document.removeEventListener('content-update', handleContentUpdate);
      document.removeEventListener('reasoning-update', handleContentUpdate);
    };
  }, [handleContentUpdate]);

  // 监听消息列表变化和加载状态变化，自动滚动到底部
  useEffect(() => {
    // 使用setTimeout延迟执行自动滚动，确保DOM完全更新
    const timeoutId = setTimeout(() => {
      // 检查是否应该自动滚动
      const now = Date.now();
      // 只有当用户超过1.5秒没有手动滚动时，才执行自动滚动
      if (now - lastUserScrollTime.current > 1500) {
        scrollToBottomSafely();
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages.length, isLoading, updateTrigger, scrollToBottomSafely]);

  // 监听最后一条消息的内容变化，实时滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // 只有当最后一条消息是助手且内容变化时才考虑滚动
      if (lastMessage.role === 'assistant') {
        const currentContent = lastMessage.content || '';
        
        // 检查内容是否有变化
        if (currentContent !== lastMessageContent || messages.length !== lastMessageId) {
          setLastMessageContent(currentContent);
          setLastMessageId(messages.length);
          
          // 检查是否应该自动滚动
          const now = Date.now();
          // 只有当用户超过1.5秒没有手动滚动时，才执行自动滚动
          if (now - lastUserScrollTime.current > 1500 && now - lastScrollTime.current > 300) {
            lastScrollTime.current = now;
            // 使用requestAnimationFrame确保在下一帧渲染后滚动
            requestAnimationFrame(() => {
              scrollToBottomSafely();
            });
          }
        }
      }
    }
  }, [messages, updateTrigger, scrollToBottomSafely]);

  const filteredMessages = messages.filter(message => message.role !== 'system');

  if (filteredMessages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="text-center">
          <h3 className="text-sm font-medium">开始对话</h3>
          <p className="text-xs text-muted-foreground mt-1">
            发送一条消息开始与AI助手对话
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto">
      {filteredMessages.map((message, index) => (
        <MessageItem 
          key={`${index}-${message.content?.length || 0}-${message.reasoning_content?.length || 0}-${updateTrigger}`} 
          message={message} 
          showThinking={showThinking}
        />
      ))}
      <div ref={bottomRef} className="h-24 md:h-1" />
    </div>
  );
} 