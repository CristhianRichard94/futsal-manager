import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

import { Calendar } from 'lucide-react';
import Link from 'next/link';
import content from '../public/content/en.json';

export default function Dashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-6 h-6" />
            <span>{content.dashboard?.stadiums.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{content.dashboard?.stadiums.description}</p>
          <Link
            href="/stadiums"
            className="text-primary hover:underline mt-2 inline-block"
          >
            {content.dashboard?.stadiums.link}
          </Link>
        </CardContent>
      </Card>
      {/* <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>{content.dashboard?.users.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{content.dashboard?.users.description}</p>
          <Link
            href="/users"
            className="text-primary hover:underline mt-2 inline-block"
          >
            {content.dashboard?.users.link}
          </Link>
        </CardContent>
      </Card> */}
      {/* <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            <span>{content.dashboard?.teams.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{content.dashboard?.teams.description}</p>
          <Link
            href="/teams"
            className="text-primary hover:underline mt-2 inline-block"
          >
            {content.dashboard?.teams.link}
          </Link>
        </CardContent>
      </Card> */}
      <Card className="bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-6 h-6" />
            <span>{content.dashboard?.reservations.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{content.dashboard?.reservations.description}</p>
          <Link
            href="/reservations"
            className="text-primary hover:underline mt-2 inline-block"
          >
            {content.dashboard?.reservations.link}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
