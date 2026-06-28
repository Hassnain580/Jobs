import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Optimization Service — ATS-Ready CVs for UAE Jobs',
  description: 'Professional CV writing and optimization by UAE recruitment experts. ATS-optimized CVs starting at AED 40. Delivered in 48 hours via WhatsApp.',
  openGraph: {
    title: 'CV Optimization Service — Land 3× More Interviews',
    description: 'ATS-ready CVs for UAE jobs, starting at AED 40. 48-hour delivery.',
    url: 'https://uaecareer.ae/cv-service',
    images: [{ url: 'https://uaecareer.ae/og-image.png', width: 1200, height: 630 }],
  },
};

export default function CvServiceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
