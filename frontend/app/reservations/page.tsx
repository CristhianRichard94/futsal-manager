import { redirect } from "next/navigation";

// The legacy mock reservations page referenced backend routes that no longer
// exist. It is superseded by /me/bookings (player) and
// /admin/venues/[id]/bookings (venue admin) in the MVP.
export default function ReservationsRedirect() {
  redirect("/me/bookings");
}
