'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  MapPin, Briefcase, Clock, DollarSign, AlertTriangle,
  Share2, ExternalLink, MessageCircle, CalendarDays, Building2, X, Loader2,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';
import JobCard from '@/components/ui/JobCard';
import { formatSalary, timeAgo } from '@/lib/utils';
import type { Job } from '@/types';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz1J0M0KO115tNi-KztLszF5y-dZpj-j37YUYWLcHWALfhkRL5570wU8IRu8QkkT9DXkw/exec';

// Mock job catalogue keyed by slug
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
  `<p>Deliver high-quality financial analysis to support strategic decision-making. You will build models, prepare reports, and present insights to senior leadership.</p>`,
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
  requirements: `<ul><li>Bachelor's degree in a relevant field</li><li>3+ years of relevant experience, preferably in the UAE</li><li>Strong communication and stakeholder management skills</li><li>Valid UAE work authorisation or eligibility to obtain it</li></ul>`,
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

const RELATED_JOBS: Job[] = ALL_MOCK_JOBS.slice(0, 3);

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract',
  internship: 'Internship', freelance: 'Freelance',
};

const COUNTRY_CODES = [
  { code: '+971', label: '🇦🇪 +971' },
  { code: '+966', label: '🇸🇦 +966' },
  { code: '+91', label: '🇮🇳 +91' },
  { code: '+92', label: '🇵🇰 +92' },
  { code: '+63', label: '🇵🇭 +63' },
  { code: '+880', label: '🇧🇩 +880' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+1', label: '🇺🇸 +1' },
];

// ─── Apply Modal ───────────────────────────────────────────────────────────────
function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', countryCode: '+971', phone: '',
    experience: '', visaStatus: '', whatsappOptIn: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email is required';
    if (form.phone.replace(/\D/g, '').length < 7) e.phone = 'Valid phone number is required';
    if (!form.experience) e.experience = 'Please select your experience';
    if (!form.visaStatus) e.visaStatus = 'Please select your visa status';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    setSubmitError('');
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'application',
          jobId: job.id,
          jobTitle: job.title,
          company: job.company.name,
          name: form.name,
          email: form.email,
          phone: form.countryCode + form.phone,
          experience: form.experience,
          visaStatus: form.visaStatus,
          whatsappOptIn: form.whatsappOptIn,
        }),
      });
      router.push('/thank-you');
    } catch {
      setSubmitError('Something went wrong. Please try again or email ask@uaecareer.ae');
      setLoading(false);
    }
  }

  const fieldCls = (field: string) =>
    `w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-y-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Apply Now</h2>
            <p className="text-sm text-gray-500 mt-0.5">{job.title} · {job.company.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Ahmed Al Mansouri" className={fieldCls('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className={fieldCls('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone <span className="text-red-500">*</span></label>
            <div className={`flex rounded-xl overflow-hidden border ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-[#1A3C6E]`}>
              <select value={form.countryCode} onChange={(e) => set('countryCode', e.target.value)} className="bg-gray-50 text-sm px-3 border-r border-gray-200 focus:outline-none py-3">
                {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
              <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="555 123 4567" className="flex-1 px-3 py-3 text-sm focus:outline-none bg-transparent" />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* WhatsApp opt-in */}
          <label className="flex items-start gap-3 cursor-pointer bg-green-50 rounded-xl p-3 border border-green-200">
            <input type="checkbox" checked={form.whatsappOptIn} onChange={(e) => set('whatsappOptIn', e.target.checked)} className="mt-0.5 w-4 h-4 accent-[#25D366]" />
            <div>
              <span className="text-sm font-medium text-gray-800">📲 Send me daily UAE jobs on WhatsApp</span>
              <p className="text-xs text-gray-500 mt-0.5">Get fresh job alerts every morning — free</p>
            </div>
          </label>

          {/* Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience <span className="text-red-500">*</span></label>
            <select value={form.experience} onChange={(e) => set('experience', e.target.value)} className={fieldCls('experience')}>
              <option value="">Select experience level</option>
              <option value="Fresher (0-1 years)">Fresher (0–1 years)</option>
              <option value="1-3 years">1–3 years</option>
              <option value="3-5 years">3–5 years</option>
              <option value="5-10 years">5–10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
            {errors.experience && <p className="text-red-500 text-xs mt-1">{errors.experience}</p>}
          </div>

          {/* Visa Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Visa Status <span className="text-red-500">*</span></label>
            <select value={form.visaStatus} onChange={(e) => set('visaStatus', e.target.value)} className={fieldCls('visaStatus')}>
              <option value="">Select visa status</option>
              <option value="Visit Visa">Visit Visa</option>
              <option value="Employment Visa">Employment Visa</option>
              <option value="Husband/Wife/Father Visa">Husband / Wife / Father Visa</option>
              <option value="Looking for Sponsor">Looking for Sponsor</option>
              <option value="Outside UAE">Outside UAE</option>
            </select>
            {errors.visaStatus && <p className="text-red-500 text-xs mt-1">{errors.visaStatus}</p>}
          </div>

          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">{submitError}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e55a24] text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-70 text-base"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : 'Apply Now'}
          </button>
          <p className="text-center text-xs text-gray-400">
            Your details are sent directly to the employer. We never charge for applications.
          </p>
        </form>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function JobDetailPage() {
  const rawParams = useParams();
  const slug = typeof rawParams.slug === 'string' ? rawParams.slug : Array.isArray(rawParams.slug) ? rawParams.slug[0] : '';
  const job = JOB_BY_SLUG.get(slug) ?? null;
  const [modalOpen, setModalOpen] = useState(false);

  if (!job) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
            <p className="text-gray-500 mb-4">This job may have expired or been removed.</p>
            <Link href="/jobs" className="text-[#FF6B35] font-medium hover:underline">Browse all jobs →</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const posted = timeAgo(job.created_at);
  const jobType = JOB_TYPE_LABELS[job.job_type] ?? job.job_type;
  const shareText = `${job.title} at ${job.company.name} — https://uaecareer.ae/jobs/${slug}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {modalOpen && <ApplyModal job={job} onClose={() => setModalOpen(false)} />}

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6"><FraudNotice /></div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main column */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Job header card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{job.company.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {job.is_walk_in && <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full">Walk-in Interview</span>}
                      {job.is_featured && <span className="text-xs font-semibold bg-[#FFB400] text-white px-2.5 py-1 rounded-full">Featured</span>}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                    <p className="text-[#1A3C6E] font-medium mt-1">{job.company.name}</p>
                  </div>
                </div>

                {/* Meta */}
                <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />🇦🇪 {job.location_city}, {job.location_country}</span>
                  {salary && <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-gray-400" /><strong className="text-gray-900">{salary}</strong></span>}
                  <span className="flex items-center gap-1.5"><Briefcase className="w-4 h-4 text-gray-400" />{jobType}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />{posted}</span>
                  <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-gray-400" />{job.category.name}</span>
                  {job.experience_level && <span className="flex items-center gap-1.5"><CalendarDays className="w-4 h-4 text-gray-400" />{job.experience_level} experience</span>}
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex items-center gap-2 bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: job.title, text: shareText });
                      } else {
                        navigator.clipboard?.writeText(`https://uaecareer.ae/jobs/${slug}`).then(() => alert('Link copied to clipboard!'));
                      }
                    }}
                    className="flex items-center gap-2 border border-gray-200 text-gray-700 font-medium px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>

                {/* Share links */}
                <div className="mt-4 flex items-center gap-3 text-xs text-gray-500">
                  <span>Share:</span>
                  <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://uaecareer.ae/jobs/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                    <ExternalLink className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                </div>
              </div>

              {/* Important Note */}
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
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: job.description }} />
              </section>

              {/* Responsibilities */}
              {job.responsibilities && (
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Responsibilities</h2>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: job.responsibilities }} />
                </section>
              )}

              {/* Requirements */}
              {job.requirements && (
                <section className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Requirements</h2>
                  <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: job.requirements }} />
                </section>
              )}

            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-72 flex-shrink-0 space-y-5">
              <div className="bg-[#1A3C6E] rounded-xl p-5 text-white sticky top-20">
                <h3 className="font-bold text-lg mb-1">Ready to Apply?</h3>
                <p className="text-blue-200 text-sm mb-4">
                  {job.is_walk_in ? 'This is a walk-in interview — visit the venue directly.' : 'Submit your application now.'}
                </p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
                >
                  Apply Now
                </button>
              </div>

              {/* CV Service upsell */}
              <div className="bg-gradient-to-br from-[#1A3C6E]/5 to-[#FF6B35]/5 border border-[#1A3C6E]/20 rounded-xl p-5">
                <p className="text-sm font-bold text-[#1A3C6E] mb-1">Stand out from the crowd</p>
                <p className="text-xs text-gray-600 mb-3">Get your CV professionally rewritten to beat ATS and impress recruiters.</p>
                <Link href="/cv-service" className="block text-center text-xs font-semibold bg-[#1A3C6E] text-white px-4 py-2 rounded-lg hover:bg-[#0d2444] transition-colors">
                  View CV Service Plans
                </Link>
              </div>

              {/* Related jobs */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Similar Jobs</h3>
                <div className="space-y-3">
                  {RELATED_JOBS.filter((rj) => rj.slug !== slug).slice(0, 3).map((rj) => (
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
