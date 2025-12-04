import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import { useState } from "react";
import users from "../data/users";

interface LoginPageProps {
  loggedUsername: string | null;
  setLoggedUsername: (newValue: string | null) => void;
}

const LoginPage = ({
  loggedUsername: logged,
  setLoggedUsername: setLoggedUsername,
}: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    const user = users.find((user) => user.name === username);

    if (!user) return console.log("User doesn't exist");

    if (user.password !== password) return console.log("Wrong password");

    setLoggedUsername(user.name);
    console.log("Logged in");
  };

  if (logged) return <Navigate to="/" replace />;

  return (
    <div>
      <h2 className="font-bold text-2xl">Login</h2>

      <div className="flex flex-col gap-4 my-5">
        <div>
          <p>Username</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-2 py-1 bg-neutral-300 rounded-md"
          />
        </div>

        <div>
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-2 py-1 bg-neutral-300 rounded-md"
          />
        </div>

        <Button onClick={login}>Login</Button>
      </div>
    </div>
  );
};

export default LoginPage;
