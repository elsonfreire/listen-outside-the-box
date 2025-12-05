import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import ProfilePage from "./pages/Profile";
import Header from "./components/Header";
import { useState } from "react";
import { getLoggedUser } from "./data/authStorage";
import type { User } from "./data/usersStorage";

function App() {
  const [user, setUser] = useState<User | null>(getLoggedUser());

  return (
    <div className=" w-full min-h-screen">
      <Header user={user} />

      <div className="min-h-screen bg-neutral-200 py-30 flex justify-center">
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
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route path="login" element={<LoginPage setUser={setUser} />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
