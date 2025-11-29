# Usa Python 3.10 leve
FROM python:3.10-slim

# Instala FFmpeg, Node.js (CRUCIAL PARA YT-DLP) e dependências
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    nodejs \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia requirements e instala
COPY requirements.txt .
# Força a atualização do yt-dlp para a versão mais recente do git (correções diárias do YouTube)
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --upgrade --force-reinstall "git+https://github.com/yt-dlp/yt-dlp.git"

# Copia o código fonte
COPY . .

# Expõe a porta 8000
EXPOSE 8000

# Comando para iniciar
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]