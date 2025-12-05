export interface User {
  name: string;
  email: string;
  password: string;
  hasAchievement: boolean;
}

const STORAGE_KEY = "users";

export const getUsers = () => {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) return [];
  return JSON.parse(raw);
};

export function saveUsers(users: User[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function registerUser(newUser: User): boolean {
  const users = getUsers();

  if (users.some((u: User) => u.email === newUser.email)) {
    return false;
  }

  users.push(newUser);
  saveUsers(users);
  return true;
}

export function login(username: string, password: string): User | null {
  const users = getUsers();

  const user = users.find((u: User) => {
    console.log(username);

    return u.name === username && u.password === password;
  });

  return user || null;
}
