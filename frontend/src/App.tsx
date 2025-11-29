import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";

function App() {
  return (
    <div className=" w-full min-h-screen">
      <div className="bg-green-900 text-white p-8 shadow-lg">
        <h1 className="text-4xl font-bold">LOTB</h1>
      </div>

      <div className="min-h-screen bg-neutral-200 p-10 flex justify-center">
        <BrowserRouter>
          <Routes>
            <Route path="" element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
