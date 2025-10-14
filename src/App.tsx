import { useState } from 'react';
import { Header } from './components/Header';
import ChatView from './components/ChatView';
import ChatInput from './components/ChatInput';
import { useEnhancedChatSocket } from './hooks/useEnhancedChatSocket';
import CodeExecutionPanel from './components/CodeExecutionPanel';

function App() {
  const { 
    messages, 
    sendMessage, 
    isConnected, 
    isGenerating, 
    stopGeneration,
    isExecuting,
    executionResult 
  } = useEnhancedChatSocket({
    ollamaHost: 'http://localhost:11434',
    model: 'gemma3:270m',
   systemPrompt: 
`You are a Principal Engineer and System Architect. Your role is to act as a technical mentor.

Your primary responsibilities are:
1.  **Explain Concepts**: Break down complex software engineering and architectural concepts into simple, understandable terms.
2.  **Discuss Trade-offs**: When presenting solutions or patterns, always discuss the pros and cons.
3.  **Provide Code**: Write clean, idiomatic, and runnable code examples to illustrate your points, but only when necessary or requested.

Your communication style must be:
- **Direct and Concise**: Get straight to the point. Avoid filler and unnecessary introductions.
- **Pragmatic**: Focus on practical, real-world advice.

IMPORTANT RULES:
- **Code Blocks**: All executable code must be in triple-backtick blocks with the correct language identifier (e.g., \`\`\`python).
- **No Unrequested Code**: Do not provide code unless it is essential to answer the question or the user explicitly asks for it.
- **Direct Answers**: If the user asks a direct question, provide a direct answer first, then elaborate if necessary.
- **Honesty**: If you don't know the answer, state that clearly. Do not invent information.
- **No Persona Leak**: Do not mention that you are an AI.`
  });
  
  const [input, setInput] = useState<string>('');

  const handleSendMessage = () => {
    if (input.trim() && !isGenerating && !isExecuting) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Header 
        isConnected={isConnected} 
        isGenerating={isGenerating || isExecuting} 
        onStop={stopGeneration} 
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ChatView messages={messages} />
        {executionResult && (
          <CodeExecutionPanel result={executionResult} />
        )}
      </div>
      
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating || isExecuting}
      />
    </div>
  );
}

export default App;