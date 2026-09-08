import type { Metadata } from 'next';
import '../global.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ChatFlow - Real-Time Chat & Platform Showcase',
  description:
    'Production-grade real-time chat application with Socket.io, Redux Toolkit, complete API documentation, creative landing page, and thought process write-up.',
  openGraph: {
    title: 'ChatFlow - Real-Time Chat & Platform Showcase',
    description:
      'Production-grade real-time chat application with Socket.io, Redux Toolkit, complete API documentation, creative landing page, and thought process write-up.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
