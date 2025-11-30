import axios from "axios";
import Button from "../components/Button";
import { useState } from "react";

const HomePage = () => {
  const [songLink, setSongLink] = useState(
    "https://open.spotify.com/track/2fAwUj2Ezq0uB2ClAKEDb1?si=00f82328433e4ade"
  );

  const getMusic = () => {
    console.log("A");

    axios
      .post("http://localhost:5000/analyze", {
        query: "Ela Une Todas as Coisas",
      })
      .then((response) => console.log(response));
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 items-center">
        <div>
          <h2 className="font-bold text-4xl text-center">
            Ela Une Todas as Coisas
          </h2>
          <h3 className="font-bold text-2xl text-center">Jorge Vercílio</h3>
        </div>
        <a href={songLink} target="_blank" className="text-blue-800 underline">
          Abrir no Spotify
        </a>
      </div>
      <div className="flex justify-center gap-2">
        <Button onClick={getMusic}>Like</Button>
        <Button>Dislike</Button>
      </div>
    </div>
  );
};

export default HomePage;
