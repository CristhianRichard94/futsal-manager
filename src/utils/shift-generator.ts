import { Club } from "../data/club";
import { Shift, ShiftState } from "../data/shift";

export function generateShifts(clubs: Array<Club>) {
  const weekSchedule: Array<Date> = [];
  const weekShifts: Array<Shift> = [];
  const today = new Date(Date.now());
  today.setHours(0, 0, 0, 0);
  for (let index = 0; index < 7; index++) {
    const weekDay = new Date(today.getMilliseconds());
    weekDay.setDate(today.getDate() + index);
    weekSchedule.push(weekDay);
  }

  weekSchedule.forEach((day) => {
    clubs.forEach((club) => {
      for (let hour = club.openHour; hour < club.closingHour; hour++) {
        day.setHours(hour);
        weekShifts.push({
          club,
          date: day,
          id: guidGenerator(),
          price:
            club.prices[club.prices.findIndex((p) => p.hourFrom > hour)]
              ?.amount,
          state: ShiftState.AVAILABLE,
          paid: 0,
          user: null,
        });
      }
    });
  });

  weekShifts.sort(
    (a, b) => a.date.getMilliseconds() - b.date.getMilliseconds()
  );
  return weekShifts;
}

function guidGenerator() {
  var S4 = function () {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };
  return (
    S4() +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    "-" +
    S4() +
    S4() +
    S4()
  );
}
