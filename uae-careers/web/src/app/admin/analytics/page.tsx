'use client';

import { useState } from 'react';
import { computeStats, ADMIN_JOBS } from '@/lib/admin-data';

const stats = computeStats();

const OVERVIEW_STATS = [
  { label: 'Total Jobs', value: stats.totalJobs.toString(), note: 'in system', color: 'text-blue-600' },
  { label: 'Active Jobs', value: stats.activeJobs.toString(), note: `${stats.pendingJobs} pending`, color: 'text-emerald-600' },
  { label: 'Total Users', value: stats.totalUsers.toString(), note: `${stats.pendingUsers} pending`, color: 'text-emerald-600' },
  { label: 'Total Employers', value: stats.totalEmployers.toString(), note: `${stats.activeEmployers} active`, color: 'text-purple-600' },
  { label: 'Job Views', value: stats.totalViews.toLocaleString(), note: 'total across listings', color: 'text-emerald-600' },
  { label: 'Jobs Posted', value: stats.totalJobsPosted.toString(), note: 'by employers', color: 'text-emerald-600' },
];

// Derived from actual jobs data
const rawCategories = ADMIN_JOBS.reduce<Record<string, number>>((acc, job) => {
  acc[job.category] = (acc[job.category] ?? 0) + 1;
  return acc;
}, {});
const maxCatCount = Math.max(...Object.values(rawCategories), 1);
const JOBS_BY_CATEGORY = Object.entries(rawCategories)
  .sort((a, b) => b[1] - a[1])
  .map(([label, count]) => ({ label, count, pct: Math.round((count / maxCatCount) * 100) }));

const REGISTRATIONS_BY_MONTH = [
  { month: 'Jan', seekers: 820, employers: 120 },
  { month: 'Feb', seekers: 960, employers: 140 },
  { month: 'Mar', seekers: 740, employers: 98 },
  { month: 'Apr', seekers: 1120, employers: 180 },
  { month: 'May', seekers: 980, employers: 155 },
  { month: 'Jun', seekers: 1340, employers: 210 },
];

const MAX_SEEKERS = 1340;

const TOP_KEYWORDS = [
  { keyword: 'software engineer', searches: 8420 },
  { keyword: 'accountant dubai', searches: 6340 },
  { keyword: 'sales manager uae', searches: 5210 },
  { keyword: 'nurse abu dhabi', searches: 4870 },
  { keyword: 'civil engineer', searches: 4120 },
  { keyword: 'marketing manager', searches: 3890 },
  { keyword: 'hr officer', searches: 3340 },
  { keyword: 'project manager', searches: 2980 },
  { keyword: 'data analyst', searches: 2650 },
  { keyword: 'driver dubai', searches: 2410 },
];

const REVENUE_TABLE = [
  { source: 'Premium Subscriptions', thisMonth: 12400, lastMonth: 9800, change: '+27%' },
  { source: 'Employer Job Posts', thisMonth: 18200, lastMonth: 16500, change: '+10%' },
  { source: 'Ad Revenue', thisMonth: 8420, lastMonth: 6430, change: '+31%' },
  { source: 'Featured Listings', thisMonth: 3800, lastMonth: 4200, change: '-10%' },
  { source: 'CV Services', thisMonth: 2100, lastMonth: 1800, change: '+17%' },
];

const RANGE_OPTIONS = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 12 months'];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('Last 30 days');

  const totalRevenue = REVENUE_TABLE.reduce((s, r) => s + r.thisMonth, 0);

  return (
    <div className="space-y-5">
      {/* Range selector */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Analytics overview for <strong className="text-gray-700">{range}</strong></p>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                range === r ? 'bg-[#1A3C6E] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats — derived from actual data */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {OVERVIEW_STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
            <p className={`text-xs font-medium mt-1 ${stat.color}`}>{stat.note}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Jobs by category bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Jobs by Category</h3>
          <p className="text-xs text-gray-400 mb-3">Based on actual listings in the system</p>
          <div className="space-y-2.5">
            {JOBS_BY_CATEGORY.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 shrink-0 text-right">{item.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-[#1A3C6E] rounded-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${item.pct}%` }}
                  >
                    <span className="text-white text-xs font-medium">{item.count.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User registrations line (CSS bars by month) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">User Registrations by Month</h3>
          <p className="text-xs text-amber-500 mb-1">Illustrative — connect analytics API for live data</p>
          <div className="flex items-center gap-4 mb-4 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1A3C6E] inline-block" />Job Seekers</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#FF6B35] inline-block" />Employers</span>
          </div>
          <div className="flex items-end gap-3 h-40">
            {REGISTRATIONS_BY_MONTH.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end" style={{ height: '128px' }}>
                  <div
                    className="flex-1 bg-[#1A3C6E] rounded-t-sm transition-all"
                    style={{ height: `${(m.seekers / MAX_SEEKERS) * 100}%` }}
                    title={`Job Seekers: ${m.seekers}`}
                  />
                  <div
                    className="flex-1 bg-[#FF6B35] rounded-t-sm transition-all"
                    style={{ height: `${(m.employers / MAX_SEEKERS) * 100}%` }}
                    title={`Employers: ${m.employers}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{m.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top keywords */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Top Searched Keywords</h3>
          <p className="text-xs text-amber-500 mb-3">Illustrative — connect search analytics for live data</p>
          <div className="space-y-2">
            {TOP_KEYWORDS.map((kw, i) => (
              <div key={kw.keyword} className="flex items-center gap-3">
                <span className={`w-5 text-center text-xs font-bold rounded ${i < 3 ? 'text-[#FFB400]' : 'text-gray-400'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-gray-700">{kw.keyword}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 bg-[#FFB400] rounded-full"
                      style={{ width: `${(kw.searches / TOP_KEYWORDS[0].searches) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-12 text-right">{kw.searches.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-gray-800">Revenue Summary</h3>
            <span className="text-sm font-bold text-[#1A3C6E]">AED {totalRevenue.toLocaleString()}</span>
          </div>
          <p className="text-xs text-amber-500 mb-3">Illustrative — connect billing API for live data</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-2 text-xs font-semibold text-gray-500 uppercase">Source</th>
                  <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase">This Month</th>
                  <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase">Last Month</th>
                  <th className="text-right pb-2 text-xs font-semibold text-gray-500 uppercase">Change</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_TABLE.map((row, i) => (
                  <tr key={row.source} className={`${i % 2 === 0 ? '' : 'bg-gray-50/50'}`}>
                    <td className="py-2.5 text-gray-700 text-xs pr-2">{row.source}</td>
                    <td className="py-2.5 text-right font-medium text-gray-800 text-xs">AED {row.thisMonth.toLocaleString()}</td>
                    <td className="py-2.5 text-right text-gray-500 text-xs">AED {row.lastMonth.toLocaleString()}</td>
                    <td className={`py-2.5 text-right text-xs font-semibold ${row.change.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                      {row.change}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200">
                  <td className="py-2.5 font-semibold text-gray-800 text-xs">Total</td>
                  <td className="py-2.5 text-right font-bold text-[#1A3C6E] text-xs">AED {totalRevenue.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-medium text-gray-500 text-xs">
                    AED {REVENUE_TABLE.reduce((s, r) => s + r.lastMonth, 0).toLocaleString()}
                  </td>
                  <td className="py-2.5 text-right text-xs font-semibold text-emerald-600">+18%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
