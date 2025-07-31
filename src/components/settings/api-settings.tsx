import React, { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../ui/card';
import { Eye, EyeOff, Tag } from 'lucide-react';
import Link from 'next/link';

export function ApiSettings() {
  const { settings, updateSettings } = useStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [showPassword, setShowPassword] = useState(false);
  
  // 当store中的settings变化时，更新本地状态
  useEffect(() => {
    setApiKey(settings.apiKey);
  }, [settings]);
  
  const handleSave = () => {
    // 保留原有的其他设置
    const updatedSettings = {
      ...settings,  // 保留所有现有设置
      apiKey,       // 只更新API密钥
    };
    
    console.log('保存API设置:', updatedSettings);
    updateSettings(updatedSettings);
    toast.success('API密钥已保存');
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API 设置</CardTitle>
          <CardDescription>
            设置 API 密钥以连接到 AI 服务
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API密钥</Label>
            <div className="relative">
              <Input
                id="api-key"
                value={apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                placeholder="输入API密钥，默认为 sk-123456"
                type={showPassword ? "text" : "password"}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full">保存API密钥</Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Link href="/pricing">
            <Button variant="link" className="flex items-center gap-2 text-xs">
              <Tag className="h-3 w-3" />
              查看价格套餐与开通方式
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
} 