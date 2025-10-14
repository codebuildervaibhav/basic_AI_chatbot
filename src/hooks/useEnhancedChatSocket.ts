// hooks/useEnhancedChatSocket.ts
import { useCallback } from 'react';
import { useChatSocket, Message } from './useChatSocket';
import { useCodeExecution } from './useCodeExecution';
import { ExecutionResult } from '../types/code-execution';

interface UseEnhancedChatSocketOptions {
  ollamaHost?: string;
  model?: string;
  systemPrompt?: string;
}

interface UseEnhancedChatSocketReturn {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  isConnected: boolean;
  isGenerating: boolean;
  stopGeneration: () => void;
  isExecuting: boolean;
  executionResult: ExecutionResult | null;
}

export const useEnhancedChatSocket = (options?: UseEnhancedChatSocketOptions): UseEnhancedChatSocketReturn => {
  const chatSocket = useChatSocket(options);
  const { executeCode, isExecuting, executionResult } = useCodeExecution();
  
  const { messages, sendMessage, isGenerating } = chatSocket;

  const enhancedSendMessage = useCallback(async (message: string): Promise<void> => {
    // Check if message contains code execution request
    const codeMatch = message.match(/```(?:java)?\s*([\s\S]*?)```/);
    
    if (codeMatch && codeMatch[1]) {
      const code = codeMatch[1].trim();
      
      // Send user message first
      await sendMessage(`Executing code...\n\`\`\`java\n${code}\n\`\`\``);
      
      // Execute the code
      const result = await executeCode(code);
      
      // Send execution result
      if (result.success) {
        await sendMessage(`✅ Execution successful (${result.executionTime}ms):\n\`\`\`\n${result.output}\n\`\`\``);
      } else {
        await sendMessage(`❌ Execution failed:\n\`\`\`\n${result.error}\n\`\`\``);
      }
    } else {
      // Regular message handling
      await sendMessage(message);
    }
  }, [sendMessage, executeCode]);

  return {
    ...chatSocket,
    sendMessage: enhancedSendMessage,
    isExecuting,
    executionResult
  };
};