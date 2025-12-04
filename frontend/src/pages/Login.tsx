import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import { useState } from "react";
import { users, type User } from "../data/users";

interface LoginPageProps {
  loggedUsername: string | null;
  setLoggedUsername: (newValue: string | null) => void;
}

const LoginPage = ({ loggedUsername, setLoggedUsername }: LoginPageProps) => {
  const [isRegister, setIsRegister] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (loggedUsername) return <Navigate to="/" replace />;

  const login = () => {
    const user = users.find((user) => user.name === username);

    if (!user) return console.log("User doesn't exist");

    if (user.password !== password) return console.log("Wrong password");

    setLoggedUsername(user.name);
  };

  const register = () => {
    const user: User = {
      name: username,
      email,
      password,
    };
    users.push(user);

    setLoggedUsername(user.name);
  };

  return (
    <div>
      <h2 className="font-bold text-2xl">
        {isRegister ? "Register" : "Login"}
      </h2>

      <div className="flex flex-col gap-4 my-5">
        <div>
          <p>Username</p>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-2 py-1 bg-neutral-300 rounded-md"
          />
        </div>

        {isRegister && (
          <div>
            <p>Email</p>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-2 py-1 bg-neutral-300 rounded-md"
            />
          </div>
        )}

        <div>
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-2 py-1 bg-neutral-300 rounded-md"
          />
        </div>

        <Button
          onClick={() => {
            if (isRegister) register();
            else login();
          }}
        >
          {isRegister ? "Register" : "Login"}
        </Button>

        <div className="text-sm">
          {isRegister ? "Already registered? " : "Don't have an account? "}
          <button
            onClick={() => {
              setIsRegister(!isRegister);
            }}
            className="underline font-bold cursor-pointer"
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
