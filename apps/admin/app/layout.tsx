import '@/app/globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { Sidebar } from '@/components/sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
