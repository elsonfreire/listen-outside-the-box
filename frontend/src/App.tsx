import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import { useState } from "react";

function App() {
  const [logged, setLogged] = useState(false);

  return (
    <div className=" w-full min-h-screen">
      <div className="bg-green-800 text-white p-8 shadow-lg">
        <a className="text-4xl font-bold" href="/">
          LOTB
        </a>
      </div>

      <div className="min-h-screen bg-neutral-200  py-30 flex justify-center">
        <BrowserRouter>
          <Routes>
            <Route path="" element={<HomePage />} />
            <Route
              path="login"
              element={<LoginPage logged={logged} setLogged={setLogged} />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
