"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/Popover";
import { Calendar } from "@/components/ui/Calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import ErrorBanner from "@/components/ErrorBanner";
import SizeBadge from "@/components/SizeBadge";
import TimeSlotGrid, { TimeSlot } from "@/components/TimeSlotGrid";
import { HttpService } from "@/service/HttpService";
import { Availability, Field, Venue } from "@/lib/types";

// The date picker's `date` value is a local Date whose y/m/d components are
// used verbatim as the "UTC calendar day" identifier sent to the backend.
// This keeps the date param, the availability query (backend/routers/fields.py)
// and the slot grid (TimeSlotGrid.buildTimeSlots, which builds UTC instants
// from these same y/m/d components) all referring to the same UTC day,
// decoupled from the browser's local timezone.
function toUTCDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function BookingContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { status: sessionStatus } = useSession();

  const [fields, setFields] = useState<Field[] | null>(null);
  const [fieldsError, setFieldsError] = useState(false);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    searchParams.get("field")
  );
  const [date, setDate] = useState<Date>(new Date());
  const [availability, setAvailability] = useState<Availability[] | null>(null);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const t = useTranslations("book");

  useEffect(() => {
    HttpService.getVenue(params.id).then(setVenue).catch(() => {});
    HttpService.getVenueFields(params.id)
      .then((data) => {
        setFields(data);
        if (!selectedFieldId && data.length > 0) {
          setSelectedFieldId(String(data[0].id));
        }
      })
      .catch(() => setFieldsError(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadAvailability = () => {
    if (!selectedFieldId) return;
    setAvailabilityLoading(true);
    setAvailabilityError(false);
    setSelectedSlot(null);
    HttpService.getFieldAvailability(selectedFieldId, toUTCDateInput(date))
      .then((data) => setAvailability(data))
      .catch(() => setAvailabilityError(true))
      .finally(() => setAvailabilityLoading(false));
  };

  useEffect(() => {
    loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldId, date]);

  const selectedField = useMemo(
    () => fields?.find((f) => String(f.id) === selectedFieldId) ?? null,
    [fields, selectedFieldId]
  );

  const handleConfirm = async () => {
    if (!selectedFieldId || !selectedSlot) return;
    setConfirming(true);
    setConfirmError(null);
    try {
      const reservation = await HttpService.createReservation({
        field_id: Number(selectedFieldId),
        start_time: selectedSlot.start.toISOString(),
        end_time: selectedSlot.end.toISOString(),
      });
      if (reservation.checkout_url) {
        window.location.href = reservation.checkout_url;
        return;
      }
      setSuccess(true);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response
        ?.status;
      if (status === 409) {
        setConfirmError(t("slotTakenError"));
        setSelectedSlot(null);
        loadAvailability();
      } else if (status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`
        );
      } else {
        setConfirmError(t("genericConfirmError"));
      }
    } finally {
      setConfirming(false);
    }
  };

  if (sessionStatus === "unauthenticated") {
    router.push(
      `/login?callbackUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`
    );
    return null;
  }

  if (success && selectedField && selectedSlot) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h1 className="text-2xl font-bold">{t("confirmedTitle")}</h1>
        <p className="text-muted-foreground">
          {t("confirmedDetails", {
            field: selectedField.name,
            date: format(date, "PPP"),
            time: selectedSlot.label,
          })}
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <a href="/me/bookings">{t("viewMyBookings")}</a>
          </Button>
          <Button variant="outline" asChild>
            <a href={`/venues/${params.id}`}>{t("backToVenue")}</a>
          </Button>
        </div>
      </div>
    );
  }

  if (fieldsError) {
    return (
      <ErrorBanner
        message={t("loadFieldsError")}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!fields) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <div className="flex flex-wrap gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium">{t("field")}</label>
            <Select
              value={selectedFieldId ?? undefined}
              onValueChange={(value) => setSelectedFieldId(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectField")} />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={String(field.id)}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t("date")}</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(date, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {selectedField && (
          <div className="space-y-2">
            {selectedField.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedField.image_url}
                alt={selectedField.name}
                className="h-40 w-full rounded-md object-cover"
              />
            )}
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedField.name}</span>
              <SizeBadge size={selectedField.size} />
            </div>
          </div>
        )}

        {availabilityError && (
          <ErrorBanner
            message={t("loadAvailabilityError")}
            onRetry={loadAvailability}
          />
        )}

        {availabilityLoading && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        )}

        {!availabilityLoading && !availabilityError && availability && (
          <p className="text-xs text-muted-foreground">
            {t("utcNotice")}
          </p>
        )}

        {!availabilityLoading && !availabilityError && availability && (
          <TimeSlotGrid
            date={date}
            bookedRanges={availability}
            selectedStart={selectedSlot?.start ?? null}
            onSelect={setSelectedSlot}
          />
        )}
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            {venue?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={venue.logo_url}
                alt={venue.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <CardTitle>{t("summary")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">{t("venueLabel")}</span>
              <span className="font-medium">
                {venue?.name ?? t("venueValue", { id: params.id })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("fieldLabel")}</span>
              <span className="font-medium">
                {selectedField?.name ?? t("noSelection")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("dateLabel")}</span>
              <span className="font-medium">{format(date, "PPP")}</span>
            </div>
            <div>
              <span className="text-muted-foreground">{t("timeLabel")}</span>
              <span className="font-medium">
                {selectedSlot ? selectedSlot.label : t("selectTimeSlot")}
              </span>
            </div>

            {confirmError && <ErrorBanner message={confirmError} />}

            <Button
              className="w-full"
              disabled={!selectedSlot || confirming}
              onClick={handleConfirm}
            >
              {confirming ? t("confirming") : t("confirmBooking")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <BookingContent />
    </Suspense>
  );
}
