import axios from "axios";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import { useState } from "react";
import { BiLike } from "react-icons/bi";
import { BiDislike } from "react-icons/bi";
import { addAchievement } from "../utils/achievements";
import type { User } from "../data/usersStorage";
import { getLoggedUser } from "../data/authStorage";
import { FaSpotify } from "react-icons/fa";

const HomePage = ({
  setUser,
}: {
  setUser: (newValue: User | null) => void;
}) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);

  const [songName, setSongName] = useState("Ela Une Todas as Coisas");
  const [artistName, setArtistName] = useState("Jorge Vercillo");
  const [songPopularity, setSongPopularity] = useState(80);
  const [songId, setSongId] = useState(
    "2fAwUj2Ezq0uB2ClAKEDb1?si=00f82328433e4ade"
  );

  const [candidateSongs, setCandidateSongs] = useState([]);

  const setSuggestion = (song: any) => {
    setSongName(song.name);
    setArtistName(song.artist);
    setSongPopularity(song.popularity);
    setSongId(song.id);
  };

  const handleSearchSelect = (song: any) => {
    setSongName(song.name);
    setArtistName(song.artist);
    setSongPopularity(song.popularity);
    setSongId(song.id);
    // Limpa candidatos ao selecionar nova música
    setCandidateSongs([]);
  };

  const getSongCandidates = async () => {
    try {
      const response = axios.get(`${API_URL}/candidates/${songId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
          "Content-Type": "application/json",
        },
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
    if (!getLoggedUser()?.hasAchievement) {
      const updatedUser = addAchievement("Liked a song!");
      if (updatedUser) setUser(updatedUser);
    }

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

  return (
    <div className="flex flex-col gap-10">
      {/* Search Bar */}
      <div className="w-full">
        <SearchBar onSelectSong={handleSearchSelect} />
      </div>

      {isLoadingSuggestion ? (
        <h3 className="font-bold text-2xl text-center">
          Loading next song suggestion...
        </h3>
      ) : (
        <>
          <div className="flex flex-col gap-4 items-center">
            <div>
              <h2 className="font-bold text-4xl text-center">{songName}</h2>
              <h3 className="font-bold text-2xl text-center">{artistName}</h3>
              <h4 className="text-md text-center">
                Popularidade: {songPopularity}/100
              </h4>
            </div>
            <a
              href={`https://open.spotify.com/track/${songId}`}
              target="_blank"
              className="flex items-center gap-1 text-blue-800"
            >
              <FaSpotify />
              <div className=" underline">Open on Spotify</div>
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
        </>
      )}
    </div>
  );
};

export default HomePage;
