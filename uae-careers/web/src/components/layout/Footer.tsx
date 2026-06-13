import Link from 'next/link';
import { Briefcase, Twitter, Linkedin, Facebook, Instagram, AlertTriangle } from 'lucide-react';

const JOBS_BY_COUNTRY = [
  { label: 'UAE Jobs', href: '/jobs?country=ae' },
  { label: 'Saudi Arabia Jobs', href: '/jobs?country=sa' },
  { label: 'Qatar Jobs', href: '/jobs?country=qa' },
  { label: 'Kuwait Jobs', href: '/jobs?country=kw' },
  { label: 'Oman Jobs', href: '/jobs?country=om' },
  { label: 'Bahrain Jobs', href: '/jobs?country=bh' },
];

const CATEGORIES = [
  { label: 'Accounting & Finance', href: '/jobs?category=accounting' },
  { label: 'IT & Technology', href: '/jobs?category=it' },
  { label: 'Engineering', href: '/jobs?category=engineering' },
  { label: 'Medical & Healthcare', href: '/jobs?category=medical' },
  { label: 'HR & Administration', href: '/jobs?category=hr' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#1A3C6E] text-white">
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-6 h-6 text-[#FF6B35]" />
              <span className="text-xl font-bold">UAE Careers</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Your trusted gateway to Gulf job opportunities. Connecting talent with top
              employers across the Middle East.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#FF6B35] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Jobs by Country */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFB400] mb-4">
              Jobs by Country
            </h3>
            <ul className="space-y-2">
              {JOBS_BY_COUNTRY.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFB400] mb-4">
              Job Categories
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFB400] mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-blue-200 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Fraud warning */}
      <div className="border-t border-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-start gap-2 text-amber-300 text-xs leading-relaxed">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Fraud Warning:</strong> uaecareer.ae is not a recruiter. We only share
              publicly available walk-in opportunities. Never pay anyone for job applications,
              interviews, tests, or recruitment processes. Genuine walk-ins are always free.
              Report fraud to:{' '}
              <a href="mailto:ask@uaecareer.ae" className="underline hover:text-white">
                ask@uaecareer.ae
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-blue-900 bg-[#0d2444]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-blue-300">
            &copy; {year} UAE Careers. All rights reserved.
          </p>
          <p className="text-xs text-blue-400">
            Jobs in UAE, Saudi Arabia, Qatar, Kuwait, Oman &amp; Bahrain
          </p>
        </div>
      </div>
    </footer>
  );
}
