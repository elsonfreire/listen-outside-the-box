# Usa Node 20 (LTS) leve
FROM node:20-alpine

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia código fonte
COPY . .

# Expõe a porta 5000
EXPOSE 5000

# Inicia o servidor
CMD ["node", "server.js"]