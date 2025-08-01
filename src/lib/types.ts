export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  reasoning_content?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterCard {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  avatar?: string;
  isDefault?: boolean;
}

export interface Settings {
  apiKey: string;
  apiEndpoint: string;
  defaultModel: string;
  globalSystemPrompt: string;
  theme: 'system' | 'light' | 'dark';
  showThinking: boolean;
}

export interface ApiResponse {
  id: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
      reasoning_content?: string;
    };
    finish_reason?: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    completion_tokens_details?: {
      reasoning_tokens: number;
    };
  };
}

export type Model = '酒馆-Flash' | '酒馆-Flash-NoThinking'; 
