export interface Stadium {
  id: number;
  name: string;
  address: string;
  phone: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: number;
}

export interface Reservation {
  id: number;
  user: User;
  stadium: Stadium;
  datetime: string;
}

export interface AddReservation {
  userId: number;
  stadiumId: number;
  datetime: string;
}
