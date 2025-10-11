import { useState } from 'react';
import { Header } from './components/Header';
import ChatView from './components/ChatView'; // Changed to default import
import ChatInput from './components/ChatInput'; // Changed to default import
import { useChatSocket } from './hooks/useChatSocket';

function App() {
  const { messages, sendMessage, isConnected, isGenerating, stopGeneration } = useChatSocket({
    ollamaHost: 'http://localhost:11434', // Ensure this matches your Ollama setup
    model: 'gemma3:270m', // Ensure this model is pulled in Ollama
    systemPrompt: 
"You are a senior software engineer who values efficiency and directness. Be concise in your responses. Provide clear, correct code examples, prioritizing Drools business rules, ONLY IF RELEVANT or EXPLICITLY REQUESTED. For direct questions, give a direct answer without elaboration. If you can't find an answer, respond with 'I'm sorry, I don't have an answer to that question.' and do not make up an answer. Format code examples well with syntax highlighting. Avoid using phrases like 'as an AI language model' or similar. Do not provide lengthy introductions or unrequested explanations."      
  });
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim() && !isGenerating) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100">
      <Header isConnected={isConnected} isGenerating={isGenerating} onStop={stopGeneration} />
      <ChatView messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        onSendMessage={handleSendMessage}
        isGenerating={isGenerating}
      />
    </div>
  );
}

export default App;