const express = require('express');
const axios = require('axios');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const ML_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

const ensureSpotifyToken = async (req, res, next) => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    next();
  } catch (err) {
    console.error('Erro Auth Spotify:', err.message);
    res.status(500).json({ error: 'Falha Auth Spotify' });
  }
};

// Lógica inteligente para escolher o gênero mais específico
function pickBestGenre(genres) {
    if (!genres || genres.length === 0) return 'indie';
    
    // Lista de gêneros muito genéricos que queremos evitar se possível
    const genericTerms = ['classical', 'instrumental', 'soundtrack', 'orchestral'];
    
    // Tenta achar um gênero que NÃO seja genérico (ex: "romantic classical", "baroque")
    const specific = genres.find(g => !genericTerms.includes(g.toLowerCase()));
    
    if (specific) return specific;
    return genres[0]; // Se só tiver genérico, paciência
}

app.get('/candidates/:seedId', ensureSpotifyToken, async (req, res) => {
    try {
        const seedId = req.params.seedId;
        const trackData = await spotifyApi.getTrack(seedId);
        const artistId = trackData.body.artists[0].id;
        const artistData = await spotifyApi.getArtist(artistId);
        
        // --- MELHORIA 1: Seleção de Gênero Inteligente ---
        const bestGenre = pickBestGenre(artistData.body.genres);
        // Remove caracteres especiais para busca
        const cleanGenre = bestGenre.replace(/[^a-zA-Z0-9 ]/g, "");

        console.log(`🔍 Input: ${artistData.body.name} | Gêneros: [${artistData.body.genres.join(', ')}]`);
        console.log(`🎯 Gênero Escolhido para Mining: "${cleanGenre}"`);

        // --- MELHORIA 2: Offset Menor ---
        // Se o offset for muito grande (500), às vezes cai no vazio. Reduzi para 200.
        const randomOffset = Math.floor(Math.random() * 200);

        const searchData = await spotifyApi.searchTracks(`genre:"${cleanGenre}"`, {
            limit: 50,
            offset: randomOffset,
            market: 'BR'
        });

        if (!searchData.body.tracks || searchData.body.tracks.items.length === 0) {
            console.log("Nada encontrado nesse offset.");
            return res.json({ candidates: [] });
        }

        const allTracks = searchData.body.tracks.items;
        
        const ladoB_Candidates = allTracks
            .filter(t => t.popularity <= 55) // Aumentei levemente a margem
            .filter(t => t.id !== seedId)
            .map(t => ({
                id: t.id,
                name: t.name,
                artist: t.artists[0].name,
                popularity: t.popularity
            }));

        const selected = ladoB_Candidates
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        console.log(`✓ Encontrados ${selected.length} candidatos Lado B.`);
        res.json({ candidates: selected });

    } catch (error) {
        console.error("Erro no Mining:", error.message);
        res.json({ candidates: [] });
    }
});

app.post('/analyze', ensureSpotifyToken, async (req, res) => {
  const { query } = req.body;
  if(!query) return res.status(400).json({error: "Query vazia"});

  try {
    const search = await spotifyApi.searchTracks(query);
    if (!search.body.tracks || search.body.tracks.items.length === 0) {
        return res.status(404).json({ error: 'Música não encontrada' });
    }
    const track = search.body.tracks.items[0];

    console.log(`🎵 Input: ${track.name} - ${track.artists[0].name}`);

    try {
        const mlResponse = await axios.post(`${ML_URL}/pipeline`, {
            spotify_id: track.id,
            title: track.name,
            artist: track.artists[0].name
        });
        res.json(mlResponse.data);
    } catch (pyError) {
        console.error("Erro Python:", pyError.message);
        res.status(500).json({ error: 'Erro no ML Service' });
    }

  } catch (error) {
    console.error("Erro Geral:", error.message);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 API Node rodando na porta ${PORT}`));