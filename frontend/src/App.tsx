import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import PrivateRoute from "./components/PrivateRoute";
import ProfilePage from "./pages/Profile";
import Header from "./components/Header";

function App() {
  return (
    <div className=" w-full min-h-screen">
      <Header />

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
            <Route path="login" element={<LoginPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </div>
  );
}

export default App;
