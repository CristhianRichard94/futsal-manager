import "./globals.css";

import Navigation from "@/components/Navigation";
import { getServerSession } from "next-auth";
import { Inter } from "next/font/google";
import Providers from "./providers";
import { authOptions } from "@/lib/authOptions";

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
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <div className="flex flex-col min-h-screen">
            <Navigation session={session} />
            <main className="flex-1 container mx-auto py-6 px-4">
              {children}
            </main>
            <footer className="border-t py-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} Futsal Manager. All rights
              reserved.
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
