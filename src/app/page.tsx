import { Metadata } from 'next';
import ChatLayout from '../components/chat/chat-layout';

export const metadata: Metadata = {
  title: 'Unlimited AI 聊天',
  description: '一个简洁高效的AI聊天应用',
};

export default function Home() {
  return <ChatLayout />;
}
