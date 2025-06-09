from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.services.ia_client import generar_respuesta_con_ia

router = APIRouter()

@router.post("/responder")
def responder_pregunta(
    estudiante_id: int = Form(...),
    examen_id: int = Form(...),
    respuesta_texto: str = Form(...),
    enunciado: str = Form(...),
    tiempo_respuesta: int = Form(0),
    username: str = Form(None),
    password: str = Form(None),
    db: Session = Depends(get_db)
):
    # Genera el prompt para la IA
    prompt = (
        f"Pregunta: {enunciado}\n"
        f"Respuesta del estudiante: {respuesta_texto}\n"
        "Evalúa la respuesta y da una retroalimentación breve y constructiva."
    )
    retroalimentacion_ia = generar_respuesta_con_ia(prompt)

    # Puedes guardar la respuesta en la base de datos si lo deseas, usando solo los datos disponibles
    # O simplemente devolver la retroalimentación
    return {
        "retroalimentacion_ia": retroalimentacion_ia
    }
