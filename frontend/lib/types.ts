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
  PendingPayment = "pending_payment",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
}

export enum PaymentStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface Payment {
  id: number;
  reservation_id: number;
  status: PaymentStatus;
  amount: number;
  created_at: string;
  updated_at: string;
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
  deposit_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface VenueInput {
  name: string;
  address: string;
  phone: string;
  logo_url?: string | null;
  deposit_required?: boolean;
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
  payment: Payment | null;
  created_at: string;
  updated_at: string;
}

export interface ReservationWithCheckout extends Reservation {
  checkout_url: string | null;
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
