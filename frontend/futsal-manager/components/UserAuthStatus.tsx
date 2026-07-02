"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Tooltip from "./ui/Tooltip";
import { Button } from "./ui/Button";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  if (session?.user) {
    const userImage = session.user.image || "/favicon.ico";
    return (
      <div className="flex items-center gap-2">
        <Tooltip content={session.user?.name || session.user?.email || ""}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={userImage}
            alt="User Avatar"
            className="w-8 h-8 rounded-full inline-block"
          />
        </Tooltip>
        <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
          Sign out
        </Button>
      </div>
    );
  }
  return (
    <Button variant="outline" size="sm" onClick={() => signIn("google")}>
      Sign in
    </Button>
  );
}
