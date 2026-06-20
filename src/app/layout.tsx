import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EcoPlus | Intelligent Carbon Mitigation',
  description: 'Track, simulate, and optimize your environmental footprint using interactive real-time data and Gemini AI.',
  keywords: 'carbon footprint, sustainability, gemini ai, calculator',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Ensure lang="en" is present for screen reader language targeting
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}