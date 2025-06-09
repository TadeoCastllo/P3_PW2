from sqlalchemy import Column, Integer, String, Text, ForeignKey, Enum, JSON, DECIMAL, Boolean, TIMESTAMP, DateTime
from sqlalchemy.orm import relationship
from app.database.db import Base
import enum
from datetime import datetime

class TipoPregunta(enum.Enum):
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
    tipo = Column(Enum(TipoPregunta), nullable=False)
    opciones = Column(JSON, nullable=True)
    respuesta_modelo = Column(Text)
    generada_por_ia = Column(Boolean, default=False)
    texto = Column(String, nullable=False)
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

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
