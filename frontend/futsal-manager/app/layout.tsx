import './globals.css';

import { Inter } from 'next/font/google';
import Navigation from '@/components/Navigation';
import { ThemeProvider } from '@/components/theme-provider';
import content from '../public/content.json';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Navigation translations={content} />
            <main className="flex-1 container mx-auto py-6 px-4">
              {children}
            </main>
            <footer className="border-t py-4 text-center text-sm text-muted-foreground">
              © {new Date().getFullYear()} {content.appName}.{' '}
              {content.footer?.rights}
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
