import profileImg from "../assets/profile.png";
import type { User } from "../data/usersStorage";

const Header = ({ user }: { user: User | null }) => {
  return (
    <div className="bg-green-800 text-white p-8 px-14 shadow-lg flex justify-between font-bold">
      <a className="text-4xl" href="/">
        LOTB
      </a>
      {user && (
        <a
          href="/profile"
          className="flex gap-4 items-center cursor-pointer text-right"
        >
          <div>
            <p>{user?.name}</p>
            {/* <p className="font-normal text-xs text-red-300">Log-off</p> */}
          </div>

          <img src={profileImg} className="w-10" />
        </a>
      )}
    </div>
  );
};

export default Header;
