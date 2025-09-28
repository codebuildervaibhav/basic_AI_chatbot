from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from chat_manager import SimpleGemmaChat, GemmaChatManager
import uvicorn
# In app.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles # <-- NEW IMPORT

# Assuming your app object is initialized here
app = FastAPI()

# Mount the static directory to the URL path /static
# This instructs the server to look inside the local folder named "static" 
# whenever the browser requests a URL starting with /static/.
app.mount("/static", StaticFiles(directory="static"), name="static")
app = FastAPI(title="Gemma Chatbot")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize chat manager - using the one with memory
chat_manager = GemmaChatManager()

# Store active conversations
conversations = {}

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    
    # Initialize conversation for this client
    if client_id not in conversations:
        conversations[client_id] = {"chat_manager": GemmaChatManager(), "history": []}
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data["type"] == "message":
                user_message = message_data["content"]
                
                # Add user message to conversation history
                conversations[client_id]["history"].append({
                    "role": "user",
                    "content": user_message
                })
                
                # Send typing indicator
                await websocket.send_text(json.dumps({
                    "type": "typing",
                    "status": True
                }))
                
                # Get response from Gemma
                client_chat_manager = conversations[client_id]["chat_manager"]
                bot_response = client_chat_manager.send_message(user_message)
                
                # Add bot response to history
                conversations[client_id]["history"].append({
                    "role": "assistant",
                    "content": bot_response
                })
                
                # Send response back to client
                await websocket.send_text(json.dumps({
                    "type": "message",
                    "role": "assistant",
                    "content": bot_response
                }))
                
            elif message_data["type"] == "clear_history":
                # Clear conversation history
                conversations[client_id]["chat_manager"].clear_history()
                conversations[client_id]["history"] = []
                
                await websocket.send_text(json.dumps({
                    "type": "history_cleared"
                }))
                
            elif message_data["type"] == "check_ollama":
                # Check if Ollama is running
                try:
                    test_response = conversations[client_id]["chat_manager"].send_message("Hello")
                    if "Error" in test_response:
                        await websocket.send_text(json.dumps({
                            "type": "ollama_status",
                            "status": "error",
                            "message": test_response
                        }))
                    else:
                        await websocket.send_text(json.dumps({
                            "type": "ollama_status",
                            "status": "running",
                            "message": "Ollama is running correctly"
                        }))
                except Exception as e:
                    await websocket.send_text(json.dumps({
                        "type": "ollama_status",
                        "status": "error",
                        "message": f"Ollama check failed: {str(e)}"
                    }))
                
    except WebSocketDisconnect:
        # Clean up on disconnect
        if client_id in conversations:
            del conversations[client_id]

# REST API endpoints
@app.post("/api/chat")
async def chat_endpoint(message: dict):
    try:
        user_message = message.get("content", "")
        bot_response = chat_manager.send_message(user_message)
        
        return {
            "success": True,
            "response": bot_response,
            "role": "assistant"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Check if Ollama is running"""
    try:
        test_response = chat_manager.send_message("Say 'OK' if you're working")
        return {
            "status": "healthy",
            "ollama_running": "Error" not in test_response,
            "test_response": test_response[:100] + "..." if len(test_response) > 100 else test_response
        }
    except Exception as e:
        return {
            "status": "error",
            "ollama_running": False,
            "error": str(e)
        }

@app.get("/api/history/{client_id}")
async def get_history(client_id: str):
    if client_id in conversations:
        return {"history": conversations[client_id]["history"]}
    else:
        return {"history": []}

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    print("Starting Gemma Chatbot...")
    print("Make sure Ollama is running with: ollama serve")
    print("And Gemma model is installed with: ollama pull gemma3:1b")
    uvicorn.run(app, host="0.0.0.0", port=8080, reload=True)