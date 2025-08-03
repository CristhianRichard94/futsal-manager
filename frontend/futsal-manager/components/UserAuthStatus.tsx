import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import Tooltip from "./ui/Tooltip";

export default function AuthStatus() {
  const { data: session } = useSession();

  if (session?.user) {
    const userImage = session.user.image || "/favicon.ico";
    return (
      <>
        <Tooltip content={session.user?.name || session.user?.email || ""}>
          <Image
            src={userImage}
            alt="User Avatar"
            className="w-8 h-8 rounded-full inline-block mr-2"
          />
        </Tooltip>
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
}
