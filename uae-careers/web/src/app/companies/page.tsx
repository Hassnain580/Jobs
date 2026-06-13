import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Top Companies Hiring in GCC | UAE Careers',
  description: 'Browse top companies hiring across UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain.',
};

const COMPANIES = [
  { name: 'Emirates Group', industry: 'Aviation', country: 'UAE', jobs: 142, logo: '✈️' },
  { name: 'ADNOC', industry: 'Oil & Gas', country: 'UAE', jobs: 98, logo: '🛢️' },
  { name: 'Emaar Properties', industry: 'Real Estate', country: 'UAE', jobs: 67, logo: '🏗️' },
  { name: 'NMC Health', industry: 'Healthcare', country: 'UAE', jobs: 55, logo: '🏥' },
  { name: 'Saudi Aramco', industry: 'Oil & Gas', country: 'Saudi Arabia', jobs: 211, logo: '⚡' },
  { name: 'STC Group', industry: 'Telecom', country: 'Saudi Arabia', jobs: 88, logo: '📡' },
  { name: 'Qatar Airways', industry: 'Aviation', country: 'Qatar', jobs: 134, logo: '✈️' },
  { name: 'QatarEnergy', industry: 'Energy', country: 'Qatar', jobs: 76, logo: '🔋' },
  { name: 'Kuwait Petroleum', industry: 'Oil & Gas', country: 'Kuwait', jobs: 45, logo: '🛢️' },
  { name: 'Oman Oil Company', industry: 'Oil & Gas', country: 'Oman', jobs: 38, logo: '⛽' },
  { name: 'Bapco', industry: 'Energy', country: 'Bahrain', jobs: 29, logo: '🔥' },
  { name: 'Dubai Holding', industry: 'Conglomerate', country: 'UAE', jobs: 91, logo: '🏙️' },
];

export default function CompaniesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <section className="bg-[#1A3C6E] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Top Companies Hiring Now</h1>
            <p className="text-blue-200">Discover the best employers across the Gulf region</p>
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
                  <span className="text-sm text-gray-500">🌍 {company.country}</span>
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
