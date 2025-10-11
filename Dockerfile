FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY .npmrc ./

# Instalar dependencias
RUN npm install --ignore-scripts

# Copiar todo el código fuente
COPY . .

# Instalar Quasar CLI globalmente
RUN npm install -g @quasar/cli

# Ejecutar quasar prepare manualmente
RUN npx quasar prepare

# Build de producción (modo SPA)
RUN quasar build

# Instalar servidor para servir los archivos estáticos
RUN npm install -g serve

# Exponer puerto 9000 (el mismo que usas actualmente)
EXPOSE 9000

# Comando para servir la aplicación built
CMD ["serve", "-s", "dist/spa", "-l", "9000"]
