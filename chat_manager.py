from langchain_community.llms import Ollama
from langchain_ollama import OllamaLLM 

from langchain.schema import HumanMessage, AIMessage
from langchain.memory import ConversationBufferMemory 
import os

class GemmaChatManager:
    def __init__(self):
        self.llm = OllamaLLM(
            model="gemma3:1b",  # or "gemma:7b" depending on what you have
            base_url="http://localhost:11434",
            temperature=0.7
        )
        self.memory = ConversationBufferMemory(return_messages=True)
        self.conversation_history = []
    
    def send_message(self, message: str) -> str:
        """Send message to Gemma and get response"""
        try:
            # Add user message to history
            self.conversation_history.append({"role": "user", "content": message})
            
            # Prepare messages with history (keep last 6 exchanges)
            context_messages = self.conversation_history[-6:]
            prompt = self._build_prompt(context_messages)
            
            # Get response from Gemma
            response = self.llm.invoke(prompt)
            
            # Add assistant response to history
            self.conversation_history.append({"role": "assistant", "content": response})
            
            return response
            
        except Exception as e:
            error_msg = f"Error: {str(e)}. Please make sure Ollama is running and the Gemma model is installed."
            return error_msg
    
    def _build_prompt(self, messages: list) -> str:
        """Build prompt from conversation history"""
        prompt = ""
        for msg in messages:
            if msg["role"] == "user":
                prompt += f"User: {msg['content']}\n\n"
            else:
                prompt += f"Assistant: {msg['content']}\n\n"
        prompt += "Assistant: "
        return prompt
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        return "Conversation history cleared!"

# Simple version without memory
class SimpleGemmaChat:
    def __init__(self):
        self.llm = Ollama(
            model="gemma3:1b",
            base_url="http://localhost:11434",
            temperature=0.7
        )
    
    def send_message(self, message: str) -> str:
        """Send single message to Gemma"""
        try:
            response = self.llm.invoke(message)
            return response
        except Exception as e:
            return f"Error: {str(e)}. Is Ollama running? Run 'ollama serve' first."