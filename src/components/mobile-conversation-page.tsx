'use client';

import { ArrowLeft, MessageSquarePlus } from 'lucide-react';
import { ConversationList } from './chat/conversation-list';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';

interface MobileConversationPageProps {
  setActiveTab: (tab: string) => void;
}

export function MobileConversationPage({ setActiveTab }: MobileConversationPageProps) {
  const { createConversation } = useStore();

  const handleCreateConversation = () => {
    try {
      const newConversationId = createConversation();
      console.log('新对话已创建:', newConversationId);
      // 创建对话后返回聊天页面
      setActiveTab('chat');
    } catch (error) {
      console.error('创建对话失败:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center p-2 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setActiveTab('chat')}
          className="mr-2 h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-sm font-bold">对话列表</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto pb-16">
        <ConversationList onSelectConversation={() => setActiveTab('chat')} />
      </div>
      
      <div className="p-2 border-t border-border mt-auto">
        <Button 
          className="w-full flex items-center justify-center gap-2 py-1.5 h-auto text-xs" 
          onClick={handleCreateConversation}
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          新建对话
        </Button>
      </div>
    </div>
  );
} 