
import './globals.css';

import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import content from '../public/content/en.json';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Providers from './providers';
const inter = Inter({ subsets: ['latin'] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  const session = await getServerSession();
    const pathname =
      (typeof window === 'undefined' && require('next/navigation').usePathname?.()) ||
      '';
      console.log(`Current pathname: ${pathname} - Session: ${session ? 'exists' : 'does not exist'}`);
      
  // Allow unauthenticated access only to /login
  if (pathname !== '' && !session && typeof window === 'undefined') {
    // On the server, check the pathname

    if (pathname !== '/') {
      redirect('/');
    }
  }

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
            <div className="flex flex-col min-h-screen">
              <Navigation isSignedIn={!!session} />
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
