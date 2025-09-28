class GemmaChat {
    constructor() {
        this.clientId = 'user_' + Math.random().toString(36).substr(2, 9);
        this.ws = null;
        this.isConnected = false;
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(`ws://localhost:8000/ws/${this.clientId}`);
        
        this.ws.onopen = () => {
            this.isConnected = true;
            console.log('Connected to chat server');
            this.hideOllamaWarning();
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.ws.onclose = () => {
            this.isConnected = false;
            console.log('Disconnected from chat server');
            this.showOllamaWarning('Disconnected from server. Trying to reconnect...');
            setTimeout(() => this.connect(), 3000);
        };
    }
    
    handleMessage(data) {
        switch(data.type) {
            case 'message':
                this.hideTyping();
                this.addMessage(data.role, data.content);
                break;
            case 'typing':
                if (data.status) {
                    this.showTyping();
                }
                break;
            case 'history_cleared':
                this.clearMessages();
                this.addMessage('assistant', 'Hello! How can I help you?');
                break;
            case 'ollama_status':
                this.hideTyping();
                if (data.status === 'error') {
                    this.showOllamaWarning(data.message);
                    this.addStatusMessage(`Ollama Error: ${data.message}`);
                } else {
                    this.hideOllamaWarning();
                    this.addStatusMessage('✅ Ollama is running correctly!');
                }
                break;
        }
    }
    
    sendMessage(content) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({
                type: 'message',
                content: content
            }));
            this.addMessage('user', content);
            document.getElementById('messageInput').value = '';
        }
    }
    
    clearHistory() {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({
                type: 'clear_history'
            }));
        }
    }
    
    checkOllama() {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify({
                type: 'check_ollama'
            }));
            this.showTyping();
        }
    }
    
    addMessage(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        messageDiv.textContent = content;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    addStatusMessage(content) {
        const messagesContainer = document.getElementById('chatMessages');
        const statusDiv = document.createElement('div');
        statusDiv.className = 'status-message';
        statusDiv.textContent = content;
        messagesContainer.appendChild(statusDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showTyping() {
        document.getElementById('typingIndicator').style.display = 'block';
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    }
    
    hideTyping() {
        document.getElementById('typingIndicator').style.display = 'none';
    }
    
    showOllamaWarning(message) {
        const warning = document.getElementById('ollamaWarning');
        warning.textContent = message;
        warning.style.display = 'block';
    }
    
    hideOllamaWarning() {
        document.getElementById('ollamaWarning').style.display = 'none';
    }
    
    clearMessages() {
        document.getElementById('chatMessages').innerHTML = '';
    }
}

// Initialize chat
const chat = new GemmaChat();

function sendMessage(event) {
    event.preventDefault();
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (message) {
        chat.sendMessage(message);
    }
}

function clearHistory() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        chat.clearHistory();
    }
}

function checkOllama() {
    chat.checkOllama();
}

// Handle Enter key
document.getElementById('messageInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(e);
    }
});

// Focus input on load
document.getElementById('messageInput').focus();

// Check Ollama status on page load
window.addEventListener('load', function() {
    setTimeout(() => chat.checkOllama(), 1000);
});