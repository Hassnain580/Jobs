'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type JobStatus = 'pending' | 'approved' | 'rejected' | 'expired';
type JobType = 'full_time' | 'part_time' | 'contract' | 'freelance';

interface Job {
  id: number;
  title: string;
  employer: string;
  category: string;
  country: string;
  city: string;
  job_type: JobType;
  salary_min: string;
  salary_max: string;
  description: string;
  apply_method: string;
  apply_contact: string;
  is_featured: boolean;
  is_walk_in: boolean;
  status: JobStatus;
  expiry_date: string;
  created: string;
  views: number;
}

function resolveStatus(status: JobStatus, expiry_date: string): JobStatus {
  if (status === 'approved' && expiry_date && new Date(expiry_date) < new Date()) return 'expired';
  return status;
}

function defaultExpiry() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

const EMPTY_JOB: Omit<Job, 'id' | 'created' | 'views'> = {
  title: '',
  employer: '',
  category: 'IT',
  country: 'UAE',
  city: '',
  job_type: 'full_time',
  salary_min: '',
  salary_max: '',
  description: '',
  apply_method: 'email',
  apply_contact: '',
  is_featured: false,
  is_walk_in: false,
  status: 'pending',
  expiry_date: defaultExpiry(),
};

const MOCK_JOBS: Job[] = [
  { id: 1, title: 'Senior Software Engineer', employer: 'Tech Corp Dubai', category: 'IT', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '15000', salary_max: '25000', description: '', apply_method: 'email', apply_contact: 'hr@techcorp.ae', is_featured: true, is_walk_in: false, status: 'pending', expiry_date: '2026-07-12', created: '2026-06-12', views: 0 },
  { id: 2, title: 'Marketing Manager', employer: 'Global Media UAE', category: 'Marketing', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '12000', salary_max: '20000', description: '', apply_method: 'email', apply_contact: 'jobs@globalmediauae.com', is_featured: false, is_walk_in: false, status: 'approved', expiry_date: '2026-07-11', created: '2026-06-11', views: 342 },
  { id: 3, title: 'Financial Analyst', employer: 'Emirates Bank', category: 'Finance', country: 'UAE', city: 'Abu Dhabi', job_type: 'full_time', salary_min: '10000', salary_max: '16000', description: '', apply_method: 'email', apply_contact: 'careers@emiratesbank.ae', is_featured: false, is_walk_in: false, status: 'approved', expiry_date: '2026-05-01', created: '2026-06-11', views: 521 },
  { id: 4, title: 'HR Coordinator', employer: 'Majid Al Futtaim', category: 'HR', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '7000', salary_max: '10000', description: '', apply_method: 'email', apply_contact: 'hr@maf.ae', is_featured: false, is_walk_in: false, status: 'rejected', expiry_date: '2026-07-10', created: '2026-06-10', views: 0 },
  { id: 5, title: 'Sales Executive', employer: 'Noon.com', category: 'Sales', country: 'UAE', city: 'Dubai', job_type: 'full_time', salary_min: '6000', salary_max: '9000', description: '', apply_method: 'link', apply_contact: 'https://noon.com/careers', is_featured: false, is_walk_in: false, status: 'pending', expiry_date: '2026-07-10', created: '2026-06-10', views: 0 },
  { id: 6, title: 'Civil Engineer', employer: 'Aldar Properties', category: 'Engineering', country: 'UAE', city: 'Abu Dhabi', job_type: 'contract', salary_min: '10000', salary_max: '18000', description: '', apply_method: 'email', apply_contact: 'recruitment@aldar.com', is_featured: false, is_walk_in: false, status: 'approved', expiry_date: '2026-07-09', created: '2026-06-09', views: 789 },
];

const STATUS_CONFIG: Record<JobStatus, { label: string; classes: string }> = {
  pending:  { label: 'Pending',  classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700' },
  expired:  { label: 'Expired',  classes: 'bg-gray-100 text-gray-600' },
};

const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract',  label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
];

const CATEGORIES = ['IT', 'Marketing', 'Finance', 'HR', 'Sales', 'Engineering', 'Design', 'Operations', 'Healthcare', 'Education', 'Hospitality', 'Construction'];
const COUNTRIES = ['UAE'];
const PAGE_SIZE = 10;

function InputRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const cls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]';

interface JobFormProps {
  initial: Omit<Job, 'id' | 'created' | 'views'>;
  onSave: (data: Omit<Job, 'id' | 'created' | 'views'>) => void;
  onClose: () => void;
  title: string;
}

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function JobModal({ initial, onSave, onClose, title }: JobFormProps) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1A3C6E]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputRow label="Job Title *">
              <input className={cls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Senior Developer" />
            </InputRow>
            <InputRow label="Employer / Company *">
              <input className={cls} value={form.employer} onChange={(e) => set('employer', e.target.value)} placeholder="e.g. Emirates Group" />
            </InputRow>
            <InputRow label="Category">
              <select className={cls} value={form.category} onChange={(e) => set('category', e.target.value)}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </InputRow>
            <InputRow label="Job Type">
              <select className={cls} value={form.job_type} onChange={(e) => set('job_type', e.target.value as JobType)}>
                {JOB_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </InputRow>
            <InputRow label="Country">
              <select className={cls} value={form.country} onChange={(e) => set('country', e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </InputRow>
            <InputRow label="City">
              <input className={cls} value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Dubai" />
            </InputRow>
            <InputRow label="Salary Min (AED)">
              <input className={cls} type="number" value={form.salary_min} onChange={(e) => set('salary_min', e.target.value)} placeholder="e.g. 8000" />
            </InputRow>
            <InputRow label="Salary Max (AED)">
              <input className={cls} type="number" value={form.salary_max} onChange={(e) => set('salary_max', e.target.value)} placeholder="e.g. 15000" />
            </InputRow>
            <InputRow label="Apply Method">
              <select className={cls} value={form.apply_method} onChange={(e) => set('apply_method', e.target.value)}>
                <option value="email">Email</option>
                <option value="phone">Phone / WhatsApp</option>
                <option value="link">External Link</option>
                <option value="walk_in">Walk-in</option>
              </select>
            </InputRow>
            <InputRow label="Apply Contact (email / URL / phone)">
              <input className={cls} value={form.apply_contact} onChange={(e) => set('apply_contact', e.target.value)} placeholder="hr@company.ae" />
            </InputRow>
            <InputRow label="Status">
              <select className={cls} value={form.status} onChange={(e) => set('status', e.target.value as JobStatus)}>
                {(Object.keys(STATUS_CONFIG) as JobStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </InputRow>
            <InputRow label="Expiry Date *">
              <input
                className={cls}
                type="date"
                value={form.expiry_date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => set('expiry_date', e.target.value)}
              />
              {form.expiry_date && (
                <p className={`text-xs mt-1 ${daysUntil(form.expiry_date) <= 7 ? 'text-red-500' : daysUntil(form.expiry_date) <= 14 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {daysUntil(form.expiry_date) < 0
                    ? '⚠ Already expired — job will be unpublished'
                    : daysUntil(form.expiry_date) === 0
                    ? '⚠ Expires today'
                    : `Expires in ${daysUntil(form.expiry_date)} day${daysUntil(form.expiry_date) !== 1 ? 's' : ''}`}
                </p>
              )}
            </InputRow>
            <div className="flex items-center gap-6 pt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => set('is_featured', e.target.checked)} className="rounded" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={form.is_walk_in} onChange={(e) => set('is_walk_in', e.target.checked)} className="rounded" />
                Walk-in Interview
              </label>
            </div>
          </div>
          <InputRow label="Job Description">
            <textarea
              className={`${cls} min-h-[120px] resize-y`}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe responsibilities, requirements, benefits..."
            />
          </InputRow>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={() => {
              if (!form.title.trim() || !form.employer.trim()) {
                alert('Title and Employer are required.');
                return;
              }
              onSave(form);
            }}
            className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-medium text-white hover:bg-[#0d2444]"
          >
            Save Job
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [selected, setSelected] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; job?: Job } | null>(null);

  // Auto-expire approved jobs past their expiry_date on each render
  const jobsWithExpiry = jobs.map((j) => ({ ...j, status: resolveStatus(j.status, j.expiry_date) }));

  const filtered = jobsWithExpiry.filter((j) => {
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

  const updateStatus = (id: number, status: JobStatus) =>
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status } : j)));

  const deleteJob = (id: number) => {
    if (confirm('Delete this job?')) setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const bulkApprove = () => { setJobs((prev) => prev.map((j) => selected.includes(j.id) ? { ...j, status: 'approved' } : j)); setSelected([]); };
  const bulkReject  = () => { setJobs((prev) => prev.map((j) => selected.includes(j.id) ? { ...j, status: 'rejected' } : j)); setSelected([]); };
  const bulkDelete  = () => { if (confirm(`Delete ${selected.length} jobs?`)) { setJobs((prev) => prev.filter((j) => !selected.includes(j.id))); setSelected([]); } };

  const handleSave = (data: Omit<Job, 'id' | 'created' | 'views'>) => {
    if (modal?.mode === 'add') {
      const newJob: Job = { ...data, id: Date.now(), created: new Date().toISOString().slice(0, 10), views: 0 };
      setJobs((prev) => [newJob, ...prev]);
    } else if (modal?.job) {
      setJobs((prev) => prev.map((j) => j.id === modal.job!.id ? { ...j, ...data } : j));
    }
    setModal(null);
  };

  return (
    <div className="space-y-4">
      {/* Modal */}
      {modal && (
        <JobModal
          title={modal.mode === 'add' ? 'Add New Job' : 'Edit Job'}
          initial={modal.job ? { title: modal.job.title, employer: modal.job.employer, category: modal.job.category, country: modal.job.country, city: modal.job.city, job_type: modal.job.job_type, salary_min: modal.job.salary_min, salary_max: modal.job.salary_max, description: modal.job.description, apply_method: modal.job.apply_method, apply_contact: modal.job.apply_contact, is_featured: modal.job.is_featured, is_walk_in: modal.job.is_walk_in, status: modal.job.status, expiry_date: modal.job.expiry_date } : EMPTY_JOB}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

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
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]">
            {['All', 'Pending', 'Approved', 'Rejected', 'Expired'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]">
            {['All', ...CATEGORIES].map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={countryFilter} onChange={(e) => { setCountryFilter(e.target.value); setPage(1); }} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]">
            {['All', ...COUNTRIES].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1A3C6E]/5 border border-[#1A3C6E]/20 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-[#1A3C6E]">{selected.length} selected</span>
          <button onClick={bulkApprove} className="rounded px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Approve All</button>
          <button onClick={bulkReject}  className="rounded px-3 py-1 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200">Reject All</button>
          <button onClick={bulkDelete}  className="rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Delete All</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Jobs <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
          </h3>
          <button
            onClick={() => setModal({ mode: 'add' })}
            className="rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a24] transition-colors"
          >
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Expires</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Views</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-400">No jobs found.</td>
                </tr>
              ) : (
                paginated.map((job, i) => (
                  <tr key={job.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(job.id)} onChange={() => toggleSelect(job.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px]">
                      <div className="truncate">{job.title}</div>
                      {job.is_featured && <span className="text-[10px] bg-[#FFB400]/20 text-[#b37e00] px-1.5 py-0.5 rounded font-medium">Featured</span>}
                      {job.is_walk_in && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium ml-1">Walk-in</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate">{job.employer}</td>
                    <td className="px-4 py-3 text-gray-600">{job.category}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{job.city ? `${job.city}, ` : ''}{job.country}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[job.status].classes}`}>
                        {STATUS_CONFIG[job.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {job.expiry_date ? (
                        <span className={daysUntil(job.expiry_date) < 0 ? 'text-gray-400 line-through' : daysUntil(job.expiry_date) <= 7 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {job.expiry_date}
                          {daysUntil(job.expiry_date) >= 0 && daysUntil(job.expiry_date) <= 7 && (
                            <span className="block text-[10px] text-red-500">{daysUntil(job.expiry_date)}d left</span>
                          )}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{job.views.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {job.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(job.id, 'approved')} className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">✓</button>
                            <button onClick={() => updateStatus(job.id, 'rejected')} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">✗</button>
                          </>
                        )}
                        <button onClick={() => setModal({ mode: 'edit', job })} className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">Edit</button>
                        <button onClick={() => deleteJob(job.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
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
            <span className="text-xs text-gray-500">Page {page} of {totalPages} · {filtered.length} results</span>
            <div className="flex gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`rounded px-3 py-1.5 text-xs font-medium border ${p === page ? 'bg-[#1A3C6E] border-[#1A3C6E] text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
