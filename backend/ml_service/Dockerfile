# Mantemos o 3.10 pois é muito estável para IA
FROM python:3.10-slim

# Instala git (necessário para instalar yt-dlp do repositório) e nodejs
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    nodejs \
    git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia requirements limpo
COPY requirements.txt .

# Instala as dependências
# O --upgrade force-reinstall no final garante que o yt-dlp seja o mais atual possível
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --upgrade --force-reinstall "git+https://github.com/yt-dlp/yt-dlp.git"

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]