FROM python:3.11-slim

WORKDIR /app

# Instala dependencias del sistema primero
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia solo lo necesario para instalar dependencias
COPY requirements.txt .

# Instalación con mirror alternativo y manejo de errores
RUN pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt \
    --index-url https://pypi.org/simple \
    || { echo "Falló la instalación"; exit 1; }

# Copia el resto del código
COPY . .

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]