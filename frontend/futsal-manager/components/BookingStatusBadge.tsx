'use client';

import { useTranslations } from 'next-intl';

import { Badge } from '@/components/ui/Badge';
import { Reservation, ReservationStatus } from '@/lib/types';

export type BookingDisplayStatus =
  | 'Upcoming'
  | 'Past'
  | 'Cancelled'
  | 'PendingPayment';

export function getBookingDisplayStatus(
  reservation: Reservation
): BookingDisplayStatus {
  if (reservation.status === ReservationStatus.Cancelled) return 'Cancelled';
  if (reservation.status === ReservationStatus.PendingPayment)
    return 'PendingPayment';
  const isPast = new Date(reservation.end_time).getTime() < Date.now();
  return isPast ? 'Past' : 'Upcoming';
}

export default function BookingStatusBadge({
  status,
}: {
  status: BookingDisplayStatus;
}) {
  const t = useTranslations('bookingStatus');
  const variant =
    status === 'Upcoming'
      ? 'default'
      : status === 'Cancelled'
        ? 'destructive'
        : status === 'PendingPayment'
          ? 'outline'
          : 'secondary';
  return <Badge variant={variant}>{t(status)}</Badge>;
}
