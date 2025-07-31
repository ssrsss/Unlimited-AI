import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CharacterCard, Conversation, Message, Settings } from '@/lib/types';

interface State {
  conversations: Conversation[];
  currentConversationId: string | null;
  characters: CharacterCard[];
  currentCharacterId: string | null;
  settings: Settings;
  isLoading: boolean;
  
  // 会话相关操作
  createConversation: (characterId?: string) => string;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message, isUpdate?: boolean) => void;
  updateMessage: (conversationId: string, index: number, content: string) => void;
  
  // 角色卡相关操作
  createCharacter: (character: Omit<CharacterCard, 'id'>) => string;
  updateCharacter: (id: string, updates: Partial<CharacterCard>) => void;
  deleteCharacter: (id: string) => void;
  setCurrentCharacter: (id: string) => void;
  refreshCharacters: () => void; // 添加刷新角色卡的函数
  
  // 设置相关操作
  updateSettings: (updates: Partial<Settings>) => void;
  
  // UI状态
  setIsLoading: (isLoading: boolean) => void;
}

const DEFAULT_CHARACTERS: CharacterCard[] = [
  {
    id: 'default',
    name: '默认助手',
    description: '一个乐于助人的AI助手',
    systemPrompt: '你是一个乐于助人的AI助手，请尽可能地回答用户的问题。',
    isDefault: true,
  },
];

const DEFAULT_SETTINGS: Settings = {
  apiKey: 'sk-123456',
  apiEndpoint: 'https://grokyellow.96ai.top/v1/chat/completions',
  defaultModel: '酒馆-Flash',
  globalSystemPrompt: '',
  theme: 'system',
  showThinking: true,
};

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      characters: DEFAULT_CHARACTERS,
      currentCharacterId: 'default',
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      
      createConversation: (characterId) => {
        const id = uuidv4();
        
        // 每次创建对话时都重新获取角色数据，确保使用最新数据
        const state = get();
        const characters = state.characters;
        const charId = characterId || state.currentCharacterId || 'default';
        const character = characters.find(c => c.id === charId);
        
        // 如果找不到指定角色，尝试使用当前选择的角色，如果还是找不到，则使用第一个角色
        const selectedCharacter = character || 
                                characters.find(c => c.id === state.currentCharacterId) || 
                                characters[0];
        
        const { globalSystemPrompt } = state.settings;
        
        console.log('创建对话使用的角色:', selectedCharacter);
        
        // 构建系统提示词，如果有全局系统提示词，则添加到角色系统提示词后面
        let systemPrompt = selectedCharacter.systemPrompt;
        if (globalSystemPrompt && globalSystemPrompt.trim() !== '') {
          systemPrompt = `${systemPrompt}\n\n${globalSystemPrompt}`;
        }
        
        const newConversation: Conversation = {
          id,
          title: `与${selectedCharacter.name}的对话`,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log('创建新对话:', newConversation);
        
        // 使用同步方式更新状态，确保立即生效
        set(state => {
          const updatedConversations = [newConversation, ...state.conversations];
          console.log('更新后的对话列表:', updatedConversations);
          
          return {
            conversations: updatedConversations,
            currentConversationId: id,
          };
        });
        
        // 确保状态已更新
        const updatedState = get();
        console.log('创建对话后的状态:', {
          conversationsCount: updatedState.conversations.length,
          currentId: updatedState.currentConversationId,
        });
        
        // 确保对话已创建
        const createdConversation = updatedState.conversations.find(c => c.id === id);
        if (!createdConversation) {
          console.error('对话创建失败:', id);
        } else {
          console.log('对话创建成功:', createdConversation);
        }
        
        return id;
      },
      
      updateConversation: (id, updates) => {
        set(state => ({
          conversations: state.conversations.map(conv => 
            conv.id === id ? { ...conv, ...updates, updatedAt: new Date() } : conv
          ),
        }));
      },
      
      deleteConversation: (id) => {
        set(state => {
          const newConversations = state.conversations.filter(conv => conv.id !== id);
          const newCurrentId = state.currentConversationId === id 
            ? (newConversations[0]?.id || null) 
            : state.currentConversationId;
          
          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          };
        });
      },
      
      setCurrentConversation: (id) => {
        set({ currentConversationId: id });
      },
      
      addMessage: (conversationId, message, isUpdate = false) => {
        console.log('添加/更新消息:', { conversationId, message, isUpdate });
        
        set(state => {
          const conversations = state.conversations.map(conv => {
            if (conv.id === conversationId) {
              // 如果是更新，替换最后一条助手消息
              if (isUpdate && message.role === 'assistant') {
                console.log('更新助手消息');
                const messages = [...conv.messages];
                const lastAssistantIndex = [...messages].reverse().findIndex(m => m.role === 'assistant');
                
                if (lastAssistantIndex !== -1) {
                  const actualIndex = messages.length - 1 - lastAssistantIndex;
                  const lastMessage = messages[actualIndex];
                  console.log('找到助手消息索引:', actualIndex);
                  
                  // 更新内容或思考过程
                  const updatedMessage = { ...lastMessage };
                  
                  if (message.content !== undefined) {
                    console.log('更新内容:', message.content);
                    updatedMessage.content = message.content;
                  }
                  
                  if (message.reasoning_content !== undefined) {
                    console.log('更新推理内容:', message.reasoning_content);
                    updatedMessage.reasoning_content = message.reasoning_content;
                  }
                  
                  messages[actualIndex] = updatedMessage;
                  console.log('更新后的消息:', updatedMessage);
                  
                  return {
                    ...conv,
                    messages,
                    updatedAt: new Date(),
                  };
                } else {
                  console.log('未找到助手消息，添加新消息');
                  return {
                    ...conv,
                    messages: [...conv.messages, message],
                    updatedAt: new Date(),
                  };
                }
              }
              
              // 添加新消息
              console.log('添加新消息');
              return {
                ...conv,
                messages: [...conv.messages, message],
                updatedAt: new Date(),
              };
            }
            return conv;
          });
          
          return { conversations };
        });
      },
      
      updateMessage: (conversationId, index, content) => {
        set(state => ({
          conversations: state.conversations.map(conv => {
            if (conv.id === conversationId) {
              const messages = [...conv.messages];
              if (messages[index]) {
                messages[index] = { ...messages[index], content };
              }
              return { ...conv, messages, updatedAt: new Date() };
            }
            return conv;
          }),
        }));
      },
      
      createCharacter: (character) => {
        const id = uuidv4();
        set(state => ({
          characters: [...state.characters, { ...character, id }],
        }));
        return id;
      },
      
      updateCharacter: (id, updates) => {
        set(state => {
          console.log('更新角色卡:', id, updates);
          
          // 创建新的角色数组，以确保引用发生变化
          const updatedCharacters = state.characters.map(char => 
            char.id === id ? { ...char, ...updates } : char
          );
          
          // 强制组件刷新
          setTimeout(() => {
            // 通知应用状态已更改
            document.dispatchEvent(new CustomEvent('character-updated'));
            
            // 手动触发localStorage更新
            try {
              const currentState = useStore.getState();
              const stateToSave = {
                conversations: currentState.conversations,
                currentConversationId: currentState.currentConversationId,
                characters: currentState.characters,
                currentCharacterId: currentState.currentCharacterId,
                settings: currentState.settings,
              };
              localStorage.setItem('unlimited-ai-chat', JSON.stringify({ state: stateToSave }));
              console.log('手动更新localStorage成功');
            } catch (e) {
              console.error('手动更新localStorage失败:', e);
            }
          }, 0);
          
          // 返回新状态
          return {
            characters: updatedCharacters,
          };
        });
        
        // 强制状态更新
        const currentState = get();
        console.log('角色卡更新后的状态:', currentState.characters.find(c => c.id === id));
      },
      
      deleteCharacter: (id) => {
        set(state => {
          // 不允许删除默认角色
          const character = state.characters.find(c => c.id === id);
          if (character?.isDefault) return state;
          
          const newCharacters = state.characters.filter(char => char.id !== id);
          const newCurrentId = state.currentCharacterId === id 
            ? 'default'
            : state.currentCharacterId;
          
          return {
            characters: newCharacters,
            currentCharacterId: newCurrentId,
          };
        });
      },
      
      setCurrentCharacter: (id) => {
        const state = get();
        const currentCharacter = state.characters.find(c => c.id === id);
        const currentConversationId = state.currentConversationId;
        
        // 设置当前角色卡ID
        set({ currentCharacterId: id });
        
        // 如果有当前对话，立即更新其系统提示词
        if (currentConversationId && currentCharacter) {
          const currentConversation = state.conversations.find(c => c.id === currentConversationId);
          if (currentConversation) {
            console.log('切换角色卡，更新当前对话的系统提示词');
            
            // 构建系统提示词，如果有全局系统提示词，则添加到角色系统提示词后面
            let systemPrompt = currentCharacter.systemPrompt;
            if (state.settings.globalSystemPrompt && state.settings.globalSystemPrompt.trim() !== '') {
              systemPrompt = `${systemPrompt}\n\n${state.settings.globalSystemPrompt}`;
            }
            
            // 更新当前对话的系统提示词（第一条消息）
            const updatedMessages = [...currentConversation.messages];
            if (updatedMessages.length > 0 && updatedMessages[0].role === 'system') {
              updatedMessages[0] = {
                ...updatedMessages[0],
                content: systemPrompt
              };
              
              // 更新对话标题
              const updatedConversation = {
                ...currentConversation,
                title: `与${currentCharacter.name}的对话`,
                messages: updatedMessages,
                updatedAt: new Date()
              };
              
              // 更新对话
              set(state => ({
                conversations: state.conversations.map(conv => 
                  conv.id === currentConversationId ? updatedConversation : conv
                )
              }));
              
              console.log('已更新当前对话的系统提示词:', systemPrompt);
            }
          }
        }
      },
      
      refreshCharacters: () => {
        // 从localStorage读取角色卡数据
        try {
          const storedData = localStorage.getItem('unlimited-ai-chat');
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            const storedCharacters = parsedData.state?.characters;
            
            if (storedCharacters && Array.isArray(storedCharacters)) {
              console.log('从localStorage加载角色卡:', storedCharacters);
              
              // 分离用户自定义角色卡和系统内置角色卡
              const userCustomCharacters = storedCharacters.filter(char => !char.isDefault);
              
              // 合并默认角色卡和用户自定义角色卡
              const mergedCharacters = [...DEFAULT_CHARACTERS, ...userCustomCharacters];
              
              console.log('刷新后的角色卡列表:', mergedCharacters);
              
              set(state => ({
                characters: mergedCharacters,
              }));
            } else {
              // 如果没有找到有效的角色卡数据，使用默认角色卡
              console.log('未找到有效的角色卡数据，使用默认角色卡');
              set(state => ({
                characters: DEFAULT_CHARACTERS,
              }));
            }
          } else {
            // 如果没有找到localStorage数据，使用默认角色卡
            console.log('未找到localStorage数据，使用默认角色卡');
            set(state => ({
              characters: DEFAULT_CHARACTERS,
            }));
          }
          
          // 触发角色更新事件
          setTimeout(() => {
            document.dispatchEvent(new CustomEvent('character-updated'));
          }, 0);
        } catch (e) {
          console.error('刷新角色卡失败:', e);
        }
      },
      
      updateSettings: (updates) => {
        set(state => {
          // 确保设置更新后立即持久化
          const newSettings = { ...state.settings, ...updates };
          console.log('更新设置:', newSettings);
          return { settings: newSettings };
        });
      },
      
      setIsLoading: (isLoading) => {
        set({ isLoading });
      },
    }),
    {
      name: 'unlimited-ai-chat',
      // 明确指定需要持久化的状态字段
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        characters: state.characters,
        currentCharacterId: state.currentCharacterId,
        settings: state.settings,
      }),
      // 使用localStorage存储
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
          } catch (e) {
            console.error('从localStorage获取数据失败:', e);
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (e) {
            console.error('保存数据到localStorage失败:', e);
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (e) {
            console.error('从localStorage删除数据失败:', e);
          }
        },
      },
    }
  )
); 
