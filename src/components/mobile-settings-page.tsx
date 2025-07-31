'use client';

import { ArrowLeft, User, Sliders, FileText, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CharacterSettings } from '@/components/settings/character-settings';
import { ApiSettings } from '@/components/settings/api-settings';
import { PromptSettings } from '@/components/settings/prompt-settings';
import { ThemeSettings } from '@/components/settings/theme-settings';
import { useState } from 'react';

interface MobileSettingsPageProps {
  setActiveTab: (tab: string) => void;
}

export function MobileSettingsPage({ setActiveTab }: MobileSettingsPageProps) {
  const [activeSettingsTab, setActiveSettingsTab] = useState<string>("api");

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
        <h1 className="text-sm font-bold">设置</h1>
      </div>
      
      <div className="p-2 border-b border-border">
        <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api" className="flex items-center gap-1 text-xs">
              <Sliders className="h-3 w-3" />
              API
            </TabsTrigger>
            <TabsTrigger value="character" className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              角色
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
      
      <div className="flex-1 overflow-hidden pb-16">
        {activeSettingsTab === "api" && <ApiSettings />}
        {activeSettingsTab === "character" && <CharacterSettings />}
        {activeSettingsTab === "prompt" && <PromptSettings />}
        {activeSettingsTab === "theme" && <ThemeSettings />}
      </div>
    </div>
  );
} 