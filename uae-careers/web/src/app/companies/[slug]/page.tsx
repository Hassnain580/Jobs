import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface Props {
  params: Promise<{ slug: string }>;
}

function toTitle(slug: string) {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const name = toTitle(slug);
  return {
    title: `${name} Jobs & Careers | UAE Careers`,
    description: `Explore open positions at ${name}. View company profile, active job listings, and apply online through UAE Careers.`,
    alternates: { canonical: `/companies/${slug}` },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const name = toTitle(slug);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-5xl mx-auto text-xs text-gray-500 flex gap-2 items-center">
            <Link href="/" className="hover:text-[#1A3C6E]">Home</Link>
            <span>›</span>
            <Link href="/companies" className="hover:text-[#1A3C6E]">Companies</Link>
            <span>›</span>
            <span className="text-gray-800 font-medium">{name}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8">
          {/* Company header */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-xl bg-[#1A3C6E] text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A3C6E]">{name}</h1>
              <p className="text-sm text-gray-500 mt-1">Company profile and job listings</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400">
            <p className="text-lg font-medium mb-2">Profile loading…</p>
            <p className="text-sm">Connect the API to display {name} details and active jobs.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
