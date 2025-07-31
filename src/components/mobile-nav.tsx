'use client';

import { MessageSquare, Settings, List, Tag } from 'lucide-react';
import { useStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function MobileNav({ activeTab, setActiveTab }: MobileNavProps) {
  const pathname = usePathname();
  const isPricingPage = pathname === '/pricing';
  
  // 如果在价格页面，返回聊天页面的链接
  if (isPricingPage) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-12 flex items-center justify-around z-50">
        <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-primary">
          <MessageSquare className="h-4 w-4 mb-0.5" />
          <span className="text-[10px]">返回聊天</span>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-12 flex items-center justify-around z-50">
      <button
        onClick={() => setActiveTab('chat')}
        className={cn(
          'flex flex-col items-center justify-center w-16 h-full',
          activeTab === 'chat' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <MessageSquare className="h-4 w-4 mb-0.5" />
        <span className="text-[10px]">聊天</span>
      </button>
      
      <button
        onClick={() => setActiveTab('conversations')}
        className={cn(
          'flex flex-col items-center justify-center w-16 h-full',
          activeTab === 'conversations' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <List className="h-4 w-4 mb-0.5" />
        <span className="text-[10px]">对话</span>
      </button>
      
      <Link 
        href="/pricing" 
        className={cn(
          'flex flex-col items-center justify-center w-16 h-full',
          pathname === '/pricing' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <Tag className="h-4 w-4 mb-0.5" />
        <span className="text-[10px]">价格</span>
      </Link>
      
      <button
        onClick={() => setActiveTab('settings')}
        className={cn(
          'flex flex-col items-center justify-center w-16 h-full',
          activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        <Settings className="h-4 w-4 mb-0.5" />
        <span className="text-[10px]">设置</span>
      </button>
    </div>
  );
} 