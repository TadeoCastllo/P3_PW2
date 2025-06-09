from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.db import SessionLocal
from app.models.question import Resultado
from app.schemas.schemas import ResultadoOut, MejorCalificacionOut

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
