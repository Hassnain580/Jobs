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
        className="w-11 h-11 rounded-xl object-contain border border-gray-100 flex-shrink-0"
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
    <div className="w-11 h-11 rounded-xl bg-[#1A3C6E] flex items-center justify-center flex-shrink-0">
      <span className="text-white text-xs font-bold">{initials}</span>
    </div>
  );
}

export default function JobCard({ job, onSave, isSaved, className }: JobCardProps) {
  const salary = formatSalary(job.salary_min, job.salary_max, job.salary_currency);
  const postedAgo = timeAgo(job.created_at);
  const jobTypeLabel = JOB_TYPE_LABELS[job.job_type] ?? job.job_type;

  return (
    <div
      className={cn(
        'relative group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-[#1A3C6E]/30 transition-all flex flex-col gap-3 cursor-pointer',
        job.is_featured && 'border-[#FFB400]/60 shadow-sm ring-1 ring-[#FFB400]/20',
        className
      )}
    >
      {/* Whole-card link sits behind everything */}
      <Link href={`/jobs/${job.slug}`} className="absolute inset-0 rounded-xl" aria-label={job.title} />

      {/* Top row: logo + title/company + badges */}
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company.name} logo={job.company.logo} />

        <div className="flex-1 min-w-0">
          {/* Badges — in flow, above title */}
          {(job.is_sponsored || job.is_featured || job.is_walk_in) && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {job.is_sponsored && (
                <span className="inline-flex items-center text-[10px] font-semibold bg-[#1A3C6E] text-white px-2 py-0.5 rounded-full">
                  Sponsored
                </span>
              )}
              {job.is_featured && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-[#FFB400] text-white px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5" /> Featured
                </span>
              )}
              {job.is_walk_in && (
                <span className="inline-flex items-center text-[10px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Walk-in
                </span>
              )}
            </div>
          )}

          <p className="font-semibold text-gray-900 group-hover:text-[#1A3C6E] transition-colors leading-snug line-clamp-2 text-sm">
            {job.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{job.company.name}</p>
        </div>
      </div>

      {/* Location + Salary */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
        <span className="flex items-center gap-1 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          <span className="truncate">{job.location_city}, {job.location_country}</span>
        </span>
        {salary && (
          <span className="font-semibold text-gray-800 whitespace-nowrap">{salary}</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium bg-blue-50 text-[#1A3C6E] px-2.5 py-1 rounded-full whitespace-nowrap">
            {jobTypeLabel}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-gray-400 whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" />
            {postedAgo}
          </span>
        </div>

        {/* Buttons sit above the card link via z-index */}
        <div className="relative z-10 flex items-center gap-2">
          {onSave && (
            <button
              onClick={(e) => { e.preventDefault(); onSave(job.id); }}
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
            className="text-[11px] font-semibold bg-[#FF6B35] text-white px-3 py-1.5 rounded-lg hover:bg-[#e55a24] transition-colors whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
}
