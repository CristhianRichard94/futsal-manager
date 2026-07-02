"use client";

import { Button } from "@/components/ui/Button";
import UserAuthStatus from "@/components/UserAuthStatus";
import Link from "next/link";
import { Session } from "next-auth";
import { useTranslations } from "next-intl";
import { UserRole } from "@/lib/types";

export default function Navigation({ session }: { session: Session | null }) {
  const isAdmin = session?.user?.role === UserRole.VenueAdmin;
  const t = useTranslations("nav");

  return (
    <nav className="border-b bg-primary/10">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold flex items-center space-x-2"
        >
          <span>Canchitapp</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/venues">{t("venues")}</Link>
          </Button>
          {session && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/me/bookings">{t("myBookings")}</Link>
              </Button>
              {isAdmin && (
                <Button variant="ghost" asChild>
                  <Link href="/admin/venues">{t("myVenues")}</Link>
                </Button>
              )}
            </>
          )}

          <UserAuthStatus />
        </div>
      </div>
    </nav>
  );
}
