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

type Team = {
  id: number;
  name: string;
  coach: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: 'Red Dragons', coach: 'Mike Johnson' },
    { id: 2, name: 'Blue Sharks', coach: 'Sarah Williams' },
  ]);
  const [newTeam, setNewTeam] = useState({ name: '', coach: '' });

  const addTeam = () => {
    if (newTeam.name && newTeam.coach) {
      setTeams([...teams, { id: Date.now(), ...newTeam }]);
      setNewTeam({ name: '', coach: '' });
    }
  };

  const deleteTeam = (id: number) => {
    setTeams(teams.filter((team) => team.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.teams?.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder={content.teams?.name}
            value={newTeam.name}
            onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
          />
          <Input
            placeholder={content.teams?.coach}
            value={newTeam.coach}
            onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
          />
          <Button onClick={addTeam}>{content.teams?.addTeam}</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{content.teams?.name}</TableHead>
              <TableHead>{content.teams?.coach}</TableHead>
              <TableHead>{content.teams?.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team) => (
              <TableRow key={team.id}>
                <TableCell>{team.name}</TableCell>
                <TableCell>{team.coach}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => deleteTeam(team.id)}
                  >
                    {content.teams?.delete}
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
