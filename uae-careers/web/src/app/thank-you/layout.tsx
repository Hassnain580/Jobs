import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application Submitted — Thank You',
  description: 'Your job application has been received. Explore our CV optimization services to improve your chances of landing an interview.',
  robots: { index: false, follow: false },
};

export default function ThankYouLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
