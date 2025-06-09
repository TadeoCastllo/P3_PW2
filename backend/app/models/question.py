from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DECIMAL, Boolean, TIMESTAMP, Enum as SqlEnum
from sqlalchemy.orm import relationship
from app.database.db import Base
from enum import Enum

class TipoPregunta(str, Enum):
    opcion_multiple = "opcion_multiple"
    completar = "completar"
    codigo = "codigo"

class Examen(Base):
    __tablename__ = "examenes"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    profesor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    creado_en = Column(TIMESTAMP)

class Pregunta(Base):
    __tablename__ = "preguntas"

    id = Column(Integer, primary_key=True, index=True)
    examen_id = Column(Integer, ForeignKey("examenes.id"), nullable=False)
    contexto = Column(Text, nullable=False)
    enunciado = Column(Text, nullable=False)
    tipo = Column(SqlEnum(TipoPregunta), nullable=False)  # <-- Usa SqlEnum aquí
    opciones = Column(JSON, nullable=True)
    respuesta_modelo = Column(Text)
    generada_por_ia = Column(Boolean, default=False)

class Respuesta(Base):
    __tablename__ = "respuestas"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    pregunta_id = Column(Integer, ForeignKey("preguntas.id"), nullable=False)
    examen_id = Column(Integer, ForeignKey("examenes.id"), nullable=False)
    respuesta_texto = Column(Text, nullable=False)
    calificacion = Column(DECIMAL(5,2))
    retroalimentacion_ia = Column(Text)
    tiempo_respuesta = Column(Integer)
    enviada_en = Column(TIMESTAMP)

class Resultado(Base):
    __tablename__ = "resultados"

    id = Column(Integer, primary_key=True, index=True)
    estudiante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    examen_id = Column(Integer, ForeignKey("examenes.id"), nullable=False)
    calificacion_final = Column(DECIMAL(5,2), nullable=False)
    preguntas_correctas = Column(Integer, nullable=False)
    completado_en = Column(TIMESTAMP)
