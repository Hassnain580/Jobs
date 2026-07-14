'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SlidersHorizontal, Search, MessageCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';
import { cn } from '@/lib/utils';

const EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
const JOB_TYPES = ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'];
const EXPERIENCE_LEVELS = ['Entry Level', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];
const CATEGORIES = ['IT & Technology', 'Engineering', 'Accounting', 'Medical', 'HR', 'Sales', 'Construction', 'Hospitality'];
const SORT_OPTIONS = ['Newest First', 'Salary: High to Low', 'Salary: Low to High', 'Most Relevant'];

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filters, setFilters] = useState({
    city: searchParams.get('city') || '',
    category: searchParams.get('category') || '',
    jobType: '',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    walkIn: false,
  });
  const [sort, setSort] = useState('Newest First');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    const city = searchParams.get('city') || '';
    const category = searchParams.get('category') || '';
    setSearch(q);
    setFilters((prev) => ({ ...prev, city, category }));
  }, [searchParams]);

  const updateFilter = useCallback((key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  function handleSearch() {
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (filters.city) params.set('city', filters.city);
    if (filters.category) params.set('category', filters.category);
    router.push(`/jobs?${params.toString()}`);
  }

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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-white border-2 border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
            >
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
            <aside className={cn('w-64 flex-shrink-0 space-y-5 hidden sm:block', sidebarOpen && '!block')}>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5 sticky top-20">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#1A3C6E]" /> Filters
                </h3>

                <FilterGroup label="Emirate">
                  <select className="filter-select w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]" value={filters.city} onChange={(e) => updateFilter('city', e.target.value)}>
                    <option value="">All Emirates</option>
                    {EMIRATES.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Category">
                  <select className="filter-select w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]" value={filters.category} onChange={(e) => updateFilter('category', e.target.value)}>
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Job Type">
                  <div className="space-y-1.5">
                    {JOB_TYPES.map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input type="radio" name="jobType" value={type} checked={filters.jobType === type} onChange={(e) => updateFilter('jobType', e.target.value)} className="accent-[#1A3C6E]" />
                        {type}
                      </label>
                    ))}
                  </div>
                </FilterGroup>

                <FilterGroup label="Experience">
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]" value={filters.experience} onChange={(e) => updateFilter('experience', e.target.value)}>
                    <option value="">Any Level</option>
                    {EXPERIENCE_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </FilterGroup>

                <FilterGroup label="Salary (AED/month)">
                  <div className="flex gap-2">
                    <input type="number" placeholder="Min" value={filters.salaryMin} onChange={(e) => updateFilter('salaryMin', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]" />
                    <input type="number" placeholder="Max" value={filters.salaryMax} onChange={(e) => updateFilter('salaryMax', e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-[#1A3C6E]" />
                  </div>
                </FilterGroup>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filters.walkIn} onChange={(e) => updateFilter('walkIn', e.target.checked)} className="w-4 h-4 rounded accent-[#1A3C6E]" />
                  Walk-in Interviews Only
                </label>

                <button onClick={() => setFilters({ city: '', category: '', jobType: '', experience: '', salaryMin: '', salaryMax: '', walkIn: false })} className="w-full text-xs text-gray-500 hover:text-red-500 underline text-left mt-2">
                  Clear all filters
                </button>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Showing <strong>0</strong> jobs</p>
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1A3C6E]">
                  {SORT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              {/* Empty state */}
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs available yet</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto">
                  We&apos;re adding jobs daily. Join our free WhatsApp channel to get notified the moment new jobs go live.
                </p>
                <a
                  href="https://wa.me/971556650797?text=Hi%2C+I%27d+like+to+receive+daily+UAE+job+alerts"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#1da851] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> Get Notified on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="flex flex-col min-h-screen bg-gray-50"><div className="flex-1 flex items-center justify-center"><p className="text-gray-400">Loading jobs…</p></div></div>}>
      <JobsContent />
    </Suspense>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</label>
      {children}
    </div>
  );
}
