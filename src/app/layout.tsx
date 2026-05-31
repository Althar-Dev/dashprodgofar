import type {Metadata} from 'next';
import { Suspense } from 'react';
import './globals.css';
import { MobileNav } from '@/components/layout/MobileNav';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'Rumah Premium | Inventory Command Center',
  description: 'Advanced product management for technical professionals.',
};

function MobileNavFallback() {
  return <div className="fixed bottom-0 left-0 right-0 h-16 bg-background/80 md:hidden" />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen pb-16 md:pb-0">
        {children}
        <Suspense fallback={<MobileNavFallback />}>
          <MobileNav />
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}
