import "./globals.css";

import Navigation from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import content from "../public/content/en.json";
import Providers from "./providers";
import { HttpService } from "@/service/HttpService";
import { User } from "@/lib/types";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Futsal Manager",
  description: "Manage your futsal games, teams, and reservations with ease.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  console.log(session);

  const user = (await HttpService.getUserByEmail(
    session?.user?.email || ""
  )) as User;

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session} user={user}>
          <div className="flex flex-col min-h-screen">
            <Navigation session={session} />
            <main className="flex-1 container mx-auto py-6 px-4">
              {children}
            </main>
            <footer className="border-t py-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {content.appName}.
              {content.footer?.rights}
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
