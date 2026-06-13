'use client';

import { useState } from 'react';

type JobStatus = 'pending' | 'approved' | 'rejected' | 'expired';

interface Job {
  id: number;
  title: string;
  employer: string;
  category: string;
  country: string;
  status: JobStatus;
  created: string;
  views: number;
}

const MOCK_JOBS: Job[] = [
  { id: 1, title: 'Senior Software Engineer', employer: 'Tech Corp Dubai', category: 'IT', country: 'UAE', status: 'pending', created: '2026-06-12', views: 0 },
  { id: 2, title: 'Marketing Manager', employer: 'Gulf Media', category: 'Marketing', country: 'KSA', status: 'approved', created: '2026-06-11', views: 342 },
  { id: 3, title: 'Financial Analyst', employer: 'Emirates Bank', category: 'Finance', country: 'UAE', status: 'approved', created: '2026-06-11', views: 521 },
  { id: 4, title: 'HR Coordinator', employer: 'Majid Al Futtaim', category: 'HR', country: 'UAE', status: 'rejected', created: '2026-06-10', views: 0 },
  { id: 5, title: 'Sales Executive', employer: 'Noon.com', category: 'Sales', country: 'UAE', status: 'pending', created: '2026-06-10', views: 0 },
  { id: 6, title: 'Civil Engineer', employer: 'Aldar Properties', category: 'Engineering', country: 'UAE', status: 'approved', created: '2026-06-09', views: 789 },
  { id: 7, title: 'Graphic Designer', employer: 'Publicis ME', category: 'Design', country: 'UAE', status: 'pending', created: '2026-06-09', views: 0 },
  { id: 8, title: 'Operations Manager', employer: 'DP World', category: 'Operations', country: 'UAE', status: 'expired', created: '2026-05-01', views: 1204 },
  { id: 9, title: 'Data Scientist', employer: 'G42', category: 'IT', country: 'UAE', status: 'approved', created: '2026-06-08', views: 432 },
  { id: 10, title: 'Nurse - ICU', employer: 'Cleveland Clinic Abu Dhabi', category: 'Healthcare', country: 'UAE', status: 'pending', created: '2026-06-07', views: 0 },
];

const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string }> = {
  pending: { label: 'Pending', classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', classes: 'bg-gray-100 text-gray-600' },
};

const CATEGORIES = ['All', 'IT', 'Marketing', 'Finance', 'HR', 'Sales', 'Engineering', 'Design', 'Operations', 'Healthcare'];
const COUNTRIES = ['All', 'UAE', 'KSA', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];
const PAGE_SIZE = 6;

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.employer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || j.status === statusFilter.toLowerCase();
    const matchCat = categoryFilter === 'All' || j.category === categoryFilter;
    const matchCountry = countryFilter === 'All' || j.country === countryFilter;
    return matchSearch && matchStatus && matchCat && matchCountry;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelect = (id: number) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected(selected.length === paginated.length ? [] : paginated.map((j) => j.id));

  const updateStatus = (id: number, status: JobStatus) => {
    setLoading(true);
    setTimeout(() => {
      setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));
      setLoading(false);
    }, 400);
  };

  const deleteJob = (id: number) => {
    if (confirm('Delete this job?')) setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const bulkApprove = () => {
    setJobs((prev) => prev.map((j) => (selected.includes(j.id) ? { ...j, status: 'approved' } : j)));
    setSelected([]);
  };

  const bulkReject = () => {
    setJobs((prev) => prev.map((j) => (selected.includes(j.id) ? { ...j, status: 'rejected' } : j)));
    setSelected([]);
  };

  const bulkDelete = () => {
    if (confirm(`Delete ${selected.length} selected jobs?`)) {
      setJobs((prev) => prev.filter((j) => !selected.includes(j.id)));
      setSelected([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Search title or employer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          >
            {['All', 'Pending', 'Approved', 'Rejected', 'Expired'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={countryFilter}
            onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          >
            {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1A3C6E]/5 border border-[#1A3C6E]/20 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-[#1A3C6E]">{selected.length} selected</span>
          <button onClick={bulkApprove} className="rounded px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Approve All</button>
          <button onClick={bulkReject} className="rounded px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200">Reject All</button>
          <button onClick={bulkDelete} className="rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Delete All</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Jobs <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
          </h3>
          <button className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
            + Add Job
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === paginated.length && paginated.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400">No jobs found.</td>
                </tr>
              ) : (
                paginated.map((job, i) => (
                  <tr
                    key={job.id}
                    className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  >
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(job.id)} onChange={() => toggleSelect(job.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px] truncate">{job.title}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{job.employer}</td>
                    <td className="px-4 py-3 text-gray-600">{job.category}</td>
                    <td className="px-4 py-3 text-gray-600">{job.country}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[job.status].classes}`}>
                        {STATUS_CONFIG[job.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{job.created}</td>
                    <td className="px-4 py-3 text-gray-600">{job.views.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {job.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(job.id, 'approved')}
                              disabled={loading}
                              className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(job.id, 'rejected')}
                              disabled={loading}
                              className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        <button className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">
                          Edit
                        </button>
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200"
                        >
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">
              Page {page} of {totalPages} · {filtered.length} results
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`rounded px-3 py-1.5 text-xs font-medium border ${
                    p === page
                      ? 'bg-[#1A3C6E] border-[#1A3C6E] text-white'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
