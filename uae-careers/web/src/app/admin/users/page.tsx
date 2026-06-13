'use client';

import { useState } from 'react';

type UserRole = 'job_seeker' | 'employer';
type UserStatus = 'pending' | 'approved' | 'rejected' | 'banned';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  registered: string;
  lastActive: string;
}

const MOCK_USERS: User[] = [
  { id: 1, name: 'Ahmed Al Mansouri', email: 'ahmed@email.com', phone: '+971501234567', role: 'job_seeker', status: 'approved', registered: '2026-06-13', lastActive: '2026-06-13' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@techcorp.ae', phone: '+971551234567', role: 'employer', status: 'pending', registered: '2026-06-13', lastActive: '2026-06-13' },
  { id: 3, name: 'Mohammed Al Rashid', email: 'mo@email.com', phone: '+971521234567', role: 'job_seeker', status: 'pending', registered: '2026-06-12', lastActive: '2026-06-12' },
  { id: 4, name: 'Priya Sharma', email: 'priya@company.com', phone: '+971561234567', role: 'employer', status: 'approved', registered: '2026-06-12', lastActive: '2026-06-13' },
  { id: 5, name: 'John Williams', email: 'john@email.com', phone: '+971581234567', role: 'job_seeker', status: 'rejected', registered: '2026-06-11', lastActive: '2026-06-11' },
  { id: 6, name: 'Fatima Al Zaabi', email: 'fatima@email.com', phone: '+971541234567', role: 'job_seeker', status: 'approved', registered: '2026-06-10', lastActive: '2026-06-13' },
  { id: 7, name: 'Raj Kumar', email: 'raj@gulftech.ae', phone: '+971531234567', role: 'employer', status: 'banned', registered: '2026-06-05', lastActive: '2026-06-08' },
  { id: 8, name: 'Nora Al Hashimi', email: 'nora@email.com', phone: '+971591234567', role: 'job_seeker', status: 'approved', registered: '2026-06-09', lastActive: '2026-06-12' },
  { id: 9, name: 'David Chen', email: 'david@horizons.ae', phone: '+971501111111', role: 'employer', status: 'pending', registered: '2026-06-08', lastActive: '2026-06-08' },
  { id: 10, name: 'Layla Hassan', email: 'layla@email.com', phone: '+971552222222', role: 'job_seeker', status: 'approved', registered: '2026-06-07', lastActive: '2026-06-11' },
];

const STATUS_CONFIG: Record<UserStatus, { label: string; classes: string }> = {
  pending:  { label: 'Pending',  classes: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Approved', classes: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700' },
  banned:   { label: 'Banned',   classes: 'bg-gray-200 text-gray-700' },
};

const ROLE_CONFIG: Record<UserRole, { label: string; classes: string }> = {
  job_seeker: { label: 'Job Seeker', classes: 'bg-blue-100 text-blue-700' },
  employer:   { label: 'Employer',   classes: 'bg-purple-100 text-purple-700' },
};

const PAGE_SIZE = 6;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [page, setPage] = useState(1);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    const matchRole = roleFilter === 'All' || u.role === roleFilter;
    const matchStatus = statusFilter === 'All' || u.status === statusFilter.toLowerCase();
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = (id: number, status: UserStatus) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status } : u)));

  const deleteUser = (id: number) => {
    if (confirm('Delete this user permanently?')) setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const exportCSV = () => {
    const header = 'Name,Email,Phone,Role,Status,Registered,Last Active';
    const rows = filtered.map((u) =>
      [u.name, u.email, u.phone, u.role, u.status, u.registered, u.lastActive].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          />
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          >
            <option>All</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="employer">Employers</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
          >
            {['All', 'Pending', 'Approved', 'Rejected', 'Banned'].map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={exportCSV}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            Users <span className="text-gray-400 font-normal text-sm">({filtered.length})</span>
          </h3>
          <button className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
            + Invite User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Registered</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Active</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">No users found.</td>
                </tr>
              ) : (
                paginated.map((user, i) => (
                  <tr
                    key={user.id}
                    className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{user.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_CONFIG[user.role].classes}`}>
                        {ROLE_CONFIG[user.role].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[user.status].classes}`}>
                        {STATUS_CONFIG[user.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.registered}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.lastActive}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {user.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(user.id, 'approved')} className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Approve</button>
                            <button onClick={() => updateStatus(user.id, 'rejected')} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Reject</button>
                          </>
                        )}
                        {user.status === 'approved' && (
                          <button onClick={() => updateStatus(user.id, 'banned')} className="rounded px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">Ban</button>
                        )}
                        {user.status === 'banned' && (
                          <button onClick={() => updateStatus(user.id, 'approved')} className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200">Unban</button>
                        )}
                        <button className="rounded px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200">View</button>
                        <button onClick={() => deleteUser(user.id)} className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">Del</button>
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
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded px-3 py-1.5 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`rounded px-3 py-1.5 text-xs border ${p === page ? 'bg-[#1A3C6E] border-[#1A3C6E] text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded px-3 py-1.5 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
