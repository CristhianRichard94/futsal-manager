"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastProvider, useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import content from "../../public/content.json";
import { useEffect, useState } from "react";
import { Reservation, Stadium } from "@/lib/types";
import { HttpService } from "@/service/HttpService";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Array<Reservation>>();
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [reservation, setReservation] = useState<Reservation>({
    datetime: "",
    id: 0,
    stadium: { id: 0, address: "", name: "", phone: 0 },
    user: { id: 0, email: "", name: "", phone: 0 },
  });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // const { showToast } = useToast();
  useEffect(() => {
    HttpService.getReservations().then((reservations) => {
      setReservations(reservations);
    });
  }, []);

  useEffect(() => {
    HttpService.getStadiums().then((stadiums) => {
      setStadiums(stadiums);
    });
  }, []);

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(date, time);

    HttpService.addReservation({
      stadiumId: reservation.stadium.id,
      datetime: date + "//" + time,
      userId: reservation.user.id,
    }).then((newReservation) => {
      console.log("Reservation made:", reservation);
      const [d, t] = newReservation.datetime.split("//");
      showToast({
        title: content.reservations?.success,
        description: content.reservations?.successMessage
          .replace("{stadium}", newReservation.stadium.name)
          .replace("{date}", d)
          .replace("{time}", t),
      });
    });
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>{content.reservations?.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ToastProvider>
            <span></span>
          </ToastProvider>

          <form onSubmit={handleReservation} className="space-y-4">
            <Select
              value={reservation?.stadium}
              onValueChange={(value: Stadium) =>
                setReservation({ ...reservation, stadium: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={content.reservations?.selectStadium}
                />
              </SelectTrigger>
              <SelectContent>
                {stadiums.map((stadium) => (
                  <span key={stadium.name}>
                    <SelectItem key={stadium.name} value={stadium.name}>
                      {stadium.name}
                    </SelectItem>
                  </span>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
            <Button type="submit">
              {content.reservations?.makeReservation}
            </Button>
          </form>
        </CardContent>
      </Card>
      {reservations?.map((r) => (
        <span key={r.datetime}>
          {r.user.name + r.stadium.name + r.datetime}
        </span>
      ))}
    </div>
  );
}
function showToast(arg0: { title: string; description: string }) {
  throw new Error("Function not implemented.");
}
