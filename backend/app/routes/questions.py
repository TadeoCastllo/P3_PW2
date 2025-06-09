from fastapi import APIRouter, Depends, Form
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.services.ia_client import generar_respuesta_con_ia
from app.models.question import Respuesta, Pregunta

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
    pregunta_id: int = Form(...),
    db: Session = Depends(get_db)
):
    prompt = (
        f"Pregunta: {enunciado}\n"
        f"Respuesta del estudiante: {respuesta_texto}\n"
        "Evalúa la respuesta y da una retroalimentación breve y constructiva. "
        "Además, asigna una calificación numérica del 0 al 10 en el campo 'calificacion'. "
        "Devuelve la respuesta en formato JSON así: "
        '{"retroalimentacion": "...", "calificacion": 7.5}'
    )
    respuesta_ia = generar_respuesta_con_ia(prompt)
    import json, re
    respuesta_ia = re.sub(r"^```json|^```|```$", "", respuesta_ia.strip(), flags=re.MULTILINE).strip()
    try:
        data = json.loads(respuesta_ia)
        retroalimentacion = data.get("retroalimentacion", "")
        calificacion = data.get("calificacion", None)
    except Exception:
        retroalimentacion = respuesta_ia
        calificacion = None

    # Guardar la respuesta en la base de datos
    nueva_respuesta = Respuesta(
        estudiante_id=estudiante_id,
        examen_id=examen_id,
        pregunta_id=pregunta_id,
        respuesta_texto=respuesta_texto,
        calificacion=calificacion,
        retroalimentacion_ia=retroalimentacion,  # <-- usa el nombre correcto
        tiempo_respuesta=tiempo_respuesta
    )
    db.add(nueva_respuesta)
    db.commit()
    db.refresh(nueva_respuesta)

    return {
        "retroalimentacion_ia": retroalimentacion,
        "calificacion": calificacion
    }
