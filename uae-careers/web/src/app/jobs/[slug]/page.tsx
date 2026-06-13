import type { Metadata } from 'next';
import Link from 'next/link';
import {
  MapPin, Briefcase, Clock, DollarSign, AlertTriangle,
  Share2, Bookmark, ExternalLink, MessageCircle, Linkedin, Twitter,
  CalendarDays, Building2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';
import ProductBanners from '@/components/ui/ProductBanners';
import JobCard from '@/components/ui/JobCard';
import { formatSalary, timeAgo } from '@/lib/utils';
import type { Job, ProductBanner } from '@/types';

// In production, fetch from API. Here we use mock data.
async function getJob(slug: string): Promise<Job | null> {
  return {
    id: 1,
    slug,
    title: 'Senior Software Engineer',
    company: { id: 1, name: 'Emirates Group', slug: 'emirates-group', logo: undefined },
    location_city: 'Dubai',
    location_country: 'UAE',
    country_code: 'ae',
    salary_min: 15000,
    salary_max: 25000,
    salary_currency: 'AED',
    job_type: 'full_time',
    experience_level: '5+ Years',
    category: { id: 1, name: 'Information Technology', slug: 'it' },
    description: `<p>We are looking for a talented Senior Software Engineer to join our world-class technology team at Emirates Group. You will work on cutting-edge systems powering one of the world's leading airlines and travel companies.</p>
<p>This is a unique opportunity to build at scale, collaborate with global teams, and make a real impact on millions of passengers each year.</p>`,
    responsibilities: `<ul>
<li>Design, develop and maintain scalable backend services using Python/Node.js</li>
<li>Collaborate with product managers and designers to deliver high-quality features</li>
<li>Lead code reviews and mentor junior engineers</li>
<li>Participate in on-call rotations and incident response</li>
<li>Drive architectural decisions and technology choices</li>
</ul>`,
    requirements: `<ul>
<li>Bachelor's degree in Computer Science or related field</li>
<li>5+ years of professional software development experience</li>
<li>Strong expertise in Python, JavaScript/TypeScript, or similar</li>
<li>Experience with cloud platforms (AWS, Azure, or GCP)</li>
<li>Knowledge of microservices and distributed systems</li>
<li>Excellent communication skills</li>
</ul>`,
    important_note: 'This is a direct-hire position. No agencies please. Walk-in interviews are held every Tuesday from 10AM–1PM at Emirates Group Headquarters, Airport Road, Dubai. Bring your CV and original certificates.',
    apply_method: 'walkin',
    is_sponsored: false,
    is_featured: true,
    is_walk_in: true,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };
}

const MOCK_BANNERS: ProductBanner[] = [
  { id: 1, name: 'CV Builder Pro', description: 'Create a professional CV in minutes — ATS-optimized templates for Gulf jobs.', url: '#', image: undefined },
  { id: 2, name: 'Interview Prep', description: 'Practice 500+ Gulf interview questions with AI coaching.', url: '#', image: undefined },
  { id: 3, name: 'LinkedIn Optimizer', description: 'Get 3× more recruiter views with our Gulf-focused LinkedIn audit.', url: '#', image: undefined },
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
                    <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`${job.title} at ${job.company.name}`)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sky-500 hover:underline"
                  >
                    <Twitter className="w-3.5 h-3.5" /> Twitter
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
