import Link from 'next/link';
import { Plus, Eye, Users, Briefcase, MoreVertical, ChevronRight, TrendingUp } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const MOCK_EMPLOYER = {
  first_name: 'Sarah',
  last_name: 'Al Hassan',
  company: 'Emirates Group',
  role: 'employer' as const,
};

const MOCK_JOBS = [
  { id: 1, title: 'Senior Software Engineer', status: 'active', views: 1240, applications: 47, posted: '2026-06-01', expires: '2026-07-01' },
  { id: 2, title: 'Marketing Manager', status: 'active', views: 860, applications: 31, posted: '2026-06-05', expires: '2026-07-05' },
  { id: 3, title: 'Civil Engineer', status: 'paused', views: 430, applications: 18, posted: '2026-05-20', expires: '2026-06-20' },
  { id: 4, title: 'HR Business Partner', status: 'expired', views: 1100, applications: 62, posted: '2026-05-01', expires: '2026-06-01' },
];

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-gray-100 text-gray-500',
};

const FREE_POSTS_TOTAL = 3;
const FREE_POSTS_USED = 1;
const FREE_POSTS_REMAINING = FREE_POSTS_TOTAL - FREE_POSTS_USED;

export default function EmployerDashboardPage() {
  const user = MOCK_EMPLOYER;
  const activeJobs = MOCK_JOBS.filter((j) => j.status === 'active').length;
  const totalApplications = MOCK_JOBS.reduce((sum, j) => sum + j.applications, 0);
  const totalViews = MOCK_JOBS.reduce((sum, j) => sum + j.views, 0);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.company}</h1>
              <p className="text-gray-500 text-sm mt-1">Employer Dashboard</p>
            </div>
            <Link
              href="/employer/post-job"
              className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<Briefcase className="w-6 h-6 text-[#1A3C6E]" />} label="Active Jobs" value={activeJobs} color="blue" />
            <StatCard icon={<Users className="w-6 h-6 text-[#FF6B35]" />} label="Total Applications" value={totalApplications} color="orange" />
            <StatCard icon={<Eye className="w-6 h-6 text-green-600" />} label="Profile Views" value={totalViews.toLocaleString()} color="green" />
          </div>

          {/* Billing / usage */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-[#1A3C6E]" />
              <div>
                <p className="font-semibold text-gray-900">Free Plan</p>
                <p className="text-sm text-gray-500">
                  {FREE_POSTS_REMAINING} of {FREE_POSTS_TOTAL} free job posts remaining this month
                </p>
                <div className="w-48 h-2 bg-gray-100 rounded-full mt-2">
                  <div
                    className="h-2 bg-[#1A3C6E] rounded-full"
                    style={{ width: `${(FREE_POSTS_USED / FREE_POSTS_TOTAL) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <Link
              href="/employer/billing"
              className="flex-shrink-0 border border-[#1A3C6E] text-[#1A3C6E] font-semibold px-4 py-2 rounded-xl text-sm hover:bg-[#1A3C6E] hover:text-white transition-colors"
            >
              Upgrade Plan
            </Link>
          </div>

          {/* My Jobs table */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">My Job Listings</h2>
              <Link href="/employer/jobs" className="text-sm text-[#FF6B35] flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Job Title</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                        <Eye className="w-3.5 h-3.5 inline" /> Views
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                        <Users className="w-3.5 h-3.5 inline" /> Apps
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden md:table-cell">Expires</th>
                      <th className="px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_JOBS.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <Link
                            href={`/employer/jobs/${job.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-[#1A3C6E]"
                          >
                            {job.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[job.status as keyof typeof STATUS_STYLES]}`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{job.views.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/employer/jobs/${job.id}/applications`}
                            className="text-sm font-semibold text-[#1A3C6E] hover:underline"
                          >
                            {job.applications}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                          {new Date(job.expires).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/employer/post-job?edit=${job.id}`}
                              className="text-xs text-gray-500 hover:text-[#1A3C6E]"
                            >
                              Edit
                            </Link>
                            <button className="text-gray-400 hover:text-gray-600 p-1">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {MOCK_JOBS.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No job listings yet.</p>
                  <Link href="/employer/post-job" className="text-[#FF6B35] text-sm font-medium mt-2 inline-block hover:underline">
                    Post your first job →
                  </Link>
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const bg = { blue: 'bg-blue-50', orange: 'bg-orange-50', green: 'bg-green-50' }[color] ?? 'bg-gray-50';
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}
