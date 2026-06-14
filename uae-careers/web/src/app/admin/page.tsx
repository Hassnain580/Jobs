'use client';

import { useState } from 'react';
import Link from 'next/link';

const STAT_CARDS = [
  { label: 'Total Users', value: '14,230', change: '+12%', color: 'bg-blue-500', icon: '👥' },
  { label: 'Active Jobs', value: '3,891', change: '+8%', color: 'bg-emerald-500', icon: '💼' },
  { label: 'Total Employers', value: '987', change: '+5%', color: 'bg-purple-500', icon: '🏢' },
  { label: 'Monthly Revenue', value: 'AED 42,800', change: '+23%', color: 'bg-[#FFB400]', icon: '💰' },
];

const PENDING_JOBS = [
  { id: 1, title: 'Senior Software Engineer', employer: 'Tech Corp Dubai', category: 'IT', country: 'UAE', date: '2026-06-12' },
  { id: 2, title: 'Marketing Manager', employer: 'Global Media UAE', category: 'Marketing', country: 'KSA', date: '2026-06-11' },
  { id: 3, title: 'Financial Analyst', employer: 'Emirates Bank', category: 'Finance', country: 'UAE', date: '2026-06-11' },
  { id: 4, title: 'HR Coordinator', employer: 'Majid Al Futtaim', category: 'HR', country: 'UAE', date: '2026-06-10' },
  { id: 5, title: 'Sales Executive', employer: 'Noon.com', category: 'Sales', country: 'UAE', date: '2026-06-10' },
];

const RECENT_USERS = [
  { id: 1, name: 'Ahmed Al Mansouri', email: 'ahmed@email.com', role: 'Job Seeker', date: '2026-06-13' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@techcorp.ae', role: 'Employer', date: '2026-06-13' },
  { id: 3, name: 'Mohammed Al Rashid', email: 'mo@email.com', role: 'Job Seeker', date: '2026-06-12' },
  { id: 4, name: 'Priya Sharma', email: 'priya@company.com', role: 'Employer', date: '2026-06-12' },
];

const BAR_CHART = [
  { label: 'Jan', value: 65 },
  { label: 'Feb', value: 78 },
  { label: 'Mar', value: 55 },
  { label: 'Apr', value: 90 },
  { label: 'May', value: 82 },
  { label: 'Jun', value: 95 },
];

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
                {card.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Job postings bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Job Postings (Last 6 Months)</h3>
          <div className="flex items-end gap-3 h-32">
            {BAR_CHART.map((bar) => (
              <div key={bar.label} className="flex flex-col items-center flex-1 gap-1">
                <div
                  className="w-full rounded-t-md bg-[#1A3C6E] transition-all"
                  style={{ height: `${bar.value}%` }}
                />
                <span className="text-xs text-gray-500">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Revenue Trend (AED 000s)</h3>
          <div className="flex items-end gap-3 h-32">
            {[42, 38, 55, 48, 60, 70].map((v, i) => (
              <div key={i} className="flex flex-col items-center flex-1 gap-1">
                <div
                  className="w-full rounded-t-md bg-[#FF6B35] transition-all"
                  style={{ height: `${(v / 70) * 100}%` }}
                />
                <span className="text-xs text-gray-500">M{i + 1}</span>
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
            <h3 className="font-semibold text-gray-800">Jobs Pending Approval</h3>
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
                {PENDING_JOBS.map((job, i) => (
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
                        user.role === 'Employer' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{user.date}</td>
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
