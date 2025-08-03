"use client";

import { Button } from "@/components/ui/Button";
import UserAuthStatus from "@/components/UserAuthStatus";
import Link from "next/link";
import content from "../public/content/en.json";
import { Session } from "next-auth";

export default function Navigation({ session }: { session: Session | null }) {
  return (
    <nav className="border-b bg-primary/10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold flex items-center space-x-2"
        >
          {/* <SoccerBall className="w-6 h-6" /> */}
          <span>{content.appName}</span>
        </Link>
        <div className="space-x-4">
          {session && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/stadiums">{content.navigation?.stadiums}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/users">{content.navigation?.users}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/teams">{content.navigation?.teams}</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/reservations">
                  {content.navigation?.reservations}
                </Link>
              </Button>
            </>
          )}

          <UserAuthStatus />
        </div>
      </div>
    </nav>
  );
}
