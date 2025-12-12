import './globals.css';
import type { ReactNode } from 'react';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'LinkedIn Clone',
  description: 'LinkedIn-style app',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
