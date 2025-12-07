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

// Extrai gêneros principais (evita muito genéricos)
function extractPrimaryGenres(genres) {
    if (!genres || genres.length === 0) return [];
    
    const genericTerms = ['pop', 'rock', 'indie', 'alternative'];
    const specific = genres.filter(g => !genericTerms.includes(g.toLowerCase()));
    
    return specific.length > 0 ? specific.slice(0, 3) : genres.slice(0, 3);
}

// ESTRATÉGIA 1: Busca por múltiplos gêneros do artista (PARALELO)
async function searchByGenres(artistGenres, seedId) {
    const candidates = [];
    const usedIds = new Set([seedId]);
    
    const primaryGenres = extractPrimaryGenres(artistGenres);
    
    // Busca todos os gêneros em PARALELO
    const genreSearches = primaryGenres.map(async (genre) => {
        try {
            const cleanGenre = genre.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
            const randomOffset = Math.floor(Math.random() * 150);
            
            const searchData = await spotifyApi.searchTracks(
                `genre:"${cleanGenre}"`,
                { limit: 30, offset: randomOffset, market: 'BR' }
            );
            
            if (searchData.body.tracks && searchData.body.tracks.items) {
                return searchData.body.tracks.items.filter(
                    track => !usedIds.has(track.id) && track.popularity <= 60 && track.id !== seedId
                );
            }
            return [];
        } catch (err) {
            console.error(`Erro buscando gênero ${genre}:`, err.message);
            return [];
        }
    });
    
    const results = await Promise.all(genreSearches);
    
    // Combina resultados e adiciona IDs únicos
    for (const tracks of results) {
        for (const track of tracks) {
            if (!usedIds.has(track.id)) {
                candidates.push(track);
                usedIds.add(track.id);
            }
        }
    }
    
    return candidates;
}

// ESTRATÉGIA 2: Busca por década/período
async function searchByEra(releaseDate, artistName) {
    if (!releaseDate) return [];
    
    const year = parseInt(releaseDate.substring(0, 4));
    const decade = Math.floor(year / 10) * 10;
    
    try {
        const searchData = await spotifyApi.searchTracks(
            `year:${decade}-${decade + 9}`,
            { limit: 30, offset: Math.floor(Math.random() * 100), market: 'BR' }
        );
        
        return searchData.body.tracks?.items?.filter(t => t.popularity <= 60) || [];
    } catch (err) {
        console.error('Erro busca por era:', err.message);
        return [];
    }
}

// ESTRATÉGIA 3: Busca similar ao nome do artista (OTIMIZADO)
async function searchSimilarArtists(artistName, seedId) {
    try {
        // Busca por artistas com nomes/estilos parecidos
        const searchData = await spotifyApi.searchArtists(artistName, { limit: 10 });
        
        const tracks = [];
        const usedIds = new Set([seedId]);
        
        // Processa artistas em PARALELO
        const artistPromises = searchData.body.artists.items.slice(0, 5).map(async (artist) => {
            try {
                // Pega albums do artista
                const albums = await spotifyApi.getArtistAlbums(artist.id, { 
                    limit: 5,
                    include_groups: 'album,single'
                });
                
                // Pega tracks dos albums em PARALELO
                const albumTracksPromises = albums.body.items.slice(0, 2).map(async (album) => {
                    try {
                        const albumTracks = await spotifyApi.getAlbumTracks(album.id, { limit: 5 });
                        
                        // Busca info completa em PARALELO
                        const fullTrackPromises = albumTracks.body.items
                            .filter(track => !usedIds.has(track.id))
                            .slice(0, 3) // Limita para não sobrecarregar
                            .map(track => spotifyApi.getTrack(track.id));
                        
                        const fullTracks = await Promise.all(fullTrackPromises);
                        return fullTracks
                            .map(ft => ft.body)
                            .filter(track => track.popularity <= 60);
                    } catch (err) {
                        return [];
                    }
                });
                
                const albumResults = await Promise.all(albumTracksPromises);
                return albumResults.flat();
            } catch (err) {
                console.error(`Erro processando artista ${artist.name}`);
                return [];
            }
        });
        
        const artistResults = await Promise.all(artistPromises);
        const allTracks = artistResults.flat();
        
        // Remove duplicatas
        for (const track of allTracks) {
            if (!usedIds.has(track.id)) {
                tracks.push(track);
                usedIds.add(track.id);
            }
        }
        
        return tracks;
    } catch (err) {
        console.error('Erro busca artistas similares:', err.message);
        return [];
    }
}

// ESTRATÉGIA 4: Busca por palavras-chave do nome da música
async function searchByTrackKeywords(trackName, seedId) {
    try {
        // Remove palavras muito comuns
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
        const keywords = trackName.toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word))
            .slice(0, 2)
            .join(' ');
        
        if (!keywords) return [];
        
        const searchData = await spotifyApi.searchTracks(keywords, {
            limit: 30,
            offset: Math.floor(Math.random() * 100),
            market: 'BR'
        });
        
        return searchData.body.tracks?.items?.filter(t => 
            t.id !== seedId && t.popularity <= 60
        ) || [];
    } catch (err) {
        console.error('Erro busca por keywords:', err.message);
        return [];
    }
}

app.get('/candidates/:seedId', ensureSpotifyToken, async (req, res) => {
    const startTime = Date.now(); // Mede tempo de execução
    
    try {
        const seedId = req.params.seedId;
        const trackData = await spotifyApi.getTrack(seedId);
        const track = trackData.body;
        const artistId = track.artists[0].id;
        const artistData = await spotifyApi.getArtist(artistId);
        
        const artistGenres = artistData.body.genres || [];
        const artistName = artistData.body.name;
        const trackName = track.name;
        const releaseDate = track.album.release_date;

        console.log(`🔍 Input: ${artistName} - ${trackName}`);
        console.log(`   Gêneros: [${artistGenres.join(', ')}]`);
        console.log(`   Release: ${releaseDate}`);

        // Executa todas as estratégias em PARALELO (MUITO MAIS RÁPIDO!)
        console.log(`⚡ Executando 4 estratégias em paralelo...`);
        const strategyStartTime = Date.now();
        
        const [genreCandidates, eraCandidates, artistCandidates, keywordCandidates] = await Promise.all([
            searchByGenres(artistGenres, seedId),
            searchByEra(releaseDate, artistName),
            searchSimilarArtists(artistName, seedId),
            searchByTrackKeywords(trackName, seedId)
        ]);
        
        const strategyTime = Date.now() - strategyStartTime;
        console.log(`⏱️  Estratégias completadas em ${strategyTime}ms`);

        console.log(`📊 Encontrados: ${genreCandidates.length} por gênero, ${eraCandidates.length} por era, ${artistCandidates.length} por artista, ${keywordCandidates.length} por keywords`);

        // Combina e remove duplicatas
        const allCandidates = [
            ...genreCandidates,
            ...eraCandidates,
            ...artistCandidates,
            ...keywordCandidates
        ];

        const uniqueMap = new Map();
        for (const track of allCandidates) {
            if (!uniqueMap.has(track.id) && track.id !== seedId) {
                uniqueMap.set(track.id, track);
            }
        }

        const uniqueCandidates = Array.from(uniqueMap.values());

        // Processa candidatos em PARALELO (muito mais rápido!)
        console.log(`⚡ Processando ${Math.min(uniqueCandidates.length, 15)} candidatos em paralelo...`);
        
        const candidatesToProcess = uniqueCandidates.slice(0, 15);
        
        const processedCandidates = await Promise.all(
            candidatesToProcess.map(async (candidate) => {
                try {
                    // Busca gêneros do artista do candidato
                    const candidateArtistData = await spotifyApi.getArtist(candidate.artists[0].id);
                    const candidateGenres = candidateArtistData.body.genres || [];

                    return {
                        id: candidate.id,
                        name: candidate.name,
                        artist: candidate.artists[0].name,
                        popularity: candidate.popularity,
                        genres: candidateGenres.join(','),
                        audio_features: null,
                        release_date: candidate.album?.release_date || null
                    };
                } catch (err) {
                    console.error(`Erro processando candidato ${candidate.id}`);
                    return null; // Retorna null em caso de erro
                }
            })
        );
        
        // Remove candidatos que falharam (null)
        const validCandidates = processedCandidates.filter(c => c !== null);

        // Seleciona 8 candidatos aleatórios
        const selected = validCandidates
            .sort(() => 0.5 - Math.random())
            .slice(0, 8);

        const totalTime = Date.now() - startTime;
        console.log(`✓ Enviando ${selected.length} candidatos Lado B`);
        console.log(`⏱️  Tempo total: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
        
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

    // Busca gêneros do artista
    let artistGenres = [];
    try {
        const artistData = await spotifyApi.getArtist(track.artists[0].id);
        artistGenres = artistData.body.genres || [];
    } catch (err) {
        console.error("Erro ao buscar gêneros do artista");
    }

    try {
        const mlResponse = await axios.post(`${ML_URL}/pipeline`, {
            spotify_id: track.id,
            title: track.name,
            artist: track.artists[0].name,
            genres: artistGenres.join(','),
            audio_features: null, // Deprecated - agora só usa embeddings de áudio
            release_date: track.album?.release_date || null,
            popularity: track.popularity || 0
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

// Busca dinâmica de músicas
app.get('/search', ensureSpotifyToken, async (req, res) => {
  const query = req.query.q;
  
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Query parameter required' });
  }

  try {
    const searchData = await spotifyApi.searchTracks(query, {
      limit: 10,
      market: 'BR'
    });

    const results = searchData.body.tracks.items.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      popularity: track.popularity,
      album: track.album.name,
      image: track.album.images[2]?.url || track.album.images[0]?.url // Pega imagem pequena
    }));

    res.json({ results });
  } catch (error) {
    console.error('Erro na busca:', error.message);
    res.status(500).json({ error: 'Search failed' });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 API Node rodando na porta ${PORT}`));