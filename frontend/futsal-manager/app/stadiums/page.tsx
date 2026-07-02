import { redirect } from "next/navigation";

// The legacy mock "stadiums" concept has been replaced by /venues + /fields
// in the FastAPI-backed MVP. Kept as a redirect so old links/bookmarks still
// resolve instead of 404ing or breaking the build against removed backend
// routes.
export default function StadiumsRedirect() {
  redirect("/venues");
}
