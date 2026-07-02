"use client";

import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { UserRole } from "@/lib/types";

export default function Home() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === UserRole.VenueAdmin;
  const t = useTranslations("home");

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mx-auto max-w-xl text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button size="lg" asChild>
          <Link href="/venues">
            <MapPin className="mr-2 h-4 w-4" />
            {t("browseVenues")}
          </Link>
        </Button>

        {status !== "loading" && !session && (
          <Button size="lg" variant="outline" onClick={() => signIn("google")}>
            {t("signInWithGoogle")}
          </Button>
        )}

        {session && (
          <Button size="lg" variant="outline" asChild>
            <Link href="/me/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              {t("myBookings")}
            </Link>
          </Button>
        )}

        {isAdmin && (
          <Button size="lg" variant="secondary" asChild>
            <Link href="/admin/venues">{t("manageMyVenues")}</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
