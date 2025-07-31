import React, { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function PromptSettings() {
  const { settings, updateSettings } = useStore();
  const [globalSystemPrompt, setGlobalSystemPrompt] = React.useState(settings.globalSystemPrompt || '');
  
  // 当store中的settings变化时，更新本地状态
  useEffect(() => {
    setGlobalSystemPrompt(settings.globalSystemPrompt || '');
  }, [settings]);
  
  const handleSave = () => {
    updateSettings({ globalSystemPrompt });
    toast.success('全局提示词设置已保存');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>全局系统提示词</CardTitle>
          <CardDescription>
            设置全局系统提示词，将应用于所有对话
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="global-system-prompt">全局系统提示词</Label>
            <Textarea
              id="global-system-prompt"
              value={globalSystemPrompt}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setGlobalSystemPrompt(e.target.value)}
              placeholder="输入全局系统提示词，将添加到每个对话的系统消息中"
              className="min-h-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              全局系统提示词将与角色的系统提示词合并使用，可用于添加一些通用的指令或知识。
            </p>
          </div>
          
          <Button onClick={handleSave} className="w-full">保存提示词设置</Button>
        </CardContent>
      </Card>
    </div>
  );
} 