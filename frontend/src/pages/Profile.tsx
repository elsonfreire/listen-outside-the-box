import { getLoggedUser } from "../data/authStorage";
import profileImg from "../assets/profile.png";
import achievementImg from "../assets/achievement.png";

const ProfilePage = () => {
  const user = getLoggedUser();

  return (
    <div>
      <h2 className="font-bold text-2xl">Profile</h2>

      <div className="flex flex-col gap-6 my-5">
        <div className="flex w-80 gap-4">
          <img src={profileImg} alt="Profile" className="w-1/3" />
          <div className="font-bold">
            <p>Username: {user?.name}</p>
            <p>Email: {user?.email}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6 my-5">
          <h3 className="font-bold text-xl">Achievements</h3>
          <div className="grid grid-cols-4">
            <img className="w-12" src={achievementImg} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
