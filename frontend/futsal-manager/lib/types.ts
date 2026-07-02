export enum FieldSize {
  Five = "five",
  Seven = "seven",
  Eleven = "eleven",
}

export enum UserRole {
  Player = "player",
  VenueAdmin = "venue_admin",
}

export enum ReservationStatus {
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export interface UserSummary {
  id: number;
  name: string;
  email: string;
}

export interface User {
  id: number;
  google_id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: UserRole;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  phone: string;
  logo_url: string | null;
  admin_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface VenueInput {
  name: string;
  address: string;
  phone: string;
  logo_url?: string | null;
}

export interface Field {
  id: number;
  venue_id: number;
  name: string;
  size: FieldSize;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface FieldInput {
  name: string;
  size: FieldSize;
  image_url?: string | null;
}

export interface Reservation {
  id: number;
  field_id: number;
  user_id: number;
  user: UserSummary;
  start_time: string;
  end_time: string;
  status: ReservationStatus;
  created_at: string;
  updated_at: string;
}

export interface ReservationInput {
  field_id: number;
  start_time: string;
  end_time: string;
}

export interface Availability {
  start_time: string;
  end_time: string;
}

export interface UserSyncInput {
  google_id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
}
