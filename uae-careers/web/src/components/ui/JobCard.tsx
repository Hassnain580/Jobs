'use client';

import Link from 'next/link';
import { MapPin, Bookmark, Clock, Star } from 'lucide-react';
import { cn, formatSalary, timeAgo } from '@/lib/utils';
import type { Job } from '@/types';

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  internship: 'Internship',
  freelance: 'Freelance',
};

const COUNTRY_FLAGS: Record<string, string> = {
  ae: '🇦🇪',
  sa: '🇸🇦',
  qa: '🇶🇦',
  kw: '🇰🇼',
  om: '🇴🇲',
  bh: '🇧🇭',
};

interface JobCardProps {
  job: Job;
  onSave?: (jobId: number) => void;
  isSaved?: boolean;
  className?: string;
}

function CompanyLogo({ name, logo }: { name: string; logo?: string }) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logo}
        alt={name}
        className="w-12 h-12 rounded-xl object-contain border border-gray-100"
      />
    );
  }

  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-12 h-12 rounded-xl bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm font-bold">{initials}</span>
    </div>
  );
}

export default function JobCard({ job, onSave, isSaved, className }: JobCardProps) {
  const flag = COUNTRY_FLAGS[job.country_code?.toLowerCase()] ?? '🌍';
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const postedAgo = timeAgo(job.created_at);
  const jobTypeLabel = JOB_TYPE_LABELS[job.job_type] ?? job.job_type;

  return (
    <div
      className={cn(
        'relative bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col gap-3',
        job.is_featured && 'border-[#FFB400] shadow-sm ring-1 ring-[#FFB400]/30',
        className
      )}
    >
      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5 absolute top-3 right-3">
        {job.is_sponsored && (
          <span className="text-[10px] font-semibold bg-[#1A3C6E] text-white px-2 py-0.5 rounded-full">
            Sponsored
          </span>
        )}
        {job.is_featured && (
          <span className="text-[10px] font-semibold bg-[#FFB400] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
            <Star className="w-2.5 h-2.5" /> Featured
          </span>
        )}
        {job.is_walk_in && (
          <span className="text-[10px] font-semibold bg-green-600 text-white px-2 py-0.5 rounded-full">
            Walk-in
          </span>
        )}
      </div>

      {/* Company + Title */}
      <div className="flex items-start gap-3 pr-20">
        <CompanyLogo name={job.company.name} logo={job.company.logo} />
        <div className="min-w-0">
          <Link
            href={`/jobs/${job.slug}`}
            className="font-semibold text-gray-900 hover:text-[#1A3C6E] transition-colors line-clamp-2 leading-tight"
          >
            {job.title}
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{job.company.name}</p>
        </div>
      </div>

      {/* Location + Salary */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          {flag} {job.location_city}, {job.location_country}
        </span>
        <span className="font-medium text-gray-800">{salary}</span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium bg-blue-50 text-[#1A3C6E] px-2.5 py-1 rounded-full">
            {jobTypeLabel}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {postedAgo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={() => onSave(job.id)}
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
              className={cn(
                'p-1.5 rounded-lg transition-colors',
                isSaved
                  ? 'text-[#1A3C6E] bg-blue-50'
                  : 'text-gray-400 hover:text-[#1A3C6E] hover:bg-blue-50'
              )}
            >
              <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />
            </button>
          )}
          <Link
            href={`/jobs/${job.slug}`}
            className="text-xs font-semibold bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg hover:bg-[#e55a24] transition-colors"
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
