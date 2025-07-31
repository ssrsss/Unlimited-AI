import React from 'react';
import { Settings, User, Sliders, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { ApiSettings } from './api-settings';
import { CharacterSettings } from './character-settings';
import { PromptSettings } from './prompt-settings';

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">设置</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription>
            自定义AI聊天助手的设置和角色卡
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="api">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="api" className="flex items-center gap-1 text-xs">
              <Sliders className="h-3 w-3" />
              API
            </TabsTrigger>
            <TabsTrigger value="character" className="flex items-center gap-1 text-xs">
              <User className="h-3 w-3" />
              角色卡
            </TabsTrigger>
            <TabsTrigger value="prompt" className="flex items-center gap-1 text-xs">
              <FileText className="h-3 w-3" />
              提示词
            </TabsTrigger>
          </TabsList>
          <TabsContent value="api" className="space-y-4 py-4">
            <ApiSettings />
          </TabsContent>
          <TabsContent value="character" className="py-4">
            <CharacterSettings />
          </TabsContent>
          <TabsContent value="prompt" className="space-y-4 py-4">
            <PromptSettings />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 