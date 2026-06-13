import Link from 'next/link';
import { Search, MapPin, CalendarDays, ChevronRight, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';
import JobCard from '@/components/ui/JobCard';
import type { Job, Category } from '@/types';

// --- Mock data (replace with real API calls) ---
const MOCK_JOBS: Job[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  slug: `job-${i + 1}`,
  title: [
    'Senior Software Engineer',
    'Marketing Manager',
    'Civil Engineer',
    'Registered Nurse',
    'HR Business Partner',
    'Financial Analyst',
    'IT Support Specialist',
    'Sales Executive',
    'Operations Manager',
    'Graphic Designer',
  ][i],
  company: { id: i + 1, name: ['Emirates Group', 'ADNOC', 'Emaar', 'NMC Health', 'Dubai Holding'][i % 5], slug: 'company', logo: undefined },
  location_city: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Dubai', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Dubai', 'Abu Dhabi', 'Dubai'][i],
  location_country: 'UAE',
  country_code: 'ae',
  salary_min: [8000, 12000, 7000, 9000, 10000, 11000, 5000, 7000, 15000, 5000][i],
  salary_max: [15000, 20000, 12000, 14000, 18000, 16000, 8000, 12000, 25000, 8000][i],
  salary_currency: 'AED',
  job_type: ['full_time', 'full_time', 'contract', 'full_time', 'full_time', 'full_time', 'part_time', 'full_time', 'full_time', 'freelance'][i] as Job['job_type'],
  category: { id: 1, name: 'Technology', slug: 'technology' },
  description: 'Join our dynamic team and grow your career in the Gulf.',
  apply_method: 'email',
  is_sponsored: i === 0 || i === 3,
  is_featured: i === 0 || i === 1,
  is_walk_in: i === 4 || i === 7,
  is_active: true,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

const CATEGORIES: (Category & { icon: string })[] = [
  { id: 1, name: 'Information Technology', slug: 'it', icon: '💻', job_count: 1240 },
  { id: 2, name: 'Engineering', slug: 'engineering', icon: '⚙️', job_count: 980 },
  { id: 3, name: 'Accounting & Finance', slug: 'accounting', icon: '📊', job_count: 760 },
  { id: 4, name: 'Medical & Healthcare', slug: 'medical', icon: '🏥', job_count: 640 },
  { id: 5, name: 'Sales & Marketing', slug: 'sales', icon: '📈', job_count: 820 },
  { id: 6, name: 'HR & Administration', slug: 'hr', icon: '👔', job_count: 430 },
  { id: 7, name: 'Construction', slug: 'construction', icon: '🏗️', job_count: 590 },
  { id: 8, name: 'Hospitality', slug: 'hospitality', icon: '🏨', job_count: 510 },
];

const COUNTRIES = [
  { flag: '🇦🇪', name: 'UAE', code: 'ae', count: 5420 },
  { flag: '🇸🇦', name: 'Saudi Arabia', code: 'sa', count: 3180 },
  { flag: '🇶🇦', name: 'Qatar', code: 'qa', count: 1960 },
  { flag: '🇰🇼', name: 'Kuwait', code: 'kw', count: 1230 },
  { flag: '🇴🇲', name: 'Oman', code: 'om', count: 890 },
  { flag: '🇧🇭', name: 'Bahrain', code: 'bh', count: 670 },
];

const SALARY_GUIDES = [
  { role: 'Software Engineer', min: 10000, max: 30000, currency: 'AED' },
  { role: 'Civil Engineer', min: 8000, max: 20000, currency: 'AED' },
  { role: 'Registered Nurse', min: 6000, max: 16000, currency: 'AED' },
  { role: 'Marketing Manager', min: 12000, max: 28000, currency: 'AED' },
];

export default function HomePage() {
  const featuredJobs = MOCK_JOBS.filter((j) => j.is_featured).slice(0, 6);
  const walkInJobs = MOCK_JOBS.filter((j) => j.is_walk_in);
  const latestJobs = MOCK_JOBS.slice(0, 10);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* 1. Hero */}
        <section className="bg-[#1A3C6E] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Find Your Dream Job in the Gulf
            </h1>
            <p className="text-blue-200 text-base sm:text-lg mb-8">
              Thousands of jobs across UAE, Saudi Arabia, Qatar and more — updated daily.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keyword or company"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white text-sm border-2 border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select className="pl-10 pr-8 py-3 rounded-xl text-gray-900 bg-white text-sm border-2 border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] appearance-none w-full sm:w-44">
                  <option value="">All Countries</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Search Jobs
              </button>
            </form>
            <p className="text-white/70 text-sm mt-4">
              Popular:{' '}
              {['Software Engineer', 'Civil Engineer', 'Nurse', 'Accountant', 'Driver'].map((t, i) => (
                <span key={t}>
                  <a href={`/jobs?q=${encodeURIComponent(t)}`} className="text-[#FF6B35] hover:underline">{t}</a>
                  {i < 4 && ', '}
                </span>
              ))}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* 2. Fraud Notice */}
          <FraudNotice />

          {/* 3. Ad / Product banners placeholder */}
          <div className="bg-gradient-to-r from-[#1A3C6E]/5 to-[#FF6B35]/5 border border-dashed border-gray-300 rounded-xl p-6 text-center text-sm text-gray-500">
            <p className="font-medium">Advertisement Space</p>
            <p className="text-xs mt-1">Google AdSense / Product Banners / WhatsApp CTA</p>
          </div>

          {/* 4. Featured Jobs */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-[#1A3C6E]">Featured Jobs</h2>
              <Link
                href="/jobs?featured=true"
                className="text-sm font-medium text-[#FF6B35] flex items-center gap-1 hover:underline"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredJobs.concat(MOCK_JOBS.slice(0, 4)).slice(0, 6).map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>

          {/* 5. Walk-in Interviews */}
          {walkInJobs.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <CalendarDays className="w-6 h-6 text-[#FF6B35]" />
                <h2 className="text-2xl font-bold text-[#1A3C6E]">Walk-in Interviews</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walkInJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </section>
          )}

          {/* 6. Latest Jobs */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-[#1A3C6E]">Latest Jobs</h2>
              <Link
                href="/jobs"
                className="text-sm font-medium text-[#FF6B35] flex items-center gap-1 hover:underline"
              >
                All jobs <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {latestJobs.map((job) => (
                <JobCard key={job.id} job={job} className="flex-row" />
              ))}
            </div>
            <div className="mt-6 text-center">
              <button className="inline-flex items-center gap-2 border border-[#1A3C6E] text-[#1A3C6E] font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1A3C6E] hover:text-white transition-colors text-sm">
                Load More / Watch Ad to Unlock More
              </button>
            </div>
          </section>

          {/* 7. Browse by Category */}
          <section>
            <h2 className="text-2xl font-bold text-[#1A3C6E] mb-5">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/jobs?category=${cat.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:border-[#1A3C6E] hover:shadow-md transition-all group"
                >
                  <span className="text-3xl block mb-2">{cat.icon}</span>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1A3C6E]">
                    {cat.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{cat.job_count?.toLocaleString()} jobs</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 8. Browse by Country */}
          <section>
            <h2 className="text-2xl font-bold text-[#1A3C6E] mb-5">Browse by Country</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {COUNTRIES.map((c) => (
                <Link
                  key={c.code}
                  href={`/jobs?country=${c.code}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-[#1A3C6E] hover:shadow-md transition-all group"
                >
                  <span className="text-4xl block mb-1">{c.flag}</span>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1A3C6E]">
                    {c.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{c.count.toLocaleString()} jobs</p>
                </Link>
              ))}
            </div>
          </section>

          {/* 9. Salary Guides */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-6 h-6 text-[#FF6B35]" />
              <h2 className="text-2xl font-bold text-[#1A3C6E]">Salary Guides</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SALARY_GUIDES.map((s) => (
                <div
                  key={s.role}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
                >
                  <p className="font-semibold text-gray-900 mb-2">{s.role}</p>
                  <p className="text-lg font-bold text-[#1A3C6E]">
                    {s.currency} {s.min.toLocaleString()} – {s.max.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per month</p>
                  <Link
                    href={`/salary-guide?role=${encodeURIComponent(s.role)}`}
                    className="text-xs text-[#FF6B35] font-medium mt-3 inline-block hover:underline"
                  >
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
