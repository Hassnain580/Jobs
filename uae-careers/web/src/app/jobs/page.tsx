'use client';

import { useState, useCallback } from 'react';
import { SlidersHorizontal, Search, ChevronLeft, ChevronRight, PlayCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';
import JobCard from '@/components/ui/JobCard';
import { cn } from '@/lib/utils';
import type { Job } from '@/types';

// Mock data
const MOCK_JOBS: Job[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  slug: `job-${i + 1}`,
  title: [
    'Senior Software Engineer', 'Marketing Manager', 'Civil Engineer', 'Registered Nurse',
    'HR Business Partner', 'Financial Analyst', 'IT Support Specialist', 'Sales Executive',
    'Operations Manager', 'Graphic Designer', 'Project Manager', 'Business Analyst',
    'QA Engineer', 'DevOps Engineer', 'Data Scientist', 'UX Designer',
    'Customer Service Rep', 'Supply Chain Manager', 'Legal Counsel', 'Risk Analyst',
  ][i],
  company: {
    id: i + 1,
    name: ['Emirates Group', 'ADNOC', 'Emaar', 'NMC Health', 'Dubai Holding',
      'Etisalat', 'DEWA', 'DP World', 'Majid Al Futtaim', 'First Abu Dhabi Bank'][i % 10],
    slug: 'company',
    logo: undefined,
  },
  location_city: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Dubai', 'Abu Dhabi',
    'Dubai', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Dubai',
    'Abu Dhabi', 'Dubai', 'Sharjah', 'Dubai', 'Abu Dhabi',
    'Dubai', 'Sharjah', 'Abu Dhabi', 'Dubai', 'Abu Dhabi'][i],
  location_country: 'UAE',
  country_code: 'ae',
  salary_min: 5000 + i * 500,
  salary_max: 10000 + i * 1000,
  salary_currency: 'AED',
  job_type: (['full_time', 'full_time', 'contract', 'full_time', 'part_time',
    'full_time', 'contract', 'full_time', 'full_time', 'freelance',
    'full_time', 'full_time', 'contract', 'full_time', 'full_time',
    'full_time', 'part_time', 'full_time', 'contract', 'full_time'] as Job['job_type'][])[i],
  category: { id: (i % 8) + 1, name: 'Technology', slug: 'technology' },
  description: 'Join our team.',
  apply_method: 'email',
  is_sponsored: i % 5 === 0,
  is_featured: i < 3,
  is_walk_in: i % 6 === 0,
  is_active: true,
  created_at: new Date(Date.now() - i * 3600000).toISOString(),
  updated_at: new Date().toISOString(),
}));

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
const EXPERIENCE_LEVELS = ['Entry Level', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];
const CATEGORIES = ['IT & Technology', 'Engineering', 'Accounting', 'Medical', 'HR', 'Sales', 'Construction', 'Hospitality'];
const SORT_OPTIONS = ['Newest First', 'Salary: High to Low', 'Salary: Low to High', 'Most Relevant'];

const JOBS_BEFORE_AD_GATE = 5;

export default function JobsPage() {
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    category: '',
    jobType: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    walkIn: false,
  });
  const [sort, setSort] = useState('Newest First');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [adsWatched, setAdsWatched] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const JOBS_PER_PAGE = 10;
  const totalPages = Math.ceil(MOCK_JOBS.length / JOBS_PER_PAGE);
  const pagedJobs = MOCK_JOBS.slice((page - 1) * JOBS_PER_PAGE, page * JOBS_PER_PAGE);

  const updateFilter = useCallback((key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const showAdGate = !adsWatched && pagedJobs.length > JOBS_BEFORE_AD_GATE;
  const visibleJobs = showAdGate ? pagedJobs.slice(0, JOBS_BEFORE_AD_GATE) : pagedJobs;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Search bar */}
        <div className="bg-[#1A3C6E] py-6 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Job title, keyword or company"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-white border-2 border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-gray-400"
              />
            </div>
            <button className="bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
              Search
            </button>
            <button
              className="sm:hidden flex items-center gap-2 bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <FraudNotice />

          <div className="flex gap-6 mt-6">
            {/* Sidebar filters */}
            <aside
              className={cn(
                'w-64 flex-shrink-0 space-y-5',
                'hidden sm:block',
                sidebarOpen && '!block'
              )}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 sticky top-20">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1A3C6E]" /> Filters
                </h3>

                {/* Country */}
                <FilterGroup label="Country">
                  <select
                    className="filter-select"
                    value={filters.city}
                    onChange={(e) => updateFilter('city', e.target.value)}
                  >
                    <option value="">All Emirates</option>
                    {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </FilterGroup>

                {/* Category */}
                <FilterGroup label="Category">
                  <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(e) => updateFilter('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FilterGroup>

                {/* Job Type */}
                <FilterGroup label="Job Type">
                  <div className="space-y-1.5">
                    {JOB_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                          type="radio"
                          name="jobType"
                          value={type}
                          checked={filters.jobType === type}
                          onChange={(e) => updateFilter('jobType', e.target.value)}
                          className="accent-[#1A3C6E]"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                {/* Experience */}
                <FilterGroup label="Experience">
                  <select
                    className="filter-select"
                    value={filters.experience}
                    onChange={(e) => updateFilter('experience', e.target.value)}
                  >
                    <option value="">Any Level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </FilterGroup>

                {/* Salary range */}
                <FilterGroup label="Salary (AED/month)">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.salaryMin}
                      onChange={(e) => updateFilter('salaryMin', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.salaryMax}
                      onChange={(e) => updateFilter('salaryMax', e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]"
                    />
                  </div>
                </FilterGroup>

                {/* Walk-in toggle */}
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.walkIn}
                    onChange={(e) => updateFilter('walkIn', e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1A3C6E]"
                  />
                  Walk-in Interviews Only
                </label>

                <button
                  onClick={() => setFilters({ country: '', city: '', category: '', jobType: '', experience: '', salaryMin: '', salaryMax: '', walkIn: false })}
                  className="w-full text-xs text-gray-500 hover:text-red-500 underline text-left mt-2"
                >
                  Clear all filters
                </button>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Sort bar */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Showing <strong>{MOCK_JOBS.length.toLocaleString()}</strong> jobs
                </p>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1A3C6E]"
                >
                  {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Jobs list */}
              <div className="space-y-3">
                {visibleJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Rewarded ad gate */}
              {showAdGate && (
                <div className="my-6 bg-[#1A3C6E] rounded-xl p-8 text-center text-white">
                  <PlayCircle className="w-12 h-12 mx-auto mb-3 text-[#FF6B35]" />
                  <h3 className="text-xl font-bold mb-2">Watch a Short Ad to Unlock More Jobs</h3>
                  <p className="text-blue-200 text-sm mb-5">
                    {MOCK_JOBS.length - JOBS_BEFORE_AD_GATE} more jobs available — watch a 30-second ad to access them for free.
                  </p>
                  <button
                    onClick={() => setAdsWatched(true)}
                    className="bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
                  >
                    Watch Ad &amp; Unlock Jobs
                  </button>
                  <p className="text-xs text-blue-300 mt-3">Or <a href="/auth/register" className="underline">create a free account</a> to skip ads</p>
                </div>
              )}

              {/* Pagination */}
              {(adsWatched || !showAdGate) && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={cn(
                        'w-9 h-9 rounded-lg text-sm font-medium transition-colors',
                        p === page
                          ? 'bg-[#1A3C6E] text-white'
                          : 'border border-gray-200 text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
