import { Badge } from '@/components/ui/Badge';
import { Reservation, ReservationStatus } from '@/lib/types';

export type BookingDisplayStatus = 'Upcoming' | 'Past' | 'Cancelled';

export function getBookingDisplayStatus(
  reservation: Reservation
): BookingDisplayStatus {
  if (reservation.status === ReservationStatus.Cancelled) return 'Cancelled';
  const isPast = new Date(reservation.end_time).getTime() < Date.now();
  return isPast ? 'Past' : 'Upcoming';
}

export default function BookingStatusBadge({
  status,
}: {
  status: BookingDisplayStatus;
}) {
  const variant =
    status === 'Upcoming'
      ? 'default'
      : status === 'Cancelled'
        ? 'destructive'
        : 'secondary';
  return <Badge variant={variant}>{status}</Badge>;
}
