"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
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
import ForbiddenPage from "@/components/ForbiddenPage";
import BookingStatusBadge, {
  getBookingDisplayStatus,
} from "@/components/BookingStatusBadge";
import { HttpService } from "@/service/HttpService";
import { Field, Reservation } from "@/lib/types";

export default function AdminVenueBookingsPage() {
  const params = useParams<{ id: string }>();

  const [reservations, setReservations] = useState<Reservation[] | null>(null);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const t = useTranslations("adminBookings");

  const load = () => {
    setLoading(true);
    setError(false);
    setForbidden(false);
    Promise.all([
      HttpService.getReservations(params.id),
      HttpService.getVenueFields(params.id),
    ])
      .then(([reservationsData, fieldsData]) => {
        setReservations(reservationsData);
        setFields(fieldsData);
      })
      .catch((err) => {
        if (err?.response?.status === 403) setForbidden(true);
        else setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const filtered = useMemo(() => {
    return (reservations ?? []).filter((r) => {
      if (fieldFilter !== "all" && String(r.field_id) !== fieldFilter) return false;
      if (fromDate && new Date(r.start_time) < new Date(fromDate)) return false;
      if (toDate && new Date(r.start_time) > new Date(`${toDate}T23:59:59`)) return false;
      return true;
    });
  }, [reservations, fieldFilter, fromDate, toDate]);

  const fieldName = (fieldId: number) =>
    fields?.find((f) => f.id === fieldId)?.name ?? t("fieldFallback", { id: fieldId });

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

  if (forbidden) return <ForbiddenPage />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      {error && <ErrorBanner message={t("loadError")} onRetry={load} />}

      {loading && !error && <Skeleton className="h-64 w-full" />}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">{t("field")}</label>
              <Select value={fieldFilter} onValueChange={setFieldFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("allFields")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allFields")}</SelectItem>
                  {fields?.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("from")}</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t("to")}</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 && (
            <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
          )}

          {filtered.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("player")}</TableHead>
                      <TableHead>{t("fieldColumn")}</TableHead>
                      <TableHead>{t("date")}</TableHead>
                      <TableHead>{t("time")}</TableHead>
                      <TableHead>{t("status")}</TableHead>
                      <TableHead>{t("actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => {
                      const status = getBookingDisplayStatus(r);
                      return (
                        <TableRow key={r.id}>
                          <TableCell>
                            <div className="font-medium">{r.user.name}</div>
                            <div className="text-xs text-muted-foreground">{r.user.email}</div>
                          </TableCell>
                          <TableCell>{fieldName(r.field_id)}</TableCell>
                          <TableCell>{format(new Date(r.start_time), "PPP")}</TableCell>
                          <TableCell>
                            {format(new Date(r.start_time), "HH:mm")}–
                            {format(new Date(r.end_time), "HH:mm")}
                          </TableCell>
                          <TableCell>
                            <BookingStatusBadge status={status} />
                          </TableCell>
                          <TableCell>
                            {status === "Upcoming" && (
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
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile stacked cards */}
              <div className="space-y-3 md:hidden">
                {filtered.map((r) => {
                  const status = getBookingDisplayStatus(r);
                  return (
                    <Card key={r.id}>
                      <CardContent className="space-y-2 pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{r.user.name}</p>
                            <p className="text-xs text-muted-foreground">{r.user.email}</p>
                          </div>
                          <BookingStatusBadge status={status} />
                        </div>
                        <p className="text-sm text-muted-foreground">{fieldName(r.field_id)}</p>
                        <p className="text-sm">
                          {format(new Date(r.start_time), "PPP")} ·{" "}
                          {format(new Date(r.start_time), "HH:mm")}–
                          {format(new Date(r.end_time), "HH:mm")}
                        </p>
                        {status === "Upcoming" && (
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
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
