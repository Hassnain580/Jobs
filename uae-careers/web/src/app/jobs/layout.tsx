import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Jobs in UAE — Dubai, Abu Dhabi & All Emirates',
  description: 'Search and filter UAE jobs by location, category, salary, and job type. Find the latest openings in Dubai, Abu Dhabi, Sharjah and beyond.',
  openGraph: {
    title: 'Browse Jobs in UAE',
    description: 'Find the latest job openings across all UAE emirates.',
    url: 'https://uaecareer.ae/jobs',
    images: [{ url: 'https://uaecareer.ae/og-image.png', width: 1200, height: 630 }],
  },
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
