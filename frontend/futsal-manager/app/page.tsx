"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { UserRole } from "@/lib/types";

export default function Home() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === UserRole.VenueAdmin;

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Book your futsal field in seconds
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          Browse venues, check real-time availability and reserve a field for
          your next match.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" asChild>
          <Link href="/venues">
            <MapPin className="mr-2 h-4 w-4" />
            Browse Venues
          </Link>
        </Button>

        {status !== "loading" && !session && (
          <Button size="lg" variant="outline" onClick={() => signIn("google")}>
            Sign in with Google
          </Button>
        )}

        {session && (
          <Button size="lg" variant="outline" asChild>
            <Link href="/me/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </Link>
          </Button>
        )}

        {isAdmin && (
          <Button size="lg" variant="secondary" asChild>
            <Link href="/admin/venues">Manage My Venues</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
