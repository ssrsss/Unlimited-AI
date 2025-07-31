'use client';

import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function AnnouncementDialog() {
  const [open, setOpen] = useState(true);
  
  useEffect(() => {
    // 每次加载组件时都显示公告
    setOpen(true);
  }, []);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <span className="text-primary">📢 重要公告</span>
          </AlertDialogTitle>
          <div className="text-sm text-muted-foreground">
            <span className="block mb-2">为保障赞赏用户的请求算力，<span className="text-primary font-semibold">免费用户</span>请求非思考模型时将自动重定向到思考模型。</span>
            <span className="block text-xs">生效时间：2024年6月11日 23:59 🎉</span>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleClose} className="w-full">
            我知道了
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 