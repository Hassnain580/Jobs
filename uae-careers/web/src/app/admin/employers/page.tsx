'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

type EmployerStatus = 'active' | 'pending' | 'suspended';

interface Employer {
  id: number;
  company: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  industry: string;
  website: string;
  description: string;
  jobs_posted: number;
  jobs_active: number;
  status: EmployerStatus;
  joined: string;
  verified: boolean;
}

const INDUSTRIES = ['Aviation', 'Oil & Gas', 'Real Estate', 'Healthcare', 'Technology', 'Finance', 'E-Commerce', 'Logistics', 'Retail', 'Media', 'Education', 'Hospitality', 'Construction', 'Manufacturing', 'Consulting'];
const COUNTRIES = ['UAE'];

const MOCK: Employer[] = [
  { id: 1, company: 'Emirates Group', contact_name: 'Fatima Al Rashid', email: 'recruit@emirates.ae', phone: '+971 4 712 5000', country: 'UAE', industry: 'Aviation', website: 'https://emirates.com', description: 'Global airline and aviation services group based in Dubai.', jobs_posted: 24, jobs_active: 8, status: 'active', joined: '2026-01-10', verified: true },
  { id: 2, company: 'ADNOC', contact_name: 'Mohammed Al Mazrouei', email: 'careers@adnoc.ae', phone: '+971 2 707 0000', country: 'UAE', industry: 'Oil & Gas', website: 'https://adnoc.ae', description: 'Abu Dhabi National Oil Company — leading energy company.', jobs_posted: 18, jobs_active: 5, status: 'active', joined: '2026-01-15', verified: true },
  { id: 3, company: 'Emaar Properties', contact_name: 'Sarah Johnson', email: 'hr@emaar.ae', phone: '+971 4 367 3333', country: 'UAE', industry: 'Real Estate', website: 'https://emaar.com', description: 'Leading real estate developer behind Burj Khalifa and Downtown Dubai.', jobs_posted: 12, jobs_active: 3, status: 'active', joined: '2026-02-01', verified: true },
  { id: 4, company: 'NMC Health', contact_name: 'Anil Sharma', email: 'jobs@nmc.ae', phone: '+971 2 633 2255', country: 'UAE', industry: 'Healthcare', website: 'https://nmchealth.com', description: 'Largest private healthcare provider in the UAE.', jobs_posted: 9, jobs_active: 4, status: 'pending', joined: '2026-03-10', verified: false },
  { id: 5, company: 'Global Media UAE', contact_name: 'Omar Al-Qassim', email: 'hr@globalmediauae.com', phone: '+971 4 456 7890', country: 'UAE', industry: 'Media', website: 'https://globalmediauae.com', description: 'Leading media and broadcasting company in Dubai, UAE.', jobs_posted: 6, jobs_active: 2, status: 'active', joined: '2026-02-20', verified: true },
  { id: 6, company: 'Noon.com', contact_name: 'Priya Patel', email: 'talent@noon.com', phone: '+971 4 200 1234', country: 'UAE', industry: 'E-Commerce', website: 'https://noon.com', description: "Middle East's homegrown e-commerce marketplace.", jobs_posted: 15, jobs_active: 7, status: 'active', joined: '2026-01-28', verified: true },
  { id: 7, company: 'Aldar Properties', contact_name: 'Khalid Al-Hosani', email: 'recruit@aldar.com', phone: '+971 2 810 5555', country: 'UAE', industry: 'Real Estate', website: 'https://aldar.com', description: "Abu Dhabi's largest real estate developer.", jobs_posted: 8, jobs_active: 1, status: 'suspended', joined: '2026-02-14', verified: false },
  { id: 8, company: 'DP World', contact_name: 'James Richardson', email: 'careers@dpworld.com', phone: '+971 4 881 5555', country: 'UAE', industry: 'Logistics', website: 'https://dpworld.com', description: 'Global smart end-to-end supply chain and logistics company.', jobs_posted: 11, jobs_active: 3, status: 'active', joined: '2026-03-01', verified: true },
  { id: 9, company: 'G42', contact_name: 'Layla Al Nuaimi', email: 'hr@g42.ai', phone: '+971 2 491 4200', country: 'UAE', industry: 'Technology', website: 'https://g42.ai', description: 'Abu Dhabi based AI and cloud computing company.', jobs_posted: 20, jobs_active: 9, status: 'pending', joined: '2026-04-05', verified: false },
  { id: 10, company: 'Majid Al Futtaim', contact_name: 'Rania Hassan', email: 'talent@maf.ae', phone: '+971 4 294 0000', country: 'UAE', industry: 'Retail', website: 'https://majidalfuttaim.com', description: 'Iconic lifestyle destination brand operating across 17 countries.', jobs_posted: 30, jobs_active: 12, status: 'active', joined: '2026-01-05', verified: true },
];

const EMPTY_EMPLOYER: Omit<Employer, 'id' | 'joined' | 'jobs_posted' | 'jobs_active'> = {
  company: '', contact_name: '', email: '', phone: '', country: 'UAE',
  industry: 'Technology', website: '', description: '', status: 'pending', verified: false,
};

const STATUS_CONFIG: Record<EmployerStatus, { label: string; classes: string }> = {
  active:    { label: 'Active',    classes: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'Pending',   classes: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspended', classes: 'bg-red-100 text-red-700' },
};

const cls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]';

function InputRow({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

interface EmployerModalProps {
  initial: Omit<Employer, 'id' | 'joined' | 'jobs_posted' | 'jobs_active'>;
  onSave: (data: Omit<Employer, 'id' | 'joined' | 'jobs_posted' | 'jobs_active'>) => void;
  onClose: () => void;
  title: string;
}

function EmployerModal({ initial, onSave, onClose, title }: EmployerModalProps) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form, v: unknown) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.company.trim() || !form.email.trim()) {
      alert('Company name and email are required.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-[#1A3C6E]">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-5 h-5" /></button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputRow label="Company Name *">
              <input className={cls} value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="e.g. Emirates Group" />
            </InputRow>
            <InputRow label="Contact Person">
              <input className={cls} value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} placeholder="e.g. Fatima Al Rashid" />
            </InputRow>
            <InputRow label="Email Address *">
              <input className={cls} type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="hr@company.ae" />
            </InputRow>
            <InputRow label="Phone Number">
              <input className={cls} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+971 4 123 4567" />
            </InputRow>
            <InputRow label="Country">
              <select className={cls} value={form.country} onChange={(e) => set('country', e.target.value)}>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </InputRow>
            <InputRow label="Industry">
              <select className={cls} value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </InputRow>
            <InputRow label="Website" hint="Full URL including https://">
              <input className={cls} value={form.website} onChange={(e) => set('website', e.target.value)} placeholder="https://company.ae" />
            </InputRow>
            <InputRow label="Status">
              <select className={cls} value={form.status} onChange={(e) => set('status', e.target.value as EmployerStatus)}>
                {(Object.keys(STATUS_CONFIG) as EmployerStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </InputRow>
          </div>
          <InputRow label="Company Description">
            <textarea
              className={`${cls} min-h-[90px] resize-y`}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of the company, what they do, size, etc."
            />
          </InputRow>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.verified} onChange={(e) => set('verified', e.target.checked)} className="rounded" />
            Mark as Verified Employer
          </label>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose} className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSave} className="rounded-lg bg-[#1A3C6E] px-5 py-2 text-sm font-medium text-white hover:bg-[#0d2444]">
            Save Employer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmployersPage() {
  const [employers, setEmployers] = useState<Employer[]>(MOCK);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [selected, setSelected] = useState<number[]>([]);
  const [modal, setModal] = useState<{ mode: 'add' | 'edit'; employer?: Employer } | null>(null);

  const filtered = employers.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch = e.company.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.contact_name.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'All' || e.status === statusFilter.toLowerCase();
    const matchCountry = countryFilter === 'All' || e.country === countryFilter;
    return matchSearch && matchStatus && matchCountry;
  });

  const toggleSelect = (id: number) =>
    setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const toggleAll = () =>
    setSelected(selected.length === filtered.length ? [] : filtered.map((e) => e.id));

  const updateStatus = (id: number, status: EmployerStatus) =>
    setEmployers((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));

  const toggleVerified = (id: number) =>
    setEmployers((prev) => prev.map((e) => (e.id === id ? { ...e, verified: !e.verified } : e)));

  const deleteEmployer = (id: number) => {
    if (confirm('Remove this employer? All their jobs will also be removed.')) {
      setEmployers((p) => p.filter((e) => e.id !== id));
    }
  };

  const handleSave = (data: Omit<Employer, 'id' | 'joined' | 'jobs_posted' | 'jobs_active'>) => {
    if (modal?.mode === 'add') {
      setEmployers((prev) => [{ ...data, id: Date.now(), joined: new Date().toISOString().slice(0, 10), jobs_posted: 0, jobs_active: 0 }, ...prev]);
    } else if (modal?.employer) {
      setEmployers((prev) => prev.map((e) => e.id === modal.employer!.id ? { ...e, ...data } : e));
    }
    setModal(null);
  };

  const total = employers.length;
  const active = employers.filter((e) => e.status === 'active').length;
  const pending = employers.filter((e) => e.status === 'pending').length;
  const totalJobs = employers.reduce((s, e) => s + e.jobs_active, 0);

  return (
    <div className="space-y-5">
      {modal && (
        <EmployerModal
          title={modal.mode === 'add' ? 'Add New Employer' : `Edit — ${modal.employer?.company}`}
          initial={modal.employer
            ? { company: modal.employer.company, contact_name: modal.employer.contact_name, email: modal.employer.email, phone: modal.employer.phone, country: modal.employer.country, industry: modal.employer.industry, website: modal.employer.website, description: modal.employer.description, status: modal.employer.status, verified: modal.employer.verified }
            : EMPTY_EMPLOYER}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Employers', value: total,     color: 'text-[#1A3C6E]',    bg: 'bg-blue-50' },
          { label: 'Active',          value: active,    color: 'text-emerald-700',   bg: 'bg-emerald-50' },
          { label: 'Pending Review',  value: pending,   color: 'text-amber-700',     bg: 'bg-amber-50' },
          { label: 'Active Job Posts',value: totalJobs, color: 'text-[#FF6B35]',     bg: 'bg-orange-50' },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white`}>
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search company, email or contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]">
            {['All', 'Active', 'Pending', 'Suspended'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]">
            {['All', ...COUNTRIES].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 bg-[#1A3C6E]/5 border border-[#1A3C6E]/20 rounded-xl px-4 py-2.5">
          <span className="text-sm font-medium text-[#1A3C6E]">{selected.length} selected</span>
          <button onClick={() => { selected.forEach((id) => updateStatus(id, 'active')); setSelected([]); }} className="rounded px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Activate All</button>
          <button onClick={() => { selected.forEach((id) => updateStatus(id, 'suspended')); setSelected([]); }} className="rounded px-3 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Suspend All</button>
          <button onClick={() => setSelected([])} className="ml-auto text-xs text-gray-500 hover:text-gray-700">Clear</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Employers <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{pending} pending approval</span>
            <button
              onClick={() => setModal({ mode: 'add' })}
              className="rounded-lg bg-[#FF6B35] px-4 py-2 text-sm font-medium text-white hover:bg-[#e55a24] transition-colors"
            >
              + Add Employer
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left">
                  <input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Company</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Industry</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Country</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Jobs</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No employers found.</td></tr>
              ) : (
                filtered.map((emp, i) => (
                  <tr key={emp.id} className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(emp.id)} onChange={() => toggleSelect(emp.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C6E] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {emp.company[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 leading-tight">{emp.company}</p>
                          {emp.verified && <span className="text-[10px] text-emerald-600 font-medium">✓ Verified</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-700 text-xs font-medium">{emp.contact_name}</p>
                      <p className="text-gray-500 text-xs">{emp.email}</p>
                      <p className="text-gray-400 text-xs">{emp.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{emp.industry}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{emp.country}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-medium text-gray-800">{emp.jobs_active}</span>
                      <span className="text-gray-400"> / {emp.jobs_posted} total</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[emp.status].classes}`}>
                        {STATUS_CONFIG[emp.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{emp.joined}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {emp.status === 'pending' && (
                          <button onClick={() => updateStatus(emp.id, 'active')} className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Approve</button>
                        )}
                        {emp.status === 'active' && (
                          <button onClick={() => updateStatus(emp.id, 'suspended')} className="rounded px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200">Suspend</button>
                        )}
                        {emp.status === 'suspended' && (
                          <button onClick={() => updateStatus(emp.id, 'active')} className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Restore</button>
                        )}
                        <button
                          onClick={() => setModal({ mode: 'edit', employer: emp })}
                          className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button onClick={() => toggleVerified(emp.id)} className={`rounded px-2 py-1 text-xs font-medium ${emp.verified ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                          {emp.verified ? 'Unverify' : 'Verify'}
                        </button>
                        <button onClick={() => deleteEmployer(emp.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
