'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import content from '../../public/content.json';
import { useState } from 'react';

type Stadium = {
  id: number;
  name: string;
  location: string;
};

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[]>([
    { id: 1, name: 'Futsal Arena', location: 'Downtown' },
    { id: 2, name: 'Soccer City', location: 'Uptown' },
  ]);
  const [newStadium, setNewStadium] = useState({ name: '', location: '' });

  const addStadium = () => {
    if (newStadium.name && newStadium.location) {
      setStadiums([...stadiums, { id: Date.now(), ...newStadium }]);
      setNewStadium({ name: '', location: '' });
    }
  };

  const deleteStadium = (id: number) => {
    setStadiums(stadiums.filter((stadium) => stadium.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.stadiums?.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder={content.stadiums?.name}
            value={newStadium.name}
            onChange={(e) =>
              setNewStadium({ ...newStadium, name: e.target.value })
            }
          />
          <Input
            placeholder={content.stadiums?.location}
            value={newStadium.location}
            onChange={(e) =>
              setNewStadium({ ...newStadium, location: e.target.value })
            }
          />
          <Button onClick={addStadium}>{content.stadiums?.addStadium}</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{content.stadiums?.name}</TableHead>
              <TableHead>{content.stadiums?.location}</TableHead>
              <TableHead>{content.stadiums?.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stadiums.map((stadium) => (
              <TableRow key={stadium.id}>
                <TableCell>{stadium.name}</TableCell>
                <TableCell>{stadium.location}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => deleteStadium(stadium.id)}
                  >
                    {content.stadiums?.delete}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
