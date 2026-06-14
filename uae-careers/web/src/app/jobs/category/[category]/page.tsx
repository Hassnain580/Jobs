import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Props {
  params: Promise<{ category: string }>;
}

function toTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const label = toTitle(category);
  return {
    title: `${label} Jobs in UAE | UAE Careers`,
    description: `Browse the latest ${label} job vacancies across UAE — Dubai, Abu Dhabi, Sharjah and all emirates. Apply online today.`,
    alternates: { canonical: `/jobs/category/${category}` },
  };
}

export default async function CategoryJobsPage({ params }: Props) {
  const { category } = await params;
  const label = toTitle(category);

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
            <span className="text-gray-800 font-medium">{label}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-[#1A3C6E] mb-2">{label} Jobs in UAE</h1>
          <p className="text-gray-500 mb-6">Browse the latest {label.toLowerCase()} vacancies across Dubai, Abu Dhabi, Sharjah and all UAE emirates.</p>
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-lg font-medium mb-2">Jobs loading…</p>
            <p className="text-sm">Connect the API to display live {label.toLowerCase()} listings.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
