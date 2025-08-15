from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class Mensaje(BaseModel):
    mensaje: str

@app.post("/generate")
async def generar_respuesta(data: Mensaje):
    texto = data.mensaje
    # Simulación de respuesta LLM
    respuesta = f"Recibí tu mensaje: {texto} 🤖"
    return {"respuesta": respuesta}
