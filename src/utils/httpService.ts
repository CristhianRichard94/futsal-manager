import { Club } from "../data/club";
import { Shift, ShiftState } from "../data/shift";

export class HttpService {
  static getClubs(): Array<Club> {
    return JSON.parse(localStorage.getItem("clubs"));
  }

  static getShifts(): Array<Shift> {
    return JSON.parse(localStorage.getItem("shifts"));
  }

  static addClub(club: Club): string {
    club.id = `${Date.now()}`;
    const clubs = (
      JSON.parse(localStorage.getItem("clubs")) as Array<Club>
    ).push(club);
    localStorage.setItem("clubs", JSON.stringify(clubs));
    return club.id;
  }
  static makeReservation(shift: Shift, prepaidAmount?: number) {
    const shifts = JSON.parse(localStorage.getItem("shifts")) as Array<Shift>;
    const resultShift = shifts.find((s) => s.id === shift.id);
    if (resultShift) {
      resultShift.state = prepaidAmount
        ? ShiftState.PREPAID
        : ShiftState.RESERVED;
      if (prepaidAmount) {
        resultShift.paid = prepaidAmount;
      }
      localStorage.setItem("shifts", JSON.stringify(shifts));
    }
  }
}
