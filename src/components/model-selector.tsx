'use client';

import React from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useStore } from '@/lib/store';
import { Model } from '@/lib/types';

const MODELS: { value: Model; label: string }[] = [
  { value: '酒馆-Flash', label: '酒馆-Flash' },
  { value: '酒馆-Flash-NoThinking', label: '酒馆-Flash-NoThinking' },
];

export function ModelSelector() {
  const { settings, updateSettings } = useStore();
  
  const currentModel = settings.defaultModel as Model;
  
  const handleSelectModel = (model: Model) => {
    updateSettings({ defaultModel: model });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs gap-1 px-2 rounded-md border border-border bg-muted/30 hover:bg-muted"
        >
          {currentModel}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={5} className="w-48">
        {MODELS.map((model) => (
          <DropdownMenuItem
            key={model.value}
            onClick={() => handleSelectModel(model.value)}
            className="flex items-center justify-between text-xs"
          >
            <span>{model.label}</span>
            {currentModel === model.value && <Check className="h-3 w-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 