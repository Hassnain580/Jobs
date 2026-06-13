'use client';

import { useState } from 'react';

const OVERVIEW_STATS = [
  { label: 'Total Page Views', value: '284,192', change: '+18%', up: true, color: 'text-emerald-600' },
  { label: 'Unique Visitors', value: '91,430', change: '+12%', up: true, color: 'text-emerald-600' },
  { label: 'Job Applications', value: '32,840', change: '+22%', up: true, color: 'text-emerald-600' },
  { label: 'Avg. Session (min)', value: '4.7', change: '-3%', up: false, color: 'text-red-500' },
  { label: 'Ad Revenue (AED)', value: '18,420', change: '+31%', up: true, color: 'text-emerald-600' },
  { label: 'Conversion Rate', value: '6.2%', change: '+0.8%', up: true, color: 'text-emerald-600' },
];

const JOBS_BY_CATEGORY = [
  { label: 'IT', count: 1240, pct: 100 },
  { label: 'Sales', count: 892, pct: 72 },
  { label: 'Engineering', count: 734, pct: 59 },
  { label: 'Finance', count: 621, pct: 50 },
  { label: 'Marketing', count: 512, pct: 41 },
  { label: 'Healthcare', count: 445, pct: 36 },
  { label: 'HR', count: 312, pct: 25 },
  { label: 'Hospitality', count: 289, pct: 23 },
  { label: 'Design', count: 198, pct: 16 },
  { label: 'Education', count: 143, pct: 12 },
];

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

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {OVERVIEW_STATS.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
            <p className={`text-xs font-semibold mt-1 ${stat.color}`}>
              {stat.up ? '▲' : '▼'} {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Jobs by category bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Jobs by Category</h3>
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
          <h3 className="font-semibold text-gray-800 mb-4">Top Searched Keywords</h3>
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue Summary</h3>
            <span className="text-sm font-bold text-[#1A3C6E]">AED {totalRevenue.toLocaleString()}</span>
          </div>
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
