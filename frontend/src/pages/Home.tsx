import axios from "axios";
import Button from "../components/Button";
import { useState } from "react";

const HomePage = () => {
  const [isLoadingSuggestion, setisLoadingSuggestion] = useState(false);

  const [songName, setSongName] = useState("Ela Une Todas as Coisas");
  const [artistName, setArtistName] = useState("Jorge Vercillo");
  const [songLink, setSongLink] = useState(
    "https://open.spotify.com/track/2fAwUj2Ezq0uB2ClAKEDb1?si=00f82328433e4ade"
  );

  const getSongSuggestion = () => {
    setisLoadingSuggestion(true);

    axios
      .post("http://localhost:5000/analyze", {
        query: songName,
      })
      .then((response) => response.data.winner)
      .then((resultSong) => {
        setSongName(resultSong.title);
        setArtistName(resultSong.artist);
        setSongLink(resultSong.link);

        setisLoadingSuggestion(false);
      });
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
        <Button onClick={getSongSuggestion}>Like</Button>
        <Button>Dislike</Button>
      </div>
    </div>
  );
};

export default HomePage;
