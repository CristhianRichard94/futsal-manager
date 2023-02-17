import { useState } from "react";
import ShiftList from "../components/ShiftList";
import { Club } from "../data/club";
import { Shift } from "../data/shift";
import { HttpService } from "../utils/httpService";
import { generateShifts } from "../utils/shift-generator";
const ShiftPage = () => {
  const [clubs, setClubs] = useState<Array<Club>>(HttpService.getClubs());
  const [shifts, setShifts] = useState<Array<Shift>>(generateShifts(clubs));
  console.log(shifts);
  return (
    <>
      <ShiftList shifts={shifts} />
    </>
  );
};

export default ShiftPage;
