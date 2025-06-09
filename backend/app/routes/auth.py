from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

# Importaciones de tu proyecto
from app.schemas.schemas import UsuarioOut
from app.database.db import get_db
from app.models.user import Usuario

router = APIRouter(tags=["Autenticación"])


def get_user(db: Session, correo: str):
    """Obtiene un usuario de la base de datos por email"""
    return db.query(Usuario).filter(Usuario.correo == correo).first()

def authenticate_user(db: Session, correo: str, password: str):
    """Autentica al usuario verificando credenciales"""
    user = get_user(db, correo)
    if not user:
        return False
    if password != user.contrasena:
        return False
    return user

# Endpoint de login (solo para verificar credenciales)
@router.post("/login", response_model=dict)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Endpoint para iniciar sesión y obtener token JWT"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )
    # Devuelve los datos clave del usuario
    return {
        "mensaje": "Inicio de sesión exitoso",
        "id": user.id,
        "correo": user.correo,
        "rol": user.rol,
        "nombre": user.nombre
    }

# Dependencia para rutas protegidas: pide usuario y contraseña en cada petición
def basic_auth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Dependencia para autenticar usuarios en rutas protegidas"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas",
        )
    return user

# Ejemplo de ruta protegida
@router.post("/usuario/me", response_model=UsuarioOut)
async def leer_usuario_actual(current_user: Usuario = Depends(basic_auth)):
    return current_user