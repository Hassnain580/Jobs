import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin, Briefcase, Clock, DollarSign, AlertTriangle,
  Share2, Bookmark, ExternalLink, MessageCircle,
  CalendarDays, Building2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';
import ProductBanners from '@/components/ui/ProductBanners';
import JobCard from '@/components/ui/JobCard';
import { formatSalary, timeAgo } from '@/lib/utils';
import type { Job, ProductBanner } from '@/types';

// Mock job catalogue — same source as jobs listing page
const JOB_TITLES = [
  'Senior Software Engineer', 'Marketing Manager', 'Civil Engineer', 'Registered Nurse',
  'HR Business Partner', 'Financial Analyst', 'IT Support Specialist', 'Sales Executive',
  'Operations Manager', 'Graphic Designer', 'Project Manager', 'Business Analyst',
  'QA Engineer', 'DevOps Engineer', 'Data Scientist', 'UX Designer',
  'Customer Service Rep', 'Supply Chain Manager', 'Legal Counsel', 'Risk Analyst',
];
const JOB_COMPANIES = [
  'Emirates Group', 'ADNOC', 'Emaar', 'NMC Health', 'Dubai Holding',
  'Etisalat', 'DEWA', 'DP World', 'Majid Al Futtaim', 'First Abu Dhabi Bank',
];
const JOB_CITIES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Dubai', 'Abu Dhabi',
  'Dubai', 'Abu Dhabi', 'Dubai', 'Sharjah', 'Dubai',
  'Abu Dhabi', 'Dubai', 'Sharjah', 'Dubai', 'Abu Dhabi',
  'Dubai', 'Sharjah', 'Abu Dhabi', 'Dubai', 'Abu Dhabi',
];
const JOB_TYPES: Job['job_type'][] = [
  'full_time', 'full_time', 'contract', 'full_time', 'part_time',
  'full_time', 'contract', 'full_time', 'full_time', 'freelance',
  'full_time', 'full_time', 'contract', 'full_time', 'full_time',
  'full_time', 'part_time', 'full_time', 'contract', 'full_time',
];
const CATEGORIES = [
  'Information Technology', 'Marketing', 'Engineering', 'Healthcare',
  'Human Resources', 'Finance', 'IT Support', 'Sales',
  'Operations', 'Design', 'Project Management', 'Business Analysis',
  'Quality Assurance', 'DevOps', 'Data & Analytics', 'UX & Design',
  'Customer Service', 'Supply Chain', 'Legal', 'Risk & Compliance',
];
const DESCRIPTIONS = [
  `<p>We are looking for a talented Senior Software Engineer to join our world-class technology team. You will work on cutting-edge systems powering one of the UAE's leading organisations.</p><p>This is a unique opportunity to build at scale, collaborate with global teams, and make a real impact.</p>`,
  `<p>Lead our marketing initiatives and drive brand growth across UAE and the wider region. You will oversee digital campaigns, agency relationships, and the full marketing calendar.</p>`,
  `<p>Join a flagship infrastructure project in the UAE. You will oversee civil works, liaise with consultants and contractors, and ensure delivery on time and to specification.</p>`,
  `<p>Provide compassionate, evidence-based nursing care in a state-of-the-art UAE hospital. You will work alongside a multidisciplinary clinical team serving a diverse patient population.</p>`,
  `<p>Partner with business leaders to align people strategy with company goals. You will own talent acquisition, employee relations, and organisational development initiatives.</p>`,
  `<p>Deliver high-quality financial analysis to support strategic decision-making across the organisation. You will build models, prepare reports, and present insights to senior leadership.</p>`,
  `<p>Provide first and second-line IT support to a growing UAE organisation. You will troubleshoot hardware, software, and network issues and maintain IT asset records.</p>`,
  `<p>Drive revenue growth by developing new client relationships and managing an existing portfolio across the UAE market.</p>`,
  `<p>Oversee day-to-day operations and drive continuous improvement across our UAE business units. You will manage cross-functional teams and own key KPIs.</p>`,
  `<p>Create compelling visual content for digital and print channels. You will work closely with marketing, brand, and product teams to deliver world-class design.</p>`,
];

const ALL_MOCK_JOBS: Job[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  slug: `job-${i + 1}`,
  title: JOB_TITLES[i],
  company: {
    id: i + 1,
    name: JOB_COMPANIES[i % 10],
    slug: JOB_COMPANIES[i % 10].toLowerCase().replace(/\s+/g, '-'),
    logo: undefined,
  },
  location_city: JOB_CITIES[i],
  location_country: 'UAE',
  country_code: 'ae',
  salary_min: 5000 + i * 500,
  salary_max: 10000 + i * 1000,
  salary_currency: 'AED',
  job_type: JOB_TYPES[i],
  experience_level: ['1-3 Years', '3-5 Years', '5+ Years', 'Entry Level'][i % 4],
  category: { id: (i % 8) + 1, name: CATEGORIES[i] ?? 'General', slug: CATEGORIES[i]?.toLowerCase().replace(/\s+/g, '-') ?? 'general' },
  description: DESCRIPTIONS[i % DESCRIPTIONS.length],
  responsibilities: `<ul><li>Lead and deliver high-impact projects in a fast-paced environment</li><li>Collaborate with cross-functional teams across the UAE and internationally</li><li>Report to senior leadership and contribute to strategic planning</li><li>Mentor junior team members and foster a culture of excellence</li></ul>`,
  requirements: `<ul><li>Bachelor's degree in a relevant field</li><li>3+ years of relevant experience, preferably in the UAE or GCC</li><li>Strong communication and stakeholder management skills</li><li>Proficiency in relevant tools and technologies</li><li>Valid UAE work authorisation or eligibility to obtain it</li></ul>`,
  important_note: 'UAE Careers connects job seekers directly with employers. We never charge candidates for job applications.',
  apply_method: i % 4 === 0 ? 'walkin' : 'email',
  is_sponsored: i % 5 === 0,
  is_featured: i < 3,
  is_walk_in: i % 6 === 0,
  is_active: true,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

const JOB_BY_SLUG = new Map(ALL_MOCK_JOBS.map((j) => [j.slug, j]));

async function getJob(slug: string): Promise<Job | null> {
  return JOB_BY_SLUG.get(slug) ?? null;
}

const MOCK_BANNERS: ProductBanner[] = [
  { id: 1, name: 'CV Builder Pro', description: 'Create a professional CV in minutes — ATS-optimized templates for UAE jobs.', url: '/cv-builder', image: undefined },
  { id: 2, name: 'Interview Prep', description: 'Practice 500+ UAE interview questions with AI coaching.', url: '/cv-builder/builder', image: undefined },
  { id: 3, name: 'LinkedIn Optimizer', description: 'Get 3× more recruiter views with our UAE-focused LinkedIn audit.', url: '/cv-builder/builder', image: undefined },
];

const RELATED_JOBS: Job[] = Array.from({ length: 3 }, (_, i) => ({
  id: 10 + i,
  slug: `related-job-${i}`,
  title: ['Full Stack Developer', 'Backend Engineer', 'Cloud Architect'][i],
  company: { id: 2, name: 'ADNOC', slug: 'adnoc', logo: undefined },
  location_city: 'Abu Dhabi',
  location_country: 'UAE',
  country_code: 'ae',
  salary_min: 12000,
  salary_max: 20000,
  salary_currency: 'AED',
  job_type: 'full_time',
  category: { id: 1, name: 'IT', slug: 'it' },
  description: '',
  apply_method: 'email',
  is_sponsored: false,
  is_featured: false,
  is_walk_in: false,
  is_active: true,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
  updated_at: new Date().toISOString(),
}));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: 'Job Not Found' };

  return {
    title: `${job.title} at ${job.company.name} — ${job.location_city}, ${job.location_country}`,
    description: `Apply for ${job.title} at ${job.company.name} in ${job.location_city}. ${formatSalary(job.salary_min, job.salary_max, job.salary_currency)}.`,
    openGraph: {
      title: `${job.title} — ${job.company.name}`,
      description: `${job.location_city}, ${job.location_country} | ${formatSalary(job.salary_min, job.salary_max, job.salary_currency)}`,
    },
  };
}

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract',
  internship: 'Internship', freelance: 'Freelance',
};

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);

  if (!job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-500 mb-4">This job may have expired or been removed.</p>
            <Link href="/jobs" className="text-[#FF6B35] font-medium hover:underline">
              Browse all jobs →
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const posted = timeAgo(job.created_at);
  const jobType = JOB_TYPE_LABELS[job.job_type] ?? job.job_type;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://uaecareer.ae/jobs/${slug}`;

  // JSON-LD JobPosting schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.created_at,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location_city,
        addressCountry: job.country_code.toUpperCase(),
      },
    },
    employmentType: job.job_type.toUpperCase(),
    ...(job.salary_min && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: job.salary_currency ?? 'AED',
        value: {
          '@type': 'QuantitativeValue',
          minValue: job.salary_min,
          maxValue: job.salary_max ?? job.salary_min,
          unitText: 'MONTH',
        },
      },
    }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Fraud notice */}
          <div className="mb-6">
            <FraudNotice />
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main column */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Job header card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  {job.company.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={job.company.logo} alt={job.company.name} className="w-16 h-16 rounded-xl object-contain border border-gray-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg font-bold">
                        {job.company.name.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {job.is_walk_in && (
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Walk-in Interview</span>
                      )}
                      {job.is_featured && (
                        <span className="text-xs font-semibold bg-[#FFB400] text-white px-2.5 py-1 rounded-full">Featured</span>
                      )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                    <p className="text-[#1A3C6E] font-medium mt-1">{job.company.name}</p>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    🇦🇪 {job.location_city}, {job.location_country}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <strong className="text-gray-900">{salary}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    {jobType}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    {posted}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {job.category.name}
                  </span>
                  {job.experience_level && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="w-4 h-4 text-gray-400" />
                      {job.experience_level} experience
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <ApplyButton job={job} />
                  <button className="flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <Bookmark className="w-4 h-4" /> Save Job
                  </button>
                  <button className="flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Share links */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span>Share:</span>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${job.title} at ${job.company.name} — ${shareUrl}`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-green-600 hover:underline"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${job.title} at ${job.company.name}`)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-500 hover:underline"
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.743l7.73-8.835L1.254 2.25H8.08l4.254 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg> X
                  </a>
                </div>
              </div>

              {/* Important Note — very prominent */}
              {job.important_note && (
                <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-amber-900 text-lg mb-1">Important Note</h3>
                      <p className="text-amber-800 text-sm leading-relaxed">{job.important_note}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <section className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
                <div
                  className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>

              {/* Responsibilities */}
              {job.responsibilities && (
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Responsibilities</h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.responsibilities }}
                  />
                </section>
              )}

              {/* Requirements */}
              {job.requirements && (
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </section>
              )}

              {/* Product banners */}
              <section>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Boost Your Application
                </h3>
                <ProductBanners banners={MOCK_BANNERS} />
              </section>

              {/* Fraud notice repeated */}
              <FraudNotice cookieKey="fraud_job_detail" />
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
              {/* Quick apply box */}
              <div className="bg-[#1A3C6E] rounded-xl p-5 text-white sticky top-20">
                <h3 className="font-bold text-lg mb-1">Ready to Apply?</h3>
                <p className="text-blue-200 text-sm mb-4">
                  {job.is_walk_in
                    ? 'This is a walk-in interview — visit the venue directly.'
                    : 'Submit your application now.'}
                </p>
                <ApplyButton job={job} fullWidth />
              </div>

              {/* Related jobs */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Similar Jobs</h3>
                <div className="space-y-3">
                  {RELATED_JOBS.map((rj) => (
                    <JobCard key={rj.id} job={rj} />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ApplyButton({ job, fullWidth }: { job: Job; fullWidth?: boolean }) {
  const baseClass = `flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm ${fullWidth ? 'w-full' : ''}`;

  if (job.apply_method === 'email' && job.apply_email) {
    return (
      <a href={`mailto:${job.apply_email}?subject=Application: ${job.title}`} className={`${baseClass} bg-[#FF6B35] text-white hover:bg-[#e55a24]`}>
        Apply via Email
      </a>
    );
  }
  if (job.apply_method === 'url' && job.apply_url) {
    return (
      <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className={`${baseClass} bg-[#FF6B35] text-white hover:bg-[#e55a24]`}>
        Apply Now <ExternalLink className="w-4 h-4" />
      </a>
    );
  }
  if (job.apply_method === 'whatsapp' && job.apply_whatsapp) {
    return (
      <a href={`https://wa.me/${job.apply_whatsapp}`} target="_blank" rel="noopener noreferrer" className={`${baseClass} bg-green-600 text-white hover:bg-green-700`}>
        <MessageCircle className="w-4 h-4" /> Apply on WhatsApp
      </a>
    );
  }
  // Walk-in
  return (
    <button className={`${baseClass} bg-[#FF6B35] text-white hover:bg-[#e55a24]`}>
      <MapPin className="w-4 h-4" /> Walk-in Interview
    </button>
  );
}
