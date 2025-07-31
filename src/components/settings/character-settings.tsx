import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Pencil, Trash2, Upload, User, Check, Search, RefreshCw } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from 'sonner';
import { CharacterCard } from '@/lib/types';
import Image from 'next/image';

export function CharacterSettings() {
  const { characters, createCharacter, updateCharacter, deleteCharacter, setCurrentCharacter, currentCharacterId, refreshCharacters } = useStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<CharacterCard | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleOpenCreate = () => {
    setEditingCharacter(null);
    setName('');
    setDescription('');
    setSystemPrompt('');
    setAvatar(undefined);
    setIsDialogOpen(true);
  };
  
  const handleOpenEdit = (character: CharacterCard) => {
    setEditingCharacter(character);
    setName(character.name);
    setDescription(character.description);
    setSystemPrompt(character.systemPrompt);
    setAvatar(character.avatar);
    setIsDialogOpen(true);
  };
  
  const handleSave = () => {
    if (!name || !systemPrompt) {
      toast.error('名称和系统提示词不能为空');
      return;
    }
    
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, {
        name,
        description,
        systemPrompt,
        avatar,
      });
      toast.success('角色已更新');
    } else {
      const id = createCharacter({
        name,
        description,
        systemPrompt,
        avatar,
      });
      setCurrentCharacter(id);
      toast.success('角色已创建');
    }
    
    setIsDialogOpen(false);
  };
  
  const confirmDelete = (id: string) => {
    setCharacterToDelete(id);
    setDeleteConfirmOpen(true);
  };
  
  const handleDelete = () => {
    if (characterToDelete) {
      deleteCharacter(characterToDelete);
      toast.success('角色已删除');
      setDeleteConfirmOpen(false);
      setCharacterToDelete(null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatar(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        processFile(file);
      } else {
        toast.error('请上传图片文件');
      }
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeAvatar = () => {
    setAvatar(undefined);
  };

  const handleSelectCharacter = (id: string) => {
    setCurrentCharacter(id);
    toast.success('已切换当前角色');
  };
  
  const filteredCharacters = characters.filter(character => 
    character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    character.systemPrompt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 监听角色更新事件
  useEffect(() => {
    const handleCharacterUpdate = () => {
      console.log('接收到角色更新事件，强制刷新组件');
      // 强制组件刷新
      setSearchQuery(prev => prev + ''); // 修改状态触发重新渲染
      setTimeout(() => setSearchQuery(prev => prev.trim()), 0); // 恢复状态
    };

    // 添加事件监听
    document.addEventListener('character-updated', handleCharacterUpdate);
    
    // 清理函数
    return () => {
      document.removeEventListener('character-updated', handleCharacterUpdate);
    };
  }, []);

  // 添加手动刷新函数
  const handleRefresh = () => {
    console.log('手动刷新角色卡列表');
    // 使用全局刷新函数
    refreshCharacters();
    toast.success('角色卡列表已刷新');
  };

  return (
    <div className="space-y-4 h-full flex flex-col p-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">角色卡列表</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="h-8 w-8 p-0"
            title="刷新列表"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenCreate}>
          <PlusCircle className="h-4 w-4 mr-2" />
          新建角色
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索角色卡..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="relative flex-1 min-h-[200px]">
        <div className="absolute inset-0 space-y-3 overflow-y-auto pr-1 pb-2">
          {filteredCharacters.length > 0 ? (
            filteredCharacters.map((character) => (
              <div 
                key={character.id} 
                className={`flex flex-col p-3 rounded-lg border min-h-[100px] ${character.id === currentCharacterId ? 'bg-accent border-primary shadow-md' : 'border-border'}`}
              >
                {/* 头像和信息区域 */}
                <div className="flex items-center">
                  {/* 头像 */}
                  <div className="h-10 w-10 rounded-full overflow-hidden bg-muted flex items-center justify-center border shadow-sm flex-shrink-0 mr-3">
                    {character.avatar ? (
                      <Image 
                        src={character.avatar} 
                        alt={character.name} 
                        width={40} 
                        height={40} 
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  {/* 信息 */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium flex items-center gap-1.5 truncate">
                      {character.name}
                      {character.id === currentCharacterId && (
                        <Check className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {character.description || '无描述'}
                    </div>
                  </div>
                </div>
                
                {/* 系统提示词预览 */}
                <div className="mt-2 text-xs text-muted-foreground line-clamp-2 px-1">
                  {character.systemPrompt}
                </div>
                
                {/* 操作按钮区域 - 全部在右侧 */}
                <div className="flex items-center justify-end gap-1 mt-auto pt-2">
                  {/* 选择按钮 */}
                  {character.id !== currentCharacterId && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => handleSelectCharacter(character.id)}
                    >
                      选择
                    </Button>
                  )}
                  
                  {/* 编辑按钮 - 只对非默认角色显示 */}
                  {!character.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleOpenEdit(character)}
                      title="编辑角色"
                    >
                      <Pencil className="h-3.5 w-3.5 text-foreground" />
                    </Button>
                  )}
                  
                  {/* 删除按钮 - 只对非默认且非当前选中角色显示 */}
                  {!character.isDefault && character.id !== currentCharacterId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 border-destructive/50 hover:border-destructive hover:bg-destructive/10"
                      onClick={() => confirmDelete(character.id)}
                      title="删除角色"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              未找到匹配的角色卡
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingCharacter ? '编辑角色' : '创建角色'}</DialogTitle>
            <DialogDescription>
              {editingCharacter 
                ? '修改角色信息和系统提示词' 
                : '创建新的角色卡，设置角色的系统提示词'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit">编辑</TabsTrigger>
              <TabsTrigger value="preview">预览</TabsTrigger>
            </TabsList>
            <TabsContent value="edit" className="space-y-4 py-4">
              <div className="flex flex-col items-center space-y-2">
                <div 
                  className={`h-24 w-24 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity ${isDragging ? 'ring-2 ring-primary' : ''}`}
                  onClick={triggerFileInput}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {avatar ? (
                    <Image 
                      src={avatar} 
                      alt="角色头像" 
                      width={96} 
                      height={96} 
                      className="object-cover h-full w-full"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                      <User className="h-8 w-8 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">点击或拖放</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button" 
                    onClick={triggerFileInput}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    上传头像
                  </Button>
                  {avatar && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      type="button" 
                      onClick={removeAvatar}
                    >
                      移除头像
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">角色名称</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  placeholder="输入角色名称"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">角色描述</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
                  placeholder="输入角色描述"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="system-prompt">系统提示词</Label>
                <Textarea
                  id="system-prompt"
                  value={systemPrompt}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSystemPrompt(e.target.value)}
                  placeholder="输入系统提示词，用于定义角色的行为和知识"
                  className="min-h-[120px]"
                />
              </div>
            </TabsContent>
            <TabsContent value="preview" className="py-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                    {avatar ? (
                      <Image 
                        src={avatar} 
                        alt={name || '角色头像'} 
                        width={48} 
                        height={48} 
                        className="object-cover h-full w-full"
                      />
                    ) : (
                      <User className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{name || '未命名角色'}</h3>
                    <p className="text-sm text-muted-foreground">{description || '无描述'}</p>
                  </div>
                </div>
                
                <div className="rounded-lg border p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">系统提示词预览</h4>
                  <div className="text-sm whitespace-pre-wrap">
                    {systemPrompt || '未设置系统提示词'}
                  </div>
                </div>
                
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-medium mb-2">角色行为示例</h4>
                  <div className="text-sm">
                    <p className="mb-2">用户: 你好，请介绍一下自己。</p>
                    <p className="pl-4 border-l-2 border-primary">
                      {name ? `我是${name}，${description || ''}` : '我是一个AI助手'}
                      {systemPrompt ? '。我会按照系统提示词的指导与你交流。' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              你确定要删除这个角色吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 