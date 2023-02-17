import { useState } from "react";
import { Shift, ShiftState, ShiftStateLabel } from "../data/shift";

const ShiftList = ({ shifts }: { shifts: Array<Shift> }) => {
  const [pageIndex, setPageIndex] = useState(0);
  return (
    <ul>
      {shifts
        .filter((shift) => shift.state === ShiftState.AVAILABLE)
        .slice(pageIndex * 10, pageIndex * 10 + 9)
        .map((shift) => (
          <li key={shift.id}>
            {shift.club.name}
            {shift.date.toDateString()}
            {shift.date.getHours()} hs ${shift.price}
            {ShiftStateLabel[shift.state]}
          </li>
        ))}
    </ul>
  );
};

export default ShiftList;
