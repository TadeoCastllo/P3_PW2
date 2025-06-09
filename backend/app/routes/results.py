from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.models.question import Respuesta, Resultado
from app.schemas.schemas import ResultadoOut, MejorCalificacionOut

router = APIRouter()

@router.post("/finalizar")
def finalizar_examen(estudiante_id: int, examen_id: int, db: Session = Depends(get_db)):
    respuestas = db.query(Respuesta).filter(
        Respuesta.estudiante_id == estudiante_id,
        Respuesta.examen_id == examen_id
    ).all()
    if not respuestas:
        return {"error": "No hay respuestas registradas"}

    # Suma o promedio de calificaciones
    total = sum(float(r.calificacion or 0) for r in respuestas)
    calificacion_final = total / len(respuestas) if respuestas else 0

    # Contar preguntas correctas (si tienes un criterio)
    preguntas_correctas = sum(1 for r in respuestas if float(r.calificacion or 0) >= 6)  # ejemplo: >=6 es correcta

    # Guardar resultado
    resultado = Resultado(
        estudiante_id=estudiante_id,
        examen_id=examen_id,
        calificacion_final=calificacion_final,
        preguntas_correctas=preguntas_correctas
    )
    db.add(resultado)
    db.commit()
    db.refresh(resultado)
    return {"calificacion_final": calificacion_final, "preguntas_correctas": preguntas_correctas}

@router.get("/estudiante/{id}", response_model=list[ResultadoOut])
def resultados_estudiante(id: int, db: Session = Depends(get_db)):
    return db.query(Resultado).filter(Resultado.estudiante_id == id).all()

@router.get("/todos", response_model=list[ResultadoOut])
def obtener_todos_los_resultados(db: Session = Depends(get_db)):
    return db.query(Resultado).all()

@router.get("/mejores", response_model=list[MejorCalificacionOut])
def mejores_calificaciones(db: Session = Depends(get_db)):
    subq = (
        db.query(
            Resultado.estudiante_id,
            func.max(Resultado.calificacion_final).label("mejor_calificacion")
        )
        .group_by(Resultado.estudiante_id)
        .subquery()
    )
    resultados = db.query(Resultado).join(
        subq,
        (Resultado.estudiante_id == subq.c.estudiante_id) &
        (Resultado.calificacion_final == subq.c.mejor_calificacion)
    ).all()
    return resultados
