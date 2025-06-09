from sqlalchemy import func, and_
from app.models.user import Usuario
from app.models.question import Respuesta, Resultado, Examen
from app.schemas.schemas import ResultadoOut, MejorCalificacionOut
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.db import get_db

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

@router.get("/mejores-calificaciones")
def mejores_calificaciones(db: Session = Depends(get_db)):
    # Subconsulta: para cada estudiante, su mejor calificación
    subq = (
        db.query(
            Resultado.estudiante_id,
            func.max(Resultado.calificacion_final).label("mejor_calificacion")
        )
        .group_by(Resultado.estudiante_id)
        .subquery()
    )

    # Ahora, obtenemos el examen_id y el título del examen donde obtuvo esa calificación
    resultados = (
        db.query(
            Usuario.nombre,
            Usuario.correo,
            Resultado.calificacion_final,
            Resultado.examen_id,
            Examen.titulo
        )
        .join(Resultado, Usuario.id == Resultado.estudiante_id)
        .join(Examen, Resultado.examen_id == Examen.id)
        .join(subq, and_(
            subq.c.estudiante_id == Resultado.estudiante_id,
            subq.c.mejor_calificacion == Resultado.calificacion_final
        ))
        .filter(Usuario.rol == "estudiante")
        .all()
    )

    return [
        {
            "nombre": r.nombre,
            "correo": r.correo,
            "calificacion": float(r.calificacion_final),
            "examen_id": r.examen_id,
            "examen": r.titulo
        }
        for r in resultados
    ]
