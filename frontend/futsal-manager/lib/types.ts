export interface Stadium {
  id: string;
  name: string;
  address: string;
  phone: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: number;
  role: UserRole;
}

export enum UserRole {
  Admin,
  User,
}
export interface Reservation {
  id: string;
  user: User;
  stadium: Stadium;
  datetime: string;
}

export interface AddReservation {
  userId: string;
  stadiumId: string;
  datetime: string;
}
