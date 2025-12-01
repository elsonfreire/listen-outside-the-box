import axios from "axios";
import Button from "../components/Button";
import { useState } from "react";

const HomePage = () => {
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const [songName, setSongName] = useState("Ela Une Todas as Coisas");
  const [artistName, setArtistName] = useState("Jorge Vercillo");
  const [songLink, setSongLink] = useState(
    "https://open.spotify.com/track/2fAwUj2Ezq0uB2ClAKEDb1?si=00f82328433e4ade"
  );

  const [candidateSongs, setCandidateSongs] = useState([]);

  const setSuggestion = (song: any) => {
    setSongName(song.title);
    setArtistName(song.artist);
    setSongLink(song.link);
  };

  const getSongCandidates = async () => {
    try {
      const response = axios.post("http://localhost:5000/analyze", {
        query: songName,
      });

      const candidates = (await response).data.candidates || [];
      setCandidateSongs(candidates);
      return candidates;
    } catch (err) {
      console.error(err);
      setCandidateSongs([]);
      return [];
    }
  };

  const getRandomSuggestion = (candidates: any) => {
    if (!candidates) return;

    const randomIndex = Math.floor(Math.random() * candidates.length);

    const selectedSong = candidates[randomIndex];

    const newCandidates = candidates.filter(
      (song: any) => song !== selectedSong
    );
    setCandidateSongs(newCandidates);

    return selectedSong;
  };

  const handleLike = async () => {
    setIsLoadingSuggestion(true);
    const candidates = await getSongCandidates();

    if (candidates.length > 0) {
      const suggestion = getRandomSuggestion(candidates);
      setSuggestion(suggestion);
    }

    setIsLoadingSuggestion(false);
  };

  const handleDislike = async () => {
    setIsLoadingSuggestion(true);

    if (candidateSongs.length > 0) {
      const suggestion = getRandomSuggestion(candidateSongs);
      setSuggestion(suggestion);
    }

    setIsLoadingSuggestion(false);
  };

  return isLoadingSuggestion ? (
    <h3 className="font-bold text-2xl text-center">
      Loading next song suggestion...
    </h3>
  ) : (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 items-center">
        <div>
          <h2 className="font-bold text-4xl text-center">{songName}</h2>
          <h3 className="font-bold text-2xl text-center">{artistName}</h3>
        </div>
        <a href={songLink} target="_blank" className="text-blue-800 underline">
          Abrir no Spotify
        </a>
      </div>
      <div className="flex justify-center gap-2">
        <Button onClick={handleLike}>Like</Button>
        <Button onClick={handleDislike}>Dislike</Button>
      </div>
    </div>
  );
};

export default HomePage;
