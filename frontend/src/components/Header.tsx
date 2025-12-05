import profileImg from "../assets/profile.png";
import { setLoggedUser } from "../data/authStorage";
import type { User } from "../data/usersStorage";

interface HeaderProps {
  user: User | null;
  setUser: (newValue: User | null) => void;
}

const Header = ({ user, setUser }: HeaderProps) => {
  const handleLogoff = () => {
    setUser(null);
    setLoggedUser(null);
  };

  return (
    <div className="bg-green-800 text-white p-8 px-14 shadow-lg flex justify-between font-bold">
      <a className="text-4xl" href="/">
        LOTB
      </a>
      {user && (
        <div className="flex gap-4 items-center cursor-pointer text-right">
          <div className="flex flex-col items-end">
            <a href="/profile">
              <p>{user?.name}</p>
            </a>
            <button
              onClick={handleLogoff}
              className="font-normal text-xs text-red-300 cursor-pointer"
            >
              Log-off
            </button>
          </div>

          <a href="/profile">
            <img src={profileImg} className="w-10" />
          </a>
        </div>
      )}
    </div>
  );
};

export default Header;
