export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  clubId?: string;
}

export enum UserRole {
  PLAYER = "PLAYER",
  CLUB = "CLUB",
  ADMIN = "ADMIN",
}
