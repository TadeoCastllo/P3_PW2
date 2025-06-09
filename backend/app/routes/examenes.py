from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.question import Examen, Pregunta
from app.models.user import Usuario
from app.schemas.schemas import ExamenCreate, ExamenOut, PreguntaOut
from app.services.ia_client import generar_respuesta_con_ia
import json

router = APIRouter(prefix="/examenes", tags=["Examenes"])

@router.post("/", response_model=ExamenOut)
def crear_examen(examen: ExamenCreate, db: Session = Depends(get_db)):
    profesor = db.query(Usuario).filter(Usuario.id == examen.profesor_id, Usuario.rol == "profesor").first()
    if not profesor:
        raise HTTPException(status_code=404, detail="Profesor no encontrado")

    nuevo_examen = Examen(**examen.dict())
    db.add(nuevo_examen)
    db.commit()
    db.refresh(nuevo_examen)
    return nuevo_examen

@router.get("/", response_model=list[ExamenOut])
def listar_examenes(db: Session = Depends(get_db)):
    return db.query(Examen).all()

@router.get("/{examen_id}", response_model=ExamenOut)
def obtener_examen(examen_id: int, db: Session = Depends(get_db)):
    examen = db.query(Examen).filter(Examen.id == examen_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen no encontrado")
    return examen

@router.get("/{examen_id}/preguntas", response_model=list[PreguntaOut])
def obtener_preguntas_examen(examen_id: int, db: Session = Depends(get_db)):
    examen = db.query(Examen).filter(Examen.id == examen_id).first()
    if not examen:
        raise HTTPException(status_code=404, detail="Examen no encontrado")

    # Prompt para la IA
    prompt = (
        f"Genera 5 preguntas abiertas para un examen de programación básica sobre el tema: '{examen.titulo}'. "
        "Devuelve la respuesta en formato JSON como una lista de objetos, cada uno con el campo 'enunciado'. "
        "Ejemplo: [{\"enunciado\": \"¿Qué es una variable en programación?\"}, ...]"
    )
    respuesta_ia = generar_respuesta_con_ia(prompt)
    print("Respuesta IA:", respuesta_ia)  # <-- agrega esto

    try:
        preguntas = json.loads(respuesta_ia)
        # Validar que sea una lista de objetos con 'enunciado'
        if not isinstance(preguntas, list) or not all("enunciado" in p for p in preguntas):
            raise ValueError
    except Exception:
        raise HTTPException(status_code=500, detail="La IA no devolvió preguntas válidas.")

    # Convertir a formato PreguntaOut (puedes agregar más campos si tu esquema lo requiere)
    return [{"enunciado": p["enunciado"]} for p in preguntas]
