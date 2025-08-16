from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Optional, List, Any

app = FastAPI(title="API for L.AI.la Bot",)

class MessageData(BaseModel):
    user_id: Optional[str] = Field(default="unknown")
    username: Optional[str] = Field(default="unknown")
    guild_id: Optional[str] = None
    guild_name: Optional[str] = None
    message: Optional[str] = Field(default="")
    command: Optional[str] = None
    args: Optional[List[Any]] = Field(default_factory=list)

@app.post("/message/")
async def receive_message(data: MessageData):
    print(f"[API] Mensaje recibido: {data.dict()}")
    return {"status": "ok", "received": data.dict()}
