import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'UAE Careers — Find Jobs in UAE, Saudi Arabia, Qatar & Gulf',
    template: '%s | UAE Careers',
  },
  description:
    'Search thousands of jobs in UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain. Find walk-in interviews, featured jobs and salary guides.',
  keywords: ['UAE jobs', 'Gulf jobs', 'Dubai jobs', 'jobs in UAE', 'walk-in interview UAE'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://uaecareer.ae',
    siteName: 'UAE Careers',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-gray-50 text-gray-900 overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
