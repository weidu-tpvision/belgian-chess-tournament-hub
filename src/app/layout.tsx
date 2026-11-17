import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Belgian Chess Tournament Hub — Youth & Mixed Open Calendar, Map & Planner',
  description:
    'Complete aggregator, interactive map, and tournament planner for Belgian chess tournaments across FRBE-KBSB-KSB, Vlaamse Schaakfederatie (Jeugdschaakcriterium), FEFB (Circuit JEF), SVDB, and Chess-Results BEL.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
