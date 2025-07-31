'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageList } from '@/components/chat/message-list';
import { ChatInput } from '@/components/chat/chat-input';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CharacterSettings } from '@/components/settings/character-settings';
import { ApiSettings } from '@/components/settings/api-settings';
import { PromptSettings } from '@/components/settings/prompt-settings';
import { ThemeSettings } from '@/components/settings/theme-settings';
import { MessageSquarePlus, Settings, User, Sliders, Menu, List, FileText, Info, HelpCircle, Tag, Sun } from 'lucide-react';
import { useIsMobile } from '@/lib/hooks/use-media-query';
import { MobileNav } from '@/components/mobile-nav';
import { MobileConversationPage } from '@/components/mobile-conversation-page';
import { MobileSettingsPage } from '@/components/mobile-settings-page';
import { AnnouncementDialog } from '@/components/announcement-dialog';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ChatLayoutProps {
  children?: React.ReactNode;
}

export default function ChatLayout({ children }: ChatLayoutProps) {
  const { conversations, currentConversationId, createConversation, settings } = useStore();
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("character");
  const [showThinking, setShowThinking] = useState<boolean>(settings.showThinking);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<string>("chat"); // "chat", "conversations", "settings"
  
  const isMobile = useIsMobile();
  const pathname = usePathname();
  
  // 监听角色更新事件，确保使用最新的角色数据
  useEffect(() => {
    const handleCharacterUpdate = () => {
      console.log('聊天布局接收到角色更新事件');
      // 强制刷新状态
      useStore.setState({});
    };
    
    document.addEventListener('character-updated', handleCharacterUpdate);
    
    return () => {
      document.removeEventListener('character-updated', handleCharacterUpdate);
    };
  }, []);
  
  // 当settings.showThinking变化时更新本地状态
  useEffect(() => {
    console.log('设置已更新:', settings);
    setShowThinking(settings.showThinking);
  }, [settings]); // 添加settings作为依赖项
  
  // 初始化对话
  useEffect(() => {
    const initializeConversation = async () => {
      // 如果没有对话，创建一个新的
      if (conversations.length === 0 && !isInitialized) {
        console.log('创建新对话...');
        setIsInitialized(true);
        try {
          const newConversationId = createConversation();
          console.log('新对话已创建:', newConversationId);
          
          // 等待状态更新
          setTimeout(() => {
            const updatedConversations = useStore.getState().conversations;
            console.log('更新后的对话列表:', updatedConversations);
          }, 100);
        } catch (error) {
          console.error('创建对话失败:', error);
        }
      }
    };
    
    initializeConversation();
    
    // 在组件加载时检查localStorage中的设置
    try {
      const storedData = localStorage.getItem('unlimited-ai-chat');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('从localStorage加载的设置:', parsedData.state?.settings);
      }
    } catch (e) {
      console.error('读取localStorage失败:', e);
    }
  }, [conversations.length, createConversation, isInitialized, settings]);

  // 处理创建新对话
  const handleCreateConversation = () => {
    try {
      const newConversationId = createConversation();
      console.log('新对话已创建:', newConversationId);
    } catch (error) {
      console.error('创建对话失败:', error);
    }
  };

  // 准备渲染内容
  let content;
  
  // 如果当前页面是价格页面，直接显示价格内容
  if (pathname === '/pricing') {
    content = (
      <div className="flex flex-col min-h-screen">
        {children}
        {isMobile && <MobileNav activeTab="pricing" setActiveTab={() => {}} />}
      </div>
    );
  }
  // 渲染移动端视图
  else if (isMobile) {
    content = (
      <div className="flex flex-col h-screen overflow-hidden">
        {/* 移动端头部 */}
        {mobileView === "chat" && (
          <div className="flex items-center justify-between p-2 border-b border-border bg-background">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMobileView("conversations")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <h1 className="text-sm font-bold">Unlimited AI</h1>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMobileView("settings")}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        {/* 移动端内容区 */}
        {mobileView === "chat" && currentConversationId && conversations.find(c => c.id === currentConversationId) ? (
          <>
            <div className="flex-1 overflow-y-auto pb-40">
              <MessageList 
                conversationId={currentConversationId} 
                showThinking={showThinking} 
              />
            </div>
            <div className="fixed bottom-12 left-0 right-0 border-t border-border bg-background p-2 py-4 shadow-lg z-10">
              <ChatInput conversationId={currentConversationId} />
            </div>
          </>
        ) : mobileView === "chat" ? (
          <div className="flex-1 flex items-center justify-center bg-muted/10">
            <div className="text-center max-w-md mx-auto p-4">
              <h3 className="text-sm font-medium">Unlimited AI</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {conversations.length > 0 
                  ? '请选择一个对话或创建新对话' 
                  : '体验现代智能化的 AI'}
              </p>
              
              {conversations.length === 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-4 text-left">
                    <div className="p-3 border border-border rounded-lg">
                      <FileText className="h-5 w-5 mb-1 text-primary" />
                      <h4 className="text-xs font-medium">智能写作</h4>
                      <p className="text-[10px] text-muted-foreground">创作文章、总结内容、生成创意文案</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <HelpCircle className="h-5 w-5 mb-1 text-primary" />
                      <h4 className="text-xs font-medium">知识问答</h4>
                      <p className="text-[10px] text-muted-foreground">解答问题、提供专业知识和建议</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <User className="h-5 w-5 mb-1 text-primary" />
                      <h4 className="text-xs font-medium">多角色切换</h4>
                      <p className="text-[10px] text-muted-foreground">根据需求选择不同专业领域的AI助手</p>
                    </div>
                    <div className="p-3 border border-border rounded-lg">
                      <Settings className="h-5 w-5 mb-1 text-primary" />
                      <h4 className="text-xs font-medium">自定义设置</h4>
                      <p className="text-[10px] text-muted-foreground">个性化配置，满足不同使用场景</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full flex items-center justify-center gap-2" 
                    onClick={handleCreateConversation}
                  >
                    <MessageSquarePlus className="h-4 w-4" />
                    开始对话
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : mobileView === "conversations" ? (
          <MobileConversationPage setActiveTab={(tab) => setMobileView(tab)} />
        ) : mobileView === "settings" ? (
          <MobileSettingsPage setActiveTab={(tab) => setMobileView(tab)} />
        ) : null}
        
        {/* 移动端底部导航 */}
        <MobileNav activeTab={mobileView} setActiveTab={setMobileView} />
      </div>
    );
  }
  // 桌面端视图
  else {
    content = (
      <div className="flex h-screen overflow-hidden">
        {/* 侧边栏 */}
        <div className="w-72 border-r border-border bg-background flex flex-col shadow-sm">
          <div className="p-4 border-b border-border">
            <h1 className="text-xl font-bold mb-4">Unlimited AI</h1>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="chat">聊天</TabsTrigger>
                <TabsTrigger value="settings">设置</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {activeTab === "chat" && (
            <>
              <div className="flex-1 overflow-y-auto">
                <ConversationList />
              </div>
              <div className="p-4 border-t border-border mt-auto space-y-2">
                <Button 
                  className="w-full flex items-center justify-center gap-2" 
                  onClick={handleCreateConversation}
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  新建对话
                </Button>
                <Link href="/pricing">
                  <Button 
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2" 
                  >
                    <Tag className="h-4 w-4" />
                    查看价格套餐
                  </Button>
                </Link>
              </div>
            </>
          )}
          
          {activeTab === "settings" && (
            <div className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border">
                <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="character" className="flex items-center gap-1 text-xs">
                      <User className="h-3 w-3" />
                      角色
                    </TabsTrigger>
                    <TabsTrigger value="api" className="flex items-center gap-1 text-xs">
                      <Sliders className="h-3 w-3" />
                      API
                    </TabsTrigger>
                    <TabsTrigger value="prompt" className="flex items-center gap-1 text-xs">
                      <FileText className="h-3 w-3" />
                      提示词
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="flex items-center gap-1 text-xs">
                      <Sun className="h-3 w-3" />
                      主题
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-1 overflow-hidden">
                {activeSettingsTab === "character" && <CharacterSettings />}
                {activeSettingsTab === "api" && <ApiSettings />}
                {activeSettingsTab === "prompt" && <PromptSettings />}
                {activeSettingsTab === "theme" && <ThemeSettings />}
              </div>
            </div>
          )}
        </div>
        
        {/* 主内容区 */}
        <div className="flex-1 flex flex-col bg-background">
          {currentConversationId && conversations.find(c => c.id === currentConversationId) ? (
            <>
              <div className="flex-1 overflow-y-auto p-4">
                <MessageList 
                  conversationId={currentConversationId} 
                  showThinking={showThinking} 
                />
              </div>
              <div className="border-t border-border p-4 py-6">
                <ChatInput conversationId={currentConversationId} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/10">
              <div className="text-center max-w-md mx-auto p-4">
                <h3 className="text-sm font-medium">Unlimited AI</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4">
                  {conversations.length > 0 
                    ? '请选择一个对话或创建新对话' 
                    : '体验现代智能化的 AI'}
                </p>
                
                {conversations.length === 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4 text-left">
                      <div className="p-3 border border-border rounded-lg">
                        <FileText className="h-5 w-5 mb-1 text-primary" />
                        <h4 className="text-xs font-medium">智能写作</h4>
                        <p className="text-[10px] text-muted-foreground">创作文章、总结内容、生成创意文案</p>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <HelpCircle className="h-5 w-5 mb-1 text-primary" />
                        <h4 className="text-xs font-medium">知识问答</h4>
                        <p className="text-[10px] text-muted-foreground">解答问题、提供专业知识和建议</p>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <User className="h-5 w-5 mb-1 text-primary" />
                        <h4 className="text-xs font-medium">多角色切换</h4>
                        <p className="text-[10px] text-muted-foreground">根据需求选择不同专业领域的AI助手</p>
                      </div>
                      <div className="p-3 border border-border rounded-lg">
                        <Settings className="h-5 w-5 mb-1 text-primary" />
                        <h4 className="text-sm font-medium">自定义设置</h4>
                        <p className="text-xs text-muted-foreground">个性化配置，满足不同使用场景</p>
                      </div>
                    </div>
                    <Button 
                      className="w-full flex items-center justify-center gap-2" 
                      onClick={handleCreateConversation}
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                      开始对话
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {content}
      <Toaster position={isMobile ? "top-center" : "top-right"} />
      <AnnouncementDialog />
    </ThemeProvider>
  );
} 
