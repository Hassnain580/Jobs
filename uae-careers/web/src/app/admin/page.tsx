'use client';

import { useState } from 'react';
import Link from 'next/link';
import { computeStats, ADMIN_JOBS, ADMIN_USERS } from '@/lib/admin-data';

const stats = computeStats();

const STAT_CARDS = [
  { label: 'Total Users', value: stats.totalUsers.toLocaleString(), sub: `${stats.pendingUsers} pending approval`, color: 'bg-blue-500', icon: '👥' },
  { label: 'Active Jobs', value: stats.activeJobs.toLocaleString(), sub: `${stats.pendingJobs} pending review`, color: 'bg-emerald-500', icon: '💼' },
  { label: 'Total Employers', value: stats.totalEmployers.toLocaleString(), sub: `${stats.pendingEmployers} pending approval`, color: 'bg-purple-500', icon: '🏢' },
  { label: 'Total Job Views', value: stats.totalViews.toLocaleString(), sub: `across ${stats.totalJobs} listings`, color: 'bg-[#FFB400]', icon: '👁' },
];

const PENDING_JOBS = ADMIN_JOBS.filter((j) => j.status === 'pending');
const RECENT_USERS = [...ADMIN_USERS].sort((a, b) => b.registered.localeCompare(a.registered)).slice(0, 4);

export default function AdminDashboard() {
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const handleApprove = (id: number) => {
    setApprovingId(id);
    setTimeout(() => setApprovingId(null), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${card.color} text-white`}>
                Live
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Status Summary Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Jobs by Status</h3>
          <div className="space-y-2">
            {(['approved', 'pending', 'rejected', 'expired'] as const).map((s) => {
              const count = ADMIN_JOBS.filter((j) => j.status === s).length;
              const colors: Record<string, string> = { approved: 'bg-emerald-500', pending: 'bg-amber-400', rejected: 'bg-red-400', expired: 'bg-gray-400' };
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="capitalize text-sm text-gray-600 w-20">{s}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[s]}`} style={{ width: `${(count / ADMIN_JOBS.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Users by Status</h3>
          <div className="space-y-2">
            {(['approved', 'pending', 'rejected', 'banned'] as const).map((s) => {
              const count = ADMIN_USERS.filter((u) => u.status === s).length;
              const colors: Record<string, string> = { approved: 'bg-emerald-500', pending: 'bg-amber-400', rejected: 'bg-red-400', banned: 'bg-gray-400' };
              return (
                <div key={s} className="flex items-center gap-3">
                  <span className="capitalize text-sm text-gray-600 w-20">{s}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${colors[s]}`} style={{ width: `${(count / ADMIN_USERS.length) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-4 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-3">Top Jobs by Views</h3>
          <div className="space-y-2">
            {[...ADMIN_JOBS].sort((a, b) => b.views - a.views).slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 flex-1 truncate">{job.title}</span>
                <span className="text-xs font-semibold text-gray-700">{job.views.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Jobs Pending Approval <span className="text-gray-400 font-normal text-sm">({PENDING_JOBS.length})</span></h3>
            <Link href="/admin/jobs" className="text-xs text-[#1A3C6E] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Employer</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {PENDING_JOBS.length === 0 ? (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400 text-sm">No pending jobs.</td></tr>
                ) : PENDING_JOBS.map((job, i) => (
                  <tr key={job.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-medium text-gray-700 truncate max-w-[140px]">{job.title}</td>
                    <td className="px-4 py-3 text-gray-500 truncate max-w-[120px]">{job.employer}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(job.id)}
                          className="rounded px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
                        >
                          {approvingId === job.id ? '✓' : 'Approve'}
                        </button>
                        <button className="rounded px-2 py-1 text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Registrations</h3>
            <Link href="/admin/users" className="text-xs text-[#1A3C6E] hover:underline font-medium">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {RECENT_USERS.map((user, i) => (
                  <tr key={user.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-700">{user.name}</div>
                      <div className="text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'employer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role === 'employer' ? 'Employer' : 'Job Seeker'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.registered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/jobs" className="rounded-lg bg-[#1A3C6E] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0d2444] transition-colors">
            Review Pending Jobs
          </Link>
          <Link href="/admin/users" className="rounded-lg bg-[#FF6B35] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
            Approve Users
          </Link>
          <Link href="/admin/categories" className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
            Manage Categories
          </Link>
          <Link href="/admin/cms" className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
            Edit CMS Content
          </Link>
          <Link href="/admin/analytics" className="rounded-lg bg-[#FFB400] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity">
            View Analytics
          </Link>
        </div>
      </div>
    </div>
  );
}
