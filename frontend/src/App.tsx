import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import { useState } from "react";
import PrivateRoute from "./components/PrivateRoute";
import type { User } from "./data/usersStorage";

function App() {
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
            <Route
              path=""
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route path="login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
