"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";
import BookingStatusBadge, {
  getBookingDisplayStatus,
} from "@/components/BookingStatusBadge";
import { HttpService } from "@/service/HttpService";
import { Reservation } from "@/lib/types";

export default function MyBookingsPage() {
  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const t = useTranslations("myBookings");

  const load = () => {
    setLoading(true);
    setError(false);
    HttpService.getReservations()
      .then((data) => setReservations(data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const grouped = useMemo(() => {
    const buckets: Record<"Upcoming" | "Past" | "Cancelled", Reservation[]> = {
      Upcoming: [],
      Past: [],
      Cancelled: [],
    };
    (reservations ?? []).forEach((r) => {
      const status = getBookingDisplayStatus(r);
      // Reservations awaiting a Mercado Pago deposit payment still hold the
      // slot and can still be cancelled by the player, so they're grouped
      // with "Upcoming" here; BookingStatusBadge still shows the distinct
      // "Pending payment" badge on the card itself.
      buckets[status === "PendingPayment" ? "Upcoming" : status].push(r);
    });
    return buckets;
  }, [reservations]);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await HttpService.cancelReservation(id);
      load();
    } catch {
      setError(true);
    } finally {
      setCancellingId(null);
    }
  };

  const renderList = (items: Reservation[], allowCancel: boolean) => {
    if (items.length === 0) {
      return <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />;
    }
    return (
      <div className="space-y-3">
        {items.map((r) => (
          <Card key={r.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <div>
                <p className="font-medium">
                  {format(new Date(r.start_time), "PPP")} ·{" "}
                  {format(new Date(r.start_time), "HH:mm")}–
                  {format(new Date(r.end_time), "HH:mm")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("fieldLabel", { id: r.field_id })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <BookingStatusBadge status={getBookingDisplayStatus(r)} />
                {allowCancel && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={cancellingId === r.id}
                      >
                        {t("cancel")}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("cancelDialogTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("cancelDialogDescription")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t("keepBooking")}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancel(r.id)}>
                          {t("yesCancel")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {error && <ErrorBanner message={t("loadError")} onRetry={load} />}

      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {!loading && !error && reservations && (
        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              {t("upcoming", { count: grouped.Upcoming.length })}
            </TabsTrigger>
            <TabsTrigger value="past">
              {t("past", { count: grouped.Past.length })}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              {t("cancelled", { count: grouped.Cancelled.length })}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {renderList(grouped.Upcoming, true)}
          </TabsContent>
          <TabsContent value="past">{renderList(grouped.Past, false)}</TabsContent>
          <TabsContent value="cancelled">
            {renderList(grouped.Cancelled, false)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
