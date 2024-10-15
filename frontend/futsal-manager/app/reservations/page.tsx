'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToastProvider, useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import content from '../../public/content.json';
import { useState } from 'react';

export default function ReservationsPage() {
  const [reservation, setReservation] = useState({
    stadium: '',
    date: '',
    time: '',
    team: '',
  });
  const { showToast } = useToast();

  const stadiums = ['Futsal Arena', 'Soccer City'];
  const teams = ['Red Dragons', 'Blue Sharks'];

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send this data to your backend
    console.log('Reservation made:', reservation);
    showToast({
      title: content.reservations?.success,
      description: content.reservations?.successMessage
        .replace('{stadium}', reservation.stadium)
        .replace('{team}', reservation.team)
        .replace('{date}', reservation.date)
        .replace('{time}', reservation.time),
    });
    setReservation({ stadium: '', date: '', time: '', team: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.reservations?.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ToastProvider>
          <form onSubmit={handleReservation} className="space-y-4">
            <Select
              value={reservation.stadium}
              onValueChange={(value) =>
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
                  <SelectItem key={stadium} value={stadium}>
                    {stadium}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={reservation.date}
              onChange={(e) =>
                setReservation({ ...reservation, date: e.target.value })
              }
            />
            <Input
              type="time"
              value={reservation.time}
              onChange={(e) =>
                setReservation({ ...reservation, time: e.target.value })
              }
            />
            <Select
              value={reservation.team}
              onValueChange={(value) =>
                setReservation({ ...reservation, team: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={content.reservations?.selectTeam} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">
              {content.reservations?.makeReservation}
            </Button>
          </form>
        </ToastProvider>
      </CardContent>
    </Card>
  );
}
