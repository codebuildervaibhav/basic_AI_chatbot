import React, { useEffect, useRef } from 'react';
import Message from './Message'; // Assuming Message is a default export
import { Message as ChatMessage } from '../hooks/useChatSocket'; // Import the Message interface

interface ChatViewProps {
  messages: ChatMessage[]; // Use the imported Message interface
}

const ChatView: React.FC<ChatViewProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-grow p-4 overflow-y-auto space-y-4">
      {messages.map((msg) => (
        <Message key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatView;