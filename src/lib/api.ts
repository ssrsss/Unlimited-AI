import { Message, Model } from '@/lib/types';

export async function streamChat({
  messages,
  model,
  apiKey,
  apiEndpoint,
  onUpdate,
  onFinish,
  onError,
}: {
  messages: Message[];
  model: Model;
  apiKey: string;
  apiEndpoint: string;
  onUpdate: (content: string, reasoning?: string) => void;
  onFinish: () => void;
  onError: (error: Error) => void;
}) {
  try {
    console.log('开始流式请求:', { model, endpoint: apiEndpoint });
    
    // 准备请求体，添加stream参数
    const requestBody = {
      model,
      messages: messages.map(({ role, content }) => ({ role, content })),
      stream: true,
    };

    console.log('请求体:', JSON.stringify(requestBody));

    // 使用fetch API的原生流处理
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream', // 明确指定接受SSE格式
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API响应错误:', response.status, errorText);
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    console.log('API响应成功, 开始处理流');

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 创建一个可读流
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    // 使用更高效的流处理方式
    let buffer = ''; // 修复：声明buffer变量
    
    // 存储累积的内容，减少更新频率
    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let lastUpdateTime = Date.now();
    
    // 流式读取响应
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log('流读取完成');
        // 确保处理缓冲区中的最后一行
        if (buffer.trim()) {
          await processBuffer(buffer);
        }
        // 发送任何剩余的累积内容
        sendAccumulatedContent();
        break;
      }
      
      // 解码新收到的数据块
      const chunk = decoder.decode(value, { stream: true });
      console.log('收到数据块:', chunk);
      buffer += chunk;
      
      // 立即处理每个数据块，不等待
      await processBuffer(buffer);
      buffer = ''; // 处理完后清空缓冲区
    }

    // 处理缓冲区中的所有行
    async function processBuffer(text: string) {
      if (!text.trim()) return;
      
      console.log('处理缓冲区:', text);
      // 按行分割，处理每一行SSE数据
      const lines = text.split('\n');
      
      for (const line of lines) {
        if (line.trim()) {
          await processLine(line.trim());
        }
      }
      
      // 每次处理完缓冲区后，检查是否应该发送累积的内容
      const now = Date.now();
      if (now - lastUpdateTime > 100) {
        sendAccumulatedContent();
      }
    }

    // 将累积的内容发送给UI，减少状态更新频率
    function sendAccumulatedContent() {
      if (accumulatedContent || accumulatedReasoning) {
        console.log('发送累积内容:', { content: accumulatedContent, reasoning: accumulatedReasoning });
        if (accumulatedContent) {
          onUpdate(accumulatedContent, undefined);
          accumulatedContent = '';
        }
        if (accumulatedReasoning) {
          onUpdate('', accumulatedReasoning);
          accumulatedReasoning = '';
        }
        lastUpdateTime = Date.now();
      }
    }
    
    // 处理单行数据的函数
    async function processLine(line: string) {
      // 检查是否是SSE格式的数据行
      if (!line.startsWith('data:')) return;
      
      const data = line.slice(5).trim(); // 移除 'data:' 前缀并去除空白
      
      if (data === '[DONE]') {
        console.log('收到[DONE]信号');
        // 确保发送最后的累积内容
        sendAccumulatedContent();
        return;
      }
      
      try {
        // 增强JSON解析错误处理
        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (parseError) {
          console.error('JSON解析失败:', parseError, '原始数据:', data);
          // 尝试修复常见的JSON问题
          const fixedData = fixJsonData(data);
          if (fixedData) {
            try {
              jsonData = JSON.parse(fixedData);
              console.log('修复后成功解析JSON');
            } catch (secondError) {
              console.error('修复后仍无法解析JSON:', secondError);
              return; // 跳过此行数据
            }
          } else {
            return; // 跳过此行数据
          }
        }
        
        console.log('解析的JSON数据:', jsonData);
        
        // 检查是否有choices
        if (jsonData.choices && jsonData.choices.length > 0) {
          const { delta } = jsonData.choices[0];
          console.log('delta数据:', delta);
          
          // 确保delta存在
          if (!delta) {
            console.warn('delta数据不存在');
            return;
          }
          
          let contentUpdated = false;
          
          // 处理content - 累积内容而不是直接发送
          if (delta.content !== null && delta.content !== undefined) {
            console.log('累积content片段:', delta.content);
            accumulatedContent += delta.content;
            contentUpdated = true;
          }
          
          // 处理reasoning_content - 累积内容而不是直接发送
          if (delta.reasoning_content !== null && delta.reasoning_content !== undefined) {
            console.log('累积reasoning_content片段:', delta.reasoning_content);
            accumulatedReasoning += delta.reasoning_content;
            contentUpdated = true;
          }
          
          // 如果没有content和reasoning_content，但有role，可能是初始消息或结束消息
          if (!contentUpdated && delta.role) {
            console.log('收到角色信息:', delta.role);
            // 不触发更新
          }
          
          // 处理finish_reason
          if (jsonData.choices[0].finish_reason === 'stop') {
            console.log('收到finish_reason=stop信号');
            // 确保发送所有累积的内容
            sendAccumulatedContent();
          }
        }
      } catch (error) {
        console.error('解析事件数据失败:', error, line);
      }
    }
    
    // 尝试修复常见的JSON问题
    function fixJsonData(data: string): string | null {
      try {
        // 处理未终止的字符串
        if (data.includes('"') && !data.endsWith('}')) {
          // 尝试找到最后一个完整的JSON对象
          const lastBrace = data.lastIndexOf('}');
          if (lastBrace > 0) {
            return data.substring(0, lastBrace + 1);
          }
        }
        return null;
      } catch (e) {
        console.error('修复JSON数据失败:', e);
        return null;
      }
    }
    
    // 流处理完成后，最后才调用onFinish
    console.log('流处理完成');
    // 延迟一点调用onFinish，确保所有状态更新都已完成
    setTimeout(() => {
      onFinish();
    }, 500); // 增加延迟时间
  } catch (error) {
    console.error('流处理出错:', error);
    if (error instanceof Error) {
      onError(error);
    } else {
      onError(new Error('未知错误'));
    }
  }
} 
