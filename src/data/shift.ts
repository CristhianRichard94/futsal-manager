import { Club } from "./club";
import { User } from "./user";

export interface Shift {
  id: string;
  date: Date;
  user?: User;
  club: Club;
  price: number;
  paid?: number;
  state: ShiftState;
}

export enum ShiftState {
  AVAILABLE = "AVAILABLE",
  RESERVED = "RESERVED",
  PREPAID = "PREPAID",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export enum ShiftStateLabel {
  AVAILABLE = "Disponible",
  RESERVED = "Reservado",
  PREPAID = "Señado",
  INPROGRESS = "En progreso",
  COMPLETED = "Completado",
  CANCELED = "Cancelado",
}
