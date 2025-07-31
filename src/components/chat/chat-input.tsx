import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useStore } from '@/lib/store';
import { streamChat } from '@/lib/api';
import { toast } from 'sonner';
import { Model } from '@/lib/types';
import { ModelSelector } from '@/components/model-selector';

interface ChatInputProps {
  conversationId: string;
}

export function ChatInput({ conversationId }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    addMessage, 
    settings,
    conversations,
    setIsLoading
  } = useStore();
  
  const conversation = conversations.find(c => c.id === conversationId);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isSubmitting || !conversationId) return;
    
    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
    };
    
    try {
      setIsSubmitting(true);
      setIsLoading(true);
      
      // 检查conversation是否存在
      if (!conversation) {
        console.error('找不到对话:', conversationId);
        toast.error('找不到对话，请刷新页面或创建新对话');
        setIsSubmitting(false);
        setIsLoading(false);
        return;
      }
      
      addMessage(conversationId, userMessage);
      
      // 创建一个空的助手消息，稍后会更新内容
      const assistantMessage = {
        role: 'assistant' as const,
        content: '',
        reasoning_content: '',
      };
      
      addMessage(conversationId, assistantMessage);
      setInput('');
      
      // 发送消息后立即触发滚动事件
      requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('content-update'));
      });
      
      // 获取对话的所有消息，包括系统消息
      let messages = [...conversation.messages, userMessage];
      
      // 如果有全局系统提示词，添加到系统消息中
      if (settings.globalSystemPrompt && settings.globalSystemPrompt.trim() !== '') {
        // 查找现有的系统消息
        const systemMessageIndex = messages.findIndex(m => m.role === 'system');
        
        if (systemMessageIndex >= 0) {
          // 如果已有系统消息，将全局提示词添加到现有系统消息中
          const existingSystemMessage = messages[systemMessageIndex];
          messages[systemMessageIndex] = {
            ...existingSystemMessage,
            content: `${existingSystemMessage.content}\n\n${settings.globalSystemPrompt}`,
          };
        } else {
          // 如果没有系统消息，创建一个新的
          messages = [
            {
              role: 'system',
              content: settings.globalSystemPrompt,
            },
            ...messages,
          ];
        }
      }
      
      await streamChat({
        messages,
        model: settings.defaultModel as Model,
        apiKey: settings.apiKey,
        apiEndpoint: settings.apiEndpoint,
        onUpdate: (content, reasoning) => {
          console.log('收到更新:', { content, reasoning });
          
          // 获取最新的对话状态
          const currentConversation = useStore.getState().conversations.find(c => c.id === conversationId);
          if (!currentConversation) {
            console.error('找不到对话:', conversationId);
            return;
          }
          
          const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
          console.log('最后一条消息:', lastMessage);
          
          // 使用状态更新函数而不是闭包中的值
          const { addMessage } = useStore.getState();
          
          try {
            // 直接使用api.ts提供的批量内容更新，减少状态更新次数
            if (content || reasoning) {
              const updatedContent = lastMessage.content + (content || '');
              const updatedReasoning = (lastMessage.reasoning_content || '') + (reasoning || '');
              
              console.log('更新内容为:', { updatedContent, updatedReasoning });
              
              // 仅使用一次调用更新两种内容
              addMessage(
                conversationId,
                {
                  role: 'assistant',
                  content: updatedContent,
                  reasoning_content: updatedReasoning
                },
                true
              );
              
              // 降低事件触发频率，使用更长的阈值和更长的延迟
              if ((content && content.length > 30) || (reasoning && reasoning.length > 30)) {
                setTimeout(() => {
                  document.dispatchEvent(new CustomEvent('content-update'));
                }, 100);
              }
            }
          } catch (error) {
            console.error('更新消息失败:', error);
          }
        },
        onFinish: () => {
          console.log('流式输出完成');
          setIsSubmitting(false);
          setIsLoading(false);
        },
        onError: (error) => {
          console.error('流式输出错误:', error);
          toast.error(`请求失败: ${error.message}`);
          setIsSubmitting(false);
          setIsLoading(false);
        },
      });
    } catch (error) {
      toast.error(`发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  if (!conversationId) return null;
  
  return (
    <form onSubmit={handleSubmit} className="p-2 border-t">
      <div className="relative flex items-end w-full">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入消息..."
          className="min-h-[105px] w-full resize-none pr-24 text-xs py-4"
          disabled={isSubmitting}
          rows={1}
        />
        <div className="absolute right-2 bottom-4 flex items-center gap-1">
          <ModelSelector />
          <Button 
            type="submit" 
            size="sm" 
            className="h-7 w-7 p-0"
            disabled={isSubmitting || !input.trim()}
          >
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </form>
  );
} 