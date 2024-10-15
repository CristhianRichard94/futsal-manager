'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Navigation({ translations }) {
  return (
    <nav className="border-b bg-primary/10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold flex items-center space-x-2"
        >
          {/* <SoccerBall className="w-6 h-6" /> */}
          <span>{translations.appName}</span>
        </Link>
        <div className="space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/stadiums">{translations.navigation?.stadiums}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/users">{translations.navigation?.users}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/teams">{translations.navigation?.teams}</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/reservations">
              {translations.navigation?.reservations}
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
