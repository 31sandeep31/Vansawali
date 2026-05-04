import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'शर्वाणि गोत्रे काफ्ले बन्धुको वंशावली',
  description:
    'Genealogy of the Sharvani-gotra Kafle Brethren — Mansangkot, Waling, Syangja, Nepal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ne">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;500;600;700&family=Tiro+Devanagari+Hindi:ital@0;1&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Crimson+Pro:ital,wght@0,400;0,500;0,600;1,400&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
