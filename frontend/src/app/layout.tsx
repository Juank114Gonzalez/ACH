import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/common/Providers';

export const metadata: Metadata = {
  title: { default: 'ACH Finance', template: '%s | ACH Finance' },
  description: 'Personal finance management platform',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
