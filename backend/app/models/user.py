from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from app.database.db import Base
import enum

class RolUsuario(enum.Enum):
    estudiante = "estudiante"
    profesor = "profesor"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    rol = Column(Enum(RolUsuario), nullable=False)
    avatar_url = Column(String(255), nullable=True)
    ultimo_acceso = Column(TIMESTAMP, nullable=True)
    creado_en = Column(TIMESTAMP, nullable=True)
