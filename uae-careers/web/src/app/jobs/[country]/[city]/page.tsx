import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Props {
  params: Promise<{ country: string; city: string }>;
}

function toTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, city } = await params;
  const cityLabel = toTitle(city);
  const countryLabel = toTitle(country);
  return {
    title: `Jobs in ${cityLabel}, ${countryLabel} | UAE Careers`,
    description: `Find the latest job vacancies in ${cityLabel}, ${countryLabel}. Full-time, part-time, and contract roles across all industries.`,
    alternates: { canonical: `/jobs/${country}/${city}` },
  };
}

export default async function LocationJobsPage({ params }: Props) {
  const { country, city } = await params;
  const cityLabel = toTitle(city);
  const countryLabel = toTitle(country);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-5xl mx-auto text-xs text-gray-500 flex gap-2 items-center">
            <Link href="/" className="hover:text-[#1A3C6E]">Home</Link>
            <span>›</span>
            <Link href="/jobs" className="hover:text-[#1A3C6E]">Jobs</Link>
            <span>›</span>
            <span className="capitalize">{countryLabel}</span>
            <span>›</span>
            <span className="text-gray-800 font-medium">{cityLabel}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#1A3C6E] mb-2">Jobs in {cityLabel}, {countryLabel}</h1>
          <p className="text-gray-500 mb-6">Latest job vacancies in {cityLabel}. Search full-time, part-time, and contract roles across all industries.</p>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-lg font-medium mb-2">Jobs loading…</p>
            <p className="text-sm">Connect the API to display live listings for {cityLabel}.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
