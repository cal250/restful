import { Role } from "@prisma/client";

export type SafeUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type AuthResult = {
  user: SafeUser;
  token: string;
};
