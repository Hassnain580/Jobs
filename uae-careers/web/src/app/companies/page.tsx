import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Companies Hiring in UAE | UAE Careers',
  description: 'Browse top companies hiring across UAE — Dubai, Abu Dhabi, Sharjah and all emirates.',
};

const COMPANIES = [
  { name: 'Emirates Group', industry: 'Aviation', city: 'Dubai', jobs: 142, logo: '✈️' },
  { name: 'ADNOC', industry: 'Oil & Gas', city: 'Abu Dhabi', jobs: 98, logo: '🛢️' },
  { name: 'Emaar Properties', industry: 'Real Estate', city: 'Dubai', jobs: 67, logo: '🏗️' },
  { name: 'NMC Health', industry: 'Healthcare', city: 'Abu Dhabi', jobs: 55, logo: '🏥' },
  { name: 'Dubai Holding', industry: 'Conglomerate', city: 'Dubai', jobs: 91, logo: '🏙️' },
  { name: 'Etisalat (e&)', industry: 'Telecom', city: 'Abu Dhabi', jobs: 74, logo: '📡' },
  { name: 'DEWA', industry: 'Utilities', city: 'Dubai', jobs: 62, logo: '⚡' },
  { name: 'DP World', industry: 'Logistics', city: 'Dubai', jobs: 83, logo: '🚢' },
  { name: 'Majid Al Futtaim', industry: 'Retail', city: 'Dubai', jobs: 119, logo: '🛍️' },
  { name: 'First Abu Dhabi Bank', industry: 'Banking', city: 'Abu Dhabi', jobs: 58, logo: '🏦' },
  { name: 'Aldar Properties', industry: 'Real Estate', city: 'Abu Dhabi', jobs: 43, logo: '🏢' },
  { name: 'Dubai Municipality', industry: 'Government', city: 'Dubai', jobs: 37, logo: '🏛️' },
];

export default function CompaniesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <section className="bg-[#1A3C6E] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Top Companies Hiring in UAE</h1>
            <p className="text-blue-200">Discover the best employers across Dubai, Abu Dhabi, Sharjah and all emirates</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COMPANIES.map((company) => (
              <div key={company.name} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                    {company.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.industry}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">📍 {company.city}, UAE</span>
                  <a
                    href={`/jobs?company=${encodeURIComponent(company.name)}`}
                    className="text-sm font-semibold text-[#FF6B35] hover:underline"
                  >
                    {company.jobs} open jobs →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
