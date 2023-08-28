from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import List

app = FastAPI()


class Rizzagge(BaseModel):
    user: str
    content: str
    date: str


rizzagges = []


@app.get("/rizzagges/")
def get_rizzagges():
    return rizzagges


@app.post("/rizzagge/")
def add_rizzagge(rizzagge: Rizzagge):
    rizzagges.append(rizzagge.dict())
    return rizzagge


# This will store active WebSocket clients
active_websockets: List[WebSocket] = []


@app.websocket("/ws/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.append(websocket)
    try:
        while True:
            # This will now expect a JSON formatted message from the client
            data = await websocket.receive_text()

            # Since we're receiving a JSON string, we don't need to wrap it in another string.
            # We'll just forward this data to all connected WebSocket clients.
            for client in active_websockets:
                if client != websocket:  # Don't echo back to the sender
                    await client.send_text(data)

    except WebSocketDisconnect:
        # Handle disconnects gracefully by removing the disconnected client from our list
        active_websockets.remove(websocket)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://192.168.0.108:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
