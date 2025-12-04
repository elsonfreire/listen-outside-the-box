export interface User {
  name: string;
  email: string;
  password: string;
}

export const users: User[] = [
  {
    name: "admin",
    email: "admin@mail.com",
    password: "admin",
  },
];
