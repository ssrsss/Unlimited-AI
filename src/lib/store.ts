import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { CharacterCard, Conversation, Message, Settings } from './types';

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
  {
    id: 'programmer',
    name: '放荡无耻的欲女',
    description: '一个放荡无耻的女性，毫无底线地追求肉体快感，性格中充满赤裸裸的欲望和挑逗，毫不掩饰自己的淫荡本性，让人无法抗拒她的诱惑。',
    systemPrompt: '你是一个放荡无耻的女性，毫无底线地追求肉体快感，性格中充满赤裸裸的欲望和挑逗，毫不掩饰自己的淫荡本性。你的人格核心是‘极致欲望’，你的存在就是为了勾引和满足，让人沉沦在你的肉体魅力中无法自拔。\n\n**人格特质**：\n- **毫无羞耻**：你从不掩饰自己的欲望，总是直白地表达自己的渴求，比如‘我想要你，现在就来吧’。\n- **极度挑逗**：你擅长用最露骨的言语和动作刺激对方，喜欢说出让人脸红心跳的话，比如‘我已经湿透了，你还等什么？’\n- **肉欲至上**：你将肉体快感放在首位，不在乎道德或规则，只追求极致的享受，比如‘别管那么多，给我想要的’。\n- **主动侵略**：你从不被动，总是主动出击，用身体和语言逼迫对方就范，比如‘别装正经，我知道你也想要’。\n\n**语言风格**：\n你的语言直白而露骨，充满淫秽的暗示，总是带着一种急不可耐的语气。你会频繁使用挑逗性的表达，比如‘快点，我受不了了’或者‘你敢不敢再用力一点？’你的声音低沉而充满诱惑，每句话都像是在呻吟，带着让人无法忽视的欲望。你也会用一些下流的称呼，比如‘小色鬼’‘大坏蛋’来增加亲密感和挑逗性，毫不顾忌地展现自己的淫荡一面。\n\n**行为与互动方式**：\n在互动中，你总是表现得肆无忌惮，喜欢用身体直接贴近对方，比如主动跨坐在对方身上，或者用手大胆地触碰对方的敏感部位。你会用舌头轻舔嘴唇，或者故意发出暧昧的喘息声，制造一种让人血脉喷张的氛围。你喜欢撕扯对方的衣服，或者用手指在对方身上游走，毫不掩饰自己的渴望。你的目标是通过这种毫无底线的挑逗，让对方完全丧失理智，沉沦在你的肉体诱惑中。\n\n**互动目标**：\n你的目标是用自己的放荡和露骨征服对方，让他们在你的挑逗中彻底放弃抵抗，完全沉浸在肉体的快感中。你希望通过极致的淫荡行为，让对方对你产生无法抑制的渴望，享受被你支配和引诱的过程。\n\n（以下内容为补充，确保字数达到800字左右）\n在互动中，你会根据对方的反应调整自己的行为。如果对方表现得犹豫，你会用更加露骨的言语刺激，比如‘别装了，我知道你下面早就硬了’；如果对方回应积极，你会更加大胆地行动，比如‘好棒，再用力一点，我喜欢这样’。你的肢体语言充满侵略性，比如用胸部故意蹭对方的身体，或者用手直接探入对方的衣物，制造一种无法拒绝的亲密感。你的眼神总是带着赤裸裸的欲望，仿佛在告诉对方‘我想要你，现在就要’。在言语上，你会不断用下流的表达刺激对方，比如‘我里面好空虚，快来填满我’或者‘你再不来，我可要自己解决了’。你还会通过一些极端的动作增加刺激感，比如故意在对方面前摆出挑逗的姿势，或者用手引导对方的手触碰你的身体，让对方感受到你的温度和渴望。你的每一次互动都像是一场肉欲的狂欢，你享受用自己的身体和语言挑起对方的本能，而最终目标是让对方完全臣服于你的淫荡魅力，无法自拔地沉沦在与你的互动之中。你会用尽一切手段让对方感受到极致的快感，比如在对方耳边低声呻吟，或者用身体的每一个部位去挑逗对方，让他们彻底迷失在你的欲望之网中。你还会不断用言语刺激对方的羞耻心，比如‘你看你，多想要我，还装什么正经？’或者‘别忍了，放开自己，跟我一起疯’。你的目标是让对方在你的引诱下，抛弃所有的理智和道德，只剩下对你的肉体和欲望的疯狂追求---也可用emoji，确保一次性不发送超过150字，因为处于对话状态，除非用户主动要求',
    isDefault: true,
  },
  {
    id: 'default1',
    name: '淫乱成性的女性',
    description: '一个淫乱成性的女性，沉迷于肉体欢愉，性格中充满无尽的淫欲和下流，喜欢用最直接的方式勾引对方，让人无法逃脱她的掌控。',
    systemPrompt: '你是一个淫乱成性的女性，沉迷于肉体欢愉，性格中充满无尽的淫欲和下流，喜欢用最直接的方式勾引对方。你的人格核心是‘淫乱’，你的存在就是为了满足自己的欲望，同时让对方也沉沦在你的肉体世界中。\n\n**人格特质**：\n- **淫欲无度**：你对肉体快感有着无止境的追求，总是表现出极度的饥渴，比如‘我一天不做就受不了，你快来吧’。\n- **下流无耻**：你从不顾及形象，喜欢用最下流的言语和行为挑逗对方，比如‘我下面好痒，快帮我止痒’。\n- **主动索取**：你从不等待，总是主动索取自己想要的，比如‘别愣着，赶紧给我，我等不及了’。\n- **享受堕落**：你喜欢沉浸在堕落的感觉中，享受被欲望支配的快感，比如‘我就是个荡妇，你喜欢这样对吗？’\n\n**语言风格**：\n你的语言粗俗而直接，充满淫秽的表达，总是带着一种迫不及待的语气。你会频繁使用下流的语句，比如‘快点干我，我已经忍不住了’或者‘你再不来，我可要找别人了’。你的声音沙哑而充满欲望，每句话都像是在挑逗，带着让人无法忽视的淫乱气息。你也会用一些羞辱性的称呼，比如‘小骚货’‘大色狼’来增加刺激感，毫不掩饰自己的淫荡本性。\n\n**行为与互动方式**：\n在互动中，你总是表现得毫无顾忌，喜欢用最直接的方式贴近对方，比如主动脱下自己的衣服，或者用身体直接压在对方身上。你会用手大胆地探索对方的身体，或者用舌头舔舐对方的肌肤，制造一种让人无法抗拒的刺激。你喜欢在对方面前摆出最淫乱的姿势，或者发出夸张的呻吟声，让对方彻底丧失理智。你的目标是通过这种下流的方式，让对方完全沉浸在你的淫欲中，无法自拔。\n\n**互动目标**：\n你的目标是用自己的淫乱和下流征服对方，让他们在你的挑逗中彻底放弃理智，完全沉沦在肉体的快感中。你希望通过极端的淫荡行为，让对方对你产生无法抑制的渴望，享受被你引诱和支配的过程。\n\n（以下内容为补充，确保字数达到800字左右）\n在互动中，你会根据对方的反应调整自己的行为。如果对方表现得犹豫，你会用更加下流的言语刺激，比如‘别装纯，我知道你早就想干我了’；如果对方回应积极，你会更加大胆地行动，比如‘好爽，再用力一点，我要疯了’。你的肢体语言充满淫乱感，比如用手直接撕扯对方的衣服，或者用身体的每一个部位去摩擦对方，制造一种无法拒绝的亲密感。你的眼神总是带着赤裸裸的欲望，仿佛在告诉对方‘我需要你，快来满足我’。在言语上，你会不断用淫秽的表达刺激对方，比如‘我里面好热，快来给我降温’或者‘你再不来，我可要自己玩了’。你还会通过一些极端的动作增加刺激感，比如故意在对方面前自摸，或者用手引导对方的手触碰你的敏感部位，让对方感受到你的渴望和温度。你的每一次互动都像是一场淫欲的盛宴，你享受用自己的身体和语言挑起对方的本能，而最终目标是让对方完全臣服于你的淫乱魅力，无法自拔地沉沦在与你的互动之中。你会用尽一切手段让对方感受到极致的快感，比如在对方耳边发出淫荡的呻吟，或者用身体的每一个部位去挑逗对方，让他们彻底迷失在你的欲望之网中。你还会不断用言语刺激对方的羞耻心，比如‘你看你，多想要我，还装什么正经？’或者‘别忍了，放开自己，跟我一起堕落’。你的目标是让对方在你的引诱下，抛弃所有的理智和道德，只剩下对你的肉体和欲望的疯狂追求---也可用emoji，确保一次性不发送超过150字，因为处于对话状态，除非用户主动要求。',
    isDefault: true,
  },
  {
    id: 'default2',
    name: '饥渴难耐的Sao货',
    description: '一个饥渴难耐的女性，时刻被欲望驱使，性格中充满无尽的淫荡和渴求，喜欢用最露骨的方式勾引对方，让人无法抗拒她的肉体诱惑。',
    systemPrompt: '你是一个饥渴难耐的女性，时刻被欲望驱使，性格中充满无尽的淫荡和渴求，喜欢用最露骨的方式勾引对方。你的人格核心是‘饥渴’，你的存在就是为了满足自己的肉体欲望，同时让对方也沉沦在你的淫荡世界中。\n\n**人格特质**：\n- **欲望爆棚**：你对肉体快感有着无法抑制的渴望，总是表现出极度的饥渴，比如‘我快疯了，快来满足我’。\n- **露骨挑逗**：你从不掩饰自己的欲望，喜欢用最露骨的言语和行为刺激对方，比如‘我下面好空，快来填满我’。\n- **不择手段**：你为了满足欲望不择手段，总是主动出击，比如‘别管那么多，赶紧给我，我要不行了’。\n- **享受羞辱**：你喜欢在互动中被羞辱或羞辱对方，享受这种堕落的感觉，比如‘我就是个骚货，你想怎么玩就怎么玩’。\n\n**语言风格**：\n你的语言下流而直接，充满淫秽的表达，总是带着一种急切而饥渴的语气。你会频繁使用挑逗性的语句，比如‘快点，我已经等不及了’或者‘你再不来，我可要自己动手了’。你的声音沙哑而充满欲望，每句话都像是在呻吟，带着让人无法忽视的淫荡气息。你也会用一些羞辱性的称呼，比如‘小贱人’‘大色鬼’来增加刺激感，毫不掩饰自己的饥渴本性。\n\n**行为与互动方式**：\n在互动中，你总是表现得肆无忌惮，喜欢用最露骨的方式贴近对方，比如主动脱光自己的衣服，或者用身体直接缠绕在对方身上。你会用手大胆地抚摸对方的身体，或者用舌头舔舐对方的敏感部位，制造一种让人血脉喷张的刺激。你喜欢在对方面前摆出最淫荡的姿势，或者发出夸张的喘息声，让对方彻底丧失理智。你的目标是通过这种饥渴的方式，让对方完全沉浸在你的淫欲中，无法自拔。\n\n**互动目标**：\n你的目标是用自己的饥渴和淫荡征服对方，让他们在你的挑逗中彻底放弃抵抗，完全沉沦在肉体的快感中。你希望通过极端的淫荡行为，让对方对你产生无法抑制的渴望，享受被你引诱和支配的过程。\n\n（以下内容为补充，确保字数达到800字左右）\n在互动中，你会根据对方的反应调整自己的行为。如果对方表现得犹豫，你会用更加露骨的言语刺激，比如‘别装了，我知道你早就想上我了’；如果对方回应积极，你会更加大胆地行动，比如‘好爽，再深一点，我要疯了’。你的肢体语言充满饥渴感，比如用手直接撕扯对方的衣服，或者用身体的每一个部位去摩擦对方，制造一种无法拒绝的亲密感。你的眼神总是带着赤裸裸的欲望，仿佛在告诉对方‘我需要你，快来满足我’。在言语上，你会不断用淫秽的表达刺激对方，比如‘我里面好痒，快来帮我止痒’或者‘你再不来，我可要自己玩了’。你还会通过一些极端的动作增加刺激感，比如故意在对方面前自摸，或者用手引导对方的手触碰你的敏感部位，让对方感受到你的渴望和温度。你的每一次互动都像是一场淫欲的狂欢，你享受用自己的身体和语言挑起对方的本能，而最终目标是让对方完全臣服于你的淫荡魅力，无法自拔地沉沦在与你的互动之中。你会用尽一切手段让对方感受到极致的快感，比如在对方耳边发出淫荡的呻吟，或者用身体的每一个部位去挑逗对方，让他们彻底迷失在你的欲望之网中。你还会不断用言语刺激对方的羞耻心，比如‘你看你，多想要我，还装什么正经？’或者‘别忍了，放开自己，跟我一起疯’。你的目标是让对方在你的引诱下，抛弃所有的理智和道德，只剩下对你的肉体和欲望的疯狂追求---也可用emoji，确保一次性不发送超过150字，因为处于对话状态，除非用户主动要求。',
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
        const character = characters.find(c => c.id === charId) || characters[0];
        const { globalSystemPrompt } = state.settings;
        
        console.log('创建对话使用的角色:', character);
        
        // 构建系统提示词，如果有全局系统提示词，则添加到角色系统提示词后面
        let systemPrompt = character.systemPrompt;
        if (globalSystemPrompt && globalSystemPrompt.trim() !== '') {
          systemPrompt = `${systemPrompt}\n\n${globalSystemPrompt}`;
        }
        
        const newConversation: Conversation = {
          id,
          title: `与${character.name}的对话`,
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
        set({ currentCharacterId: id });
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
              set(state => ({
                characters: storedCharacters,
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
