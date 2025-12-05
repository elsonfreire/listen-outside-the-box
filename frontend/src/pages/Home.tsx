import axios from "axios";
import Button from "../components/Button";
import { useState } from "react";
import { BiLike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";

const HomePage = () => {
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const [songName, setSongName] = useState("Ela Une Todas as Coisas");
  const [artistName, setArtistName] = useState("Jorge Vercillo");
  const [songId, setSongId] = useState(
    "2fAwUj2Ezq0uB2ClAKEDb1?si=00f82328433e4ade"
  );

  const [candidateSongs, setCandidateSongs] = useState([]);

  const setSuggestion = (song: any) => {
    setSongName(song.name);
    setArtistName(song.artist);
    setSongId(song.id);
  };

  const getSongCandidates = async () => {
    try {
      const response = axios.get(`http://localhost:5000/candidates/${songId}`);

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
        <a
          href={`https://open.spotify.com/track/${songId}`}
          target="_blank"
          className="text-blue-800 underline"
        >
          Abrir no Spotify
        </a>
      </div>

      <div className="flex justify-center gap-2">
        <Button onClick={handleLike}>
          <BiLike size={24} />
        </Button>
        <Button onClick={handleDislike}>
          <BiDislike size={24} />
        </Button>
      </div>
    </div>
  );
};

export default HomePage;
