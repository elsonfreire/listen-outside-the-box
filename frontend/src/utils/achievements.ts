import { getLoggedUser, setLoggedUser } from "../data/authStorage";
import { getUsers, saveUsers, type User } from "../data/usersStorage";

export const addAchievement = () => {
  const loggedUser = getLoggedUser();
  const users = getUsers();

  if (!loggedUser || !users) return null;

  const updatedUser = { ...loggedUser, hasAchievement: true };
  const updatedUsers = users.map((u: User) => {
    if (u.name === loggedUser?.name) {
      return updatedUser;
    }
    return u;
  });

  setLoggedUser(updatedUser);
  saveUsers(updatedUsers);

  return updatedUser;
};
