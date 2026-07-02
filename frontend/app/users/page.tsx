import { redirect } from "next/navigation";

// The legacy mock user-management page referenced backend routes that no
// longer exist. There is no equivalent MVP page (users are managed via
// Google sign-in only), so redirect home instead of breaking the build.
export default function UsersRedirect() {
  redirect("/");
}
