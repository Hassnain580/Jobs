import Link from 'next/link';
import { Briefcase, Bookmark, User, ChevronRight, CircleCheck, Clock, XCircle, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/ui/JobCard';
import type { Job } from '@/types';

// Mock data — replace with API calls
const MOCK_USER = {
  first_name: 'Ahmed',
  last_name: 'Al Mansouri',
  email: 'ahmed@example.com',
  role: 'seeker' as const,
  profile_completion: 65,
};

const MOCK_APPLICATIONS = [
  { id: 1, job_title: 'Senior Software Engineer', company: 'Emirates Group', applied_at: '2026-06-10', status: 'pending' },
  { id: 2, job_title: 'IT Support Specialist', company: 'DEWA', applied_at: '2026-06-08', status: 'reviewed' },
  { id: 3, job_title: 'Data Scientist', company: 'ADNOC Digital', applied_at: '2026-06-05', status: 'shortlisted' },
  { id: 4, job_title: 'Full Stack Developer', company: 'Noon', applied_at: '2026-06-01', status: 'rejected' },
];

const RECOMMENDED: Job[] = Array.from({ length: 3 }, (_, i) => ({
  id: 100 + i,
  slug: `rec-job-${i}`,
  title: ['Cloud Engineer', 'Python Developer', 'DevOps Engineer'][i],
  company: { id: i + 1, name: ['Microsoft UAE', 'Careem', 'Etisalat'][i], slug: 'company' },
  location_city: 'Dubai',
  location_country: 'UAE',
  country_code: 'ae',
  salary_min: 12000 + i * 2000,
  salary_max: 22000 + i * 2000,
  salary_currency: 'AED',
  job_type: 'full_time',
  category: { id: 1, name: 'IT', slug: 'it' },
  description: '',
  apply_method: 'email',
  is_sponsored: false,
  is_featured: i === 0,
  is_walk_in: false,
  is_active: true,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

const STATUS_CONFIG = {
  pending: { label: 'Pending', icon: Clock, className: 'text-yellow-600 bg-yellow-50' },
  reviewed: { label: 'Reviewed', icon: AlertCircle, className: 'text-blue-600 bg-blue-50' },
  shortlisted: { label: 'Shortlisted', icon: CircleCheck, className: 'text-green-600 bg-green-50' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'text-red-500 bg-red-50' },
};

export default function DashboardPage() {
  const user = MOCK_USER;
  const totalApplications = MOCK_APPLICATIONS.length;
  const savedJobs = 7;
  const profileCompletion = user.profile_completion;
  const incomplete = profileCompletion < 100;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header user={user} />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.first_name}!
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here&apos;s your job search overview.</p>
          </div>

          {/* Profile completion prompt */}
          {incomplete && (
            <div className="mb-6 bg-[#1A3C6E] rounded-xl p-5 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none" stroke="#FF6B35" strokeWidth="3"
                      strokeDasharray={`${profileCompletion} ${100 - profileCompletion}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {profileCompletion}%
                  </span>
                </div>
                <div>
                  <p className="font-semibold">Complete your profile</p>
                  <p className="text-blue-200 text-sm">Profiles 100% complete get 3× more recruiter views.</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="flex-shrink-0 bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
              >
                Complete Profile
              </Link>
            </div>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<Briefcase className="w-6 h-6 text-[#1A3C6E]" />} label="Applications" value={totalApplications} href="/dashboard/applications" />
            <StatCard icon={<Bookmark className="w-6 h-6 text-[#FF6B35]" />} label="Saved Jobs" value={savedJobs} href="/saved-jobs" />
            <StatCard
              icon={<User className="w-6 h-6 text-green-600" />}
              label="Profile Completion"
              value={`${profileCompletion}%`}
              href="/profile"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent applications */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                <Link href="/dashboard/applications" className="text-sm text-[#FF6B35] flex items-center gap-1 hover:underline">
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Job</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3 hidden sm:table-cell">Applied</th>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {MOCK_APPLICATIONS.map((app) => {
                      const status = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900 line-clamp-1">{app.job_title}</p>
                            <p className="text-xs text-gray-500">{app.company}</p>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">
                            {new Date(app.applied_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                              <StatusIcon className="w-3 h-3" />
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Job recommendations */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recommended</h2>
                <Link href="/jobs" className="text-sm text-[#FF6B35] flex items-center gap-1 hover:underline">
                  More <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {RECOMMENDED.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  icon, label, value, href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 hover:shadow-md hover:border-[#1A3C6E] transition-all group"
    >
      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-[#1A3C6E] ml-auto transition-colors" />
    </Link>
  );
}
