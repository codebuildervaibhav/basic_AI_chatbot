import React from 'react';

interface HeaderProps {
  isConnected: boolean;
  isGenerating: boolean;
  onStop: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, isGenerating, onStop }) => {
  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 shadow-md">
      <h1 className="text-2xl font-bold text-blue-400">AI Chatbot</h1>
      <div className="flex items-center space-x-4">
        <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
          Ollama {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {isGenerating && (
          <button
            onClick={onStop}
            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          >
            Stop
          </button>
        )}
      </div>
    </header>
  );
};