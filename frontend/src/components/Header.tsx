import { getLoggedUser } from "../data/authStorage";
import profileImg from "../assets/profile.png";

const Header = () => {
  const user = getLoggedUser();

  return (
    <div className="bg-green-800 text-white p-8 shadow-lg flex justify-between font-bold">
      <a className="text-4xl" href="/">
        LOTB
      </a>
      <a href="/profile" className="flex gap-4 items-center cursor-pointer">
        <p>{user?.name}</p>
        <img src={profileImg} className="w-10" />
      </a>
    </div>
  );
};

export default Header;
