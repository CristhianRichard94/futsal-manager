"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";

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
      buckets[getBookingDisplayStatus(r)].push(r);
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
      return <EmptyState title="Nothing here" description="No bookings in this category." />;
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
                <p className="text-sm text-muted-foreground">Field #{r.field_id}</p>
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
                        Cancel
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will free up the slot for others to book. This
                          action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Keep booking</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleCancel(r.id)}>
                          Yes, cancel
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
      <h1 className="text-3xl font-bold">My Bookings</h1>

      {error && <ErrorBanner message="Failed to load your bookings." onRetry={load} />}

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
              Upcoming ({grouped.Upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">Past ({grouped.Past.length})</TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({grouped.Cancelled.length})
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
