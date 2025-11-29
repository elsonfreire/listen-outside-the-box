Para integrar com Frontends ou testar via Postman/Insomnia.

POST /analyze
Inicia o pipeline completo de recomendação.

URL: http://localhost:5000/analyze

Content-Type: application/json

➤ Objeto de Requisição (Request)
Envie um JSON contendo o termo de busca (Nome da música + Artista).

{
  "query": "Arctic Monkeys"
}

➤ Objeto de Retorno (Response)
O sistema retorna a música de entrada identificada e a melhor recomendação encontrada baseada em similaridade de áudio, além da lista de candidatos analisados.

{
  "input": {
    "title": "Do I Wanna Know?",
    "artist": "Arctic Monkeys"
  },
  "winner": {
    "title": "Música Desconhecida Incrível",
    "artist": "Banda Indie Obscura",
    "score": 0.9854,
    "popularity": 32,
    "id": "4j5k...",
    "link": "[http://open.spotify.com/track/4j5k](http://open.spotify.com/track/4j5k)..."
  },
  "candidates": [
    {
      "title": "Outra Opção Boa",
      "artist": "Artista Alternativo",
      "score": 0.9102,
      "popularity": 15,
      "id": "2x9l...",
      "link": "[http://open.spotify.com/track/2x9l](http://open.spotify.com/track/2x9l)..."
    },
    ...
  ]
}