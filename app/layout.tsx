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
      <body className="bg-gray-100">
  <div className="mx-auto max-w-xl lg:max-w-4xl xl:max-w-5xl px-3">
        <Providers>{children}</Providers>
       </div>
</body>
    </html>
  );
}
