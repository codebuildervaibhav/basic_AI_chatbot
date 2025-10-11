import React, { Dispatch, SetStateAction } from 'react';

// Define the props interface for ChatInput
interface ChatInputProps {
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
  onSendMessage: () => void;
  isGenerating: boolean;
}

// Update the component to use the defined props
const ChatInput: React.FC<ChatInputProps> = ({ input, setInput, onSendMessage, isGenerating }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating) {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 bg-gray-800 border-t border-gray-700 flex items-center">
      <input
        type="text"
        className="flex-grow p-3 rounded-lg bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={isGenerating ? "Generating response..." : "Type your message..."}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isGenerating}
      />
      <button
        onClick={onSendMessage}
        disabled={!input.trim() || isGenerating}
        className="ml-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </div>
  );
};

export default ChatInput;