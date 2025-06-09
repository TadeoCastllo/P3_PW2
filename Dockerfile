FROM node:20-alpine

WORKDIR /app

# Copia archivos esenciales para instalar dependencias
COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./

# Instala dependencias
RUN npm install

# Comando para desarrollo con hot-reload
CMD ["npm", "run", "dev"]