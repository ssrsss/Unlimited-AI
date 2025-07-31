import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export function ThemeSettings() {
  const { settings, updateSettings } = useStore();
  const { setTheme } = useTheme();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | 'system'>(settings.theme);
  
  // 当store中的settings变化时，更新本地状态
  useEffect(() => {
    setCurrentTheme(settings.theme);
  }, [settings.theme]);
  
  // 当本地主题状态变化时，同步到next-themes
  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme, setTheme]);
  
  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setCurrentTheme(theme);
    
    // 更新store中的设置
    const updatedSettings = {
      ...settings,
      theme,
    };
    
    console.log('保存主题设置:', updatedSettings);
    updateSettings(updatedSettings);
    toast.success(`主题已切换为${theme === 'light' ? '亮色' : theme === 'dark' ? '暗色' : '自动'}`);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>主题设置</CardTitle>
          <CardDescription>
            选择您喜欢的界面主题
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={currentTheme === 'light' ? 'default' : 'outline'}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => handleThemeChange('light')}
            >
              <Sun className="h-4 w-4" />
              亮色
            </Button>
            <Button
              variant={currentTheme === 'dark' ? 'default' : 'outline'}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => handleThemeChange('dark')}
            >
              <Moon className="h-4 w-4" />
              暗色
            </Button>
            <Button
              variant={currentTheme === 'system' ? 'default' : 'outline'}
              className="flex-1 flex items-center justify-center gap-2"
              onClick={() => handleThemeChange('system')}
            >
              <Monitor className="h-4 w-4" />
              自动
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {currentTheme === 'system' ? '自动模式将根据您的系统设置自动切换主题' : ''}
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 