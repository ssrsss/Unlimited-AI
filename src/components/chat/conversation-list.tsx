import React from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Trash2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ConversationListProps {
  onSelectConversation?: () => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { 
    conversations, 
    currentConversationId, 
    createConversation, 
    deleteConversation, 
    setCurrentConversation,
    currentCharacterId
  } = useStore();
  
  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversation(conversationId);
    if (onSelectConversation) {
      onSelectConversation();
    }
  };
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-sm font-medium">对话列表</h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>这里显示您的所有对话</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            没有对话历史
          </div>
        ) : (
          <div className="space-y-2 p-3 pb-16">
            {conversations.map((conversation) => (
              <div 
                key={conversation.id}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-3 text-sm transition-colors border shadow-sm hover:bg-accent/50 cursor-pointer",
                  conversation.id === currentConversationId 
                    ? "bg-accent border-primary" 
                    : "border-border"
                )}
                onClick={() => handleSelectConversation(conversation.id)}
              >
                <div className="flex-1 truncate">
                  <div className="font-medium truncate">{conversation.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(new Date(conversation.updatedAt))}
                  </div>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>确认删除</AlertDialogTitle>
                      <AlertDialogDescription>
                        你确定要删除这个对话吗？此操作无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteConversation(conversation.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        删除
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 