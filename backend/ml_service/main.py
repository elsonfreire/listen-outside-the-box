import os
import shutil
import sqlite3
import requests
import numpy as np
import faiss
import torch
import torchaudio
import librosa
import concurrent.futures 
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from yt_dlp import YoutubeDL
from transformers import Wav2Vec2FeatureExtractor, AutoModel

# --- CONFIGURAÇÃO CPU ---
print("\n=== INICIALIZANDO SISTEMA (MODO CPU - THREADED) ===")
DEVICE = torch.device("cpu")
print("✓ Rodando na CPU")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
DB_PATH = os.path.join(DATA_DIR, "metadata.db")
NODE_API_URL = os.getenv("NODE_API_URL", "http://localhost:5000")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

app = FastAPI()

# --- MODELO AI ---
MODEL_ID = "m-a-p/MERT-v1-95M"
print(f"⏳ Carregando MERT-95M...")
try:
    processor = Wav2Vec2FeatureExtractor.from_pretrained(MODEL_ID, trust_remote_code=True)
    model = AutoModel.from_pretrained(MODEL_ID, trust_remote_code=True, use_safetensors=True).to(DEVICE)
    print("✓ Modelo carregado!")
except Exception as e:
    print(f"✗ Erro modelo: {e}"); exit(1)

index = faiss.IndexFlatL2(768)
track_mapping = {} 
current_faiss_id = 0

def init_db():
    global current_faiss_id
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS tracks
                 (spotify_id TEXT PRIMARY KEY, title TEXT, artist TEXT, faiss_id INTEGER, vector BLOB)''')
    conn.commit()
    c.execute("SELECT spotify_id, faiss_id, vector FROM tracks")
    rows = c.fetchall()
    for r in rows:
        track_mapping[r[1]] = r[0]
        vec = np.frombuffer(r[2], dtype=np.float32).reshape(1, -1)
        index.add(vec)
        if r[1] >= current_faiss_id: current_faiss_id = r[1] + 1
    conn.close()

init_db()

# --- DOWNLOAD E EXTRAÇÃO ---

def download_audio(query, filename_id):
    output_path = os.path.join(DATASET_DIR, f"{filename_id}.wav")
    if os.path.exists(output_path): return output_path
    
    ffmpeg_path = shutil.which("ffmpeg")
    
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(DATASET_DIR, f"{filename_id}"),
        'postprocessors': [{'key': 'FFmpegExtractAudio','preferredcodec': 'wav','preferredquality': '128'}],
        'quiet': True, 
        'noplaylist': True,
        # Força IPv4 (Resolve timeouts de rede do Docker)
        'force_ipv4': True,
        # REMOVIDO: extractor_args 'ios' (causa erro de PO Token)
        # ADICIONADO: user_agent genérico para evitar detecção imediata
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'socket_timeout': 30,
        'retries': 10,
        'nocheckcertificate': True,
    }
    
    if ffmpeg_path:
        ydl_opts['ffmpeg_location'] = os.path.dirname(ffmpeg_path)

    try:
        # print(f"⬇ Baixando: {query}") 
        with YoutubeDL(ydl_opts) as ydl: ydl.download([f"ytsearch1:{query} audio"])
        
        if not os.path.exists(output_path):
            print(f"✗ Erro: Arquivo não criado: {output_path}")
            return None
            
        return output_path
    except Exception as e:
        print(f"✗ Falha download ({query}): {e}")
        return None
    
def extract_features(audio_path):
    try:
        y, sr = librosa.load(audio_path, sr=processor.sampling_rate, mono=True)
        waveform = torch.from_numpy(y).unsqueeze(0)
        
        max_len = processor.sampling_rate * 30
        if waveform.shape[1] > max_len: waveform = waveform[:, :max_len]

        inputs = processor(waveform.squeeze(), sampling_rate=processor.sampling_rate, return_tensors="pt").to(DEVICE)
        with torch.no_grad():
            outputs = model(**inputs, output_hidden_states=True)
            last_layer = torch.mean(torch.stack(outputs.hidden_states)[-1], dim=1)
            
        return last_layer.numpy()[0]
    except Exception as e:
        print(f"✗ Erro IA: {e}"); return None

def process_single_candidate(cand):
    conn = sqlite3.connect(DB_PATH)
    res = conn.execute("SELECT vector FROM tracks WHERE spotify_id=?", (cand['id'],)).fetchone()
    conn.close()
    
    if res:
        vec = np.frombuffer(res[0], dtype=np.float32)
        return {"cand": cand, "vector": vec, "source": "cache"}

    print(f"   [Thread] Baixando: {cand['name']}")
    wav = download_audio(f"{cand['artist']} - {cand['name']}", cand['id'])
    
    if not wav: return None 
    
    vec = extract_features(wav)
    if vec is None: return None
    
    if os.path.exists(wav): os.remove(wav)
    
    return {"cand": cand, "vector": vec.astype(np.float32), "source": "new"}

def save_vector_to_db(spotify_id, title, artist, vec_np):
    global current_faiss_id
    conn = sqlite3.connect(DB_PATH)
    exists = conn.execute("SELECT 1 FROM tracks WHERE spotify_id=?", (spotify_id,)).fetchone()
    if not exists:
        conn.execute("INSERT INTO tracks VALUES (?, ?, ?, ?, ?)", 
                     (spotify_id, title, artist, current_faiss_id, vec_np.tobytes()))
        conn.commit()
        faiss.normalize_L2(vec_np.reshape(1, -1))
        index.add(vec_np.reshape(1, -1))
        track_mapping[current_faiss_id] = spotify_id
        current_faiss_id += 1
    conn.close()

# --- ENDPOINT ---

class PipelineRequest(BaseModel):
    spotify_id: str
    title: str
    artist: str

@app.post("/pipeline")
def run_pipeline(req: PipelineRequest):
    print(f"\n🚀 Pipeline: {req.title} ({req.artist})")
    
    # 1. Input
    input_data = process_single_candidate({"id": req.spotify_id, "name": req.title, "artist": req.artist})
    if not input_data: raise HTTPException(500, "Falha input")
    
    if input_data['source'] == 'new':
        save_vector_to_db(req.spotify_id, req.title, req.artist, input_data['vector'])
    
    input_vec = input_data['vector']

    # 2. Node API
    try:
        print("🔍 Buscando candidatos...")
        resp = requests.get(f"{NODE_API_URL}/candidates/{req.spotify_id}")
        candidates = resp.json().get('candidates', [])
    except: raise HTTPException(500, "Erro Node API")

    if not candidates: return {"message": "Sem candidatos", "winner": None}

    # 3. Multithreading
    print(f"🎛 Processando {len(candidates)} faixas...")
    valid_results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        future_to_cand = {executor.submit(process_single_candidate, cand): cand for cand in candidates}
        for future in concurrent.futures.as_completed(future_to_cand):
            try:
                result = future.result()
                if result:
                    valid_results.append(result)
                    if result['source'] == 'new':
                        c = result['cand']
                        save_vector_to_db(c['id'], c['name'], c['artist'], result['vector'])
            except Exception as exc: print(f"   [Erro Thread] {exc}")

    # 4. Comparação
    print(f"✓ {len(valid_results)} processados.")
    best_score = -1
    winner = None
    processed_final = []

    input_reshaped = input_vec.reshape(1, -1)
    faiss.normalize_L2(input_reshaped)

    for res in valid_results:
        cand = res['cand']
        vec = res['vector']
        
        cand_reshaped = vec.reshape(1, -1)
        faiss.normalize_L2(cand_reshaped)
        
        score = float(np.dot(input_reshaped, cand_reshaped.T)[0][0])
        print(f"   Score: {score:.4f} - {cand['name']}")
        
        link = f"https://open.spotify.com/track/{cand['id']}"
        
        item = {
            "title": cand['name'], 
            "artist": cand['artist'], 
            "score": score, 
            "popularity": cand.get('popularity', 0), # <--- CAMPO ADICIONADO AQUI
            "id": cand['id'],
            "link": link
        }
        processed_final.append(item)

        if score > best_score:
            best_score = score
            winner = item

    processed_final.sort(key=lambda x: x['score'], reverse=True)
    
    return {"input": {"title": req.title}, "winner": winner, "candidates": processed_final}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)