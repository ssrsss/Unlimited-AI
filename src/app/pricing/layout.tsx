import ChatLayout from '@/components/chat/chat-layout';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChatLayout>
      <div className="flex flex-col min-h-screen">
        <div className="container max-w-5xl">
          <div className="hidden md:flex items-center justify-start py-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-1">
                <ArrowLeft className="h-4 w-4" />
                <span>返回聊天</span>
              </Button>
            </Link>
          </div>
        </div>
        {children}
      </div>
    </ChatLayout>
  );
} 