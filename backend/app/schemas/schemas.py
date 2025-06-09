from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime

# --- Esquemas de Usuario (Nuevos) ---
class UsuarioBase(BaseModel):
    correo: str
    nombre: str = Field(..., min_length=2, max_length=100)

class UsuarioCreate(UsuarioBase):
    contrasena: str = Field(..., min_length=8)
    rol: Literal['estudiante', 'profesor']

class UsuarioOut(UsuarioBase):
    id: int
    rol: str
    avatar_url: Optional[str] = None
    ultimo_acceso: Optional[datetime] = None
    class Config:
        from_attributes = True  # Reemplaza orm_mode en Pydantic V2

# --- Esquemas Existentes (Actualizados) ---
class ExamenCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=255)
    descripcion: Optional[str] = Field(None, max_length=500)
    profesor_id: int

class ExamenOut(ExamenCreate):
    id: int
    class Config:
        from_attributes = True

class PreguntaCreate(BaseModel):
    examen_id: int
    contexto: str = Field(..., min_length=10)
    enunciado: str = Field(..., min_length=5)
    tipo: Literal['opcion_multiple', 'completar', 'codigo']
    opciones: Optional[List[str]] = Field(
        None,
        min_items=2,
        max_items=5,
        description="Requerido para preguntas de opción múltiple"
    )
    respuesta_modelo: Optional[str] = Field(
        None,
        description="Respuesta esperada para comparación"
    )
    generada_por_ia: bool = Field(default=True)

class PreguntaOut(PreguntaCreate):
    id: int
    class Config:
        from_attributes = True

class RespuestaCreate(BaseModel):
    estudiante_id: int
    pregunta_id: int
    examen_id: int
    respuesta_texto: str = Field(..., min_length=1)
    tiempo_respuesta: int = Field(..., gt=0, description="Tiempo en segundos")

class RespuestaOut(RespuestaCreate):
    id: int
    calificacion: Optional[float] = Field(None, ge=0, le=10)
    retroalimentacion_ia: Optional[str] = None
    class Config:
        from_attributes = True

class ResultadoOut(BaseModel):
    id: int
    estudiante_id: int
    examen_id: int
    calificacion_final: float = Field(..., ge=0, le=10)
    preguntas_correctas: int = Field(..., ge=0)
    completado_en: Optional[datetime] = None
    class Config:
        from_attributes = True

class MejorCalificacionOut(BaseModel):
    estudiante_id: int
    mejor_calificacion: float
    class Config:
        from_attributes = True