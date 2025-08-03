"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Session } from "next-auth";
import { usePathname, redirect } from "next/navigation";
import { UserProvider } from "@/custom-hooks/userContext";
import { User } from "@/lib/types";

export default function Providers({
  children,
  session,
  user,
}: {
  children: React.ReactNode;
  session: Session | null;
  user: User;
}) {
  const pathname = usePathname() || "";
  console.log(usePathname());

  console.log(
    `Current pathname: ${pathname} - Session: ${
      session ? "exists" : "does not exist"
    }`
  );

  if (
    pathname !== "" &&
    pathname !== "/" &&
    !session &&
    typeof window === "undefined"
  ) {
    redirect("/");
  }

  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <UserProvider initialUser={user}>{children}</UserProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
