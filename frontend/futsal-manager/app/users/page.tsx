"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import content from "../../public/content.json";
import { useEffect, useState } from "react";
import { User } from "@/lib/types";
import { HttpService } from "@/service/HttpService";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "" });

  useEffect(() => {
    HttpService.getUsers().then((users) => {
      setUsers(users);
    });
  }, []);

  const addUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser }]);
      setNewUser({ name: "", email: "" });
    }
  };

  const deleteUser = (id: number) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{content.users?.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2 mb-4">
          <Input
            placeholder={content.users?.name}
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <Input
            placeholder={content.users?.email}
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <Button onClick={addUser}>{content.users?.addUser}</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{content.users?.name}</TableHead>
              <TableHead>{content.users?.email}</TableHead>
              <TableHead>{content.users?.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => deleteUser(user.id)}
                  >
                    {content.users?.delete}
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
