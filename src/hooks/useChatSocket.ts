// hooks/useChatSocket.ts
import { useState, useCallback, useEffect, useRef } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatOptions {
  ollamaHost?: string;
  model?: string;
  systemPrompt?: string;
}

interface UseChatSocketReturn {
  messages: Message[];
  sendMessage: (message: string) => Promise<void>;
  isConnected: boolean;
  isGenerating: boolean;
  stopGeneration: () => void;
}

export const useChatSocket = (options?: ChatOptions): UseChatSocketReturn => {
  const ollamaHost = options?.ollamaHost || 'http://localhost:11434';
  const model = options?.model || 'gemma3:270m';
  const defaultSystemPrompt = options?.systemPrompt || "You are a helpful AI assistant. Respond concisely and use markdown for formatting.";

  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check Ollama server status on mount
  useEffect(() => {
    const checkOllamaStatus = async (): Promise<void> => {
      try {
        const response = await fetch(`${ollamaHost}/api/tags`, { 
          signal: abortControllerRef.current?.signal 
        });
        if (response.ok) {
          setIsConnected(true);
          if (!messages.some(msg => msg.role === 'system')) {
            setMessages((prev) => [{ 
              id: 'system-init', 
              role: 'system', 
              content: defaultSystemPrompt 
            }, ...prev]);
          }
        } else {
          setIsConnected(false);
        }
      } catch (error) {
        console.error("Failed to connect to Ollama:", error);
        setIsConnected(false);
      }
    };
    
    checkOllamaStatus();
    const interval = setInterval(checkOllamaStatus, 5000);
    return () => clearInterval(interval);
  }, [ollamaHost, defaultSystemPrompt, messages]);

  const sendMessage = useCallback(async (userMessage: string): Promise<void> => {
    if (!isConnected || isGenerating) return;

    const newMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: userMessage 
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsGenerating(true);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const ollamaMessages = [
        { role: 'system' as const, content: defaultSystemPrompt },
        ...messages.filter(msg => msg.role !== 'system')
                  .map(msg => ({ role: msg.role, content: msg.content })),
        { role: 'user' as const, content: userMessage }
      ];

      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: ollamaMessages,
          stream: true,
        }),
        signal: signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      const assistantMessageId = Date.now().toString() + '-ai';

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: assistantMessageId, role: 'assistant', content: '' },
      ]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        chunk.split('\n').forEach((line) => {
          if (line.trim() === '') return;
          try {
            const data = JSON.parse(line);
            if (data.message?.content) {
              assistantResponse += data.message.content;
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === assistantMessageId ? { ...msg, content: assistantResponse } : msg
                )
              );
            }
          } catch (e) {
            console.error("Failed to parse JSON chunk:", e, line);
          }
        });
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Ollama request aborted.');
      } else {
        console.error('Error communicating with Ollama:', error);
        setMessages((prevMessages) => [
          ...prevMessages,
          { 
            id: Date.now().toString() + '-error', 
            role: 'assistant', 
            content: `Error: ${error.message}` 
          },
        ]);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [isConnected, isGenerating, ollamaHost, model, messages, defaultSystemPrompt]);

  const stopGeneration = useCallback((): void => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
    }
  }, []);

  return { 
    messages: messages.filter(msg => msg.role !== 'system'), 
    sendMessage, 
    isConnected, 
    isGenerating, 
    stopGeneration 
  };
};