import Link from 'next/link';
import { Briefcase, AlertTriangle } from 'lucide-react';

const JOBS_BY_COUNTRY = [
  { label: 'Dubai Jobs', href: '/jobs?city=dubai' },
  { label: 'Abu Dhabi Jobs', href: '/jobs?city=abu-dhabi' },
  { label: 'Sharjah Jobs', href: '/jobs?city=sharjah' },
  { label: 'Ajman Jobs', href: '/jobs?city=ajman' },
  { label: 'Ras Al Khaimah Jobs', href: '/jobs?city=rak' },
  { label: 'Fujairah Jobs', href: '/jobs?city=fujairah' },
];

const CATEGORIES = [
  { label: 'Accounting & Finance', href: '/jobs?category=accounting' },
  { label: 'IT & Technology', href: '/jobs?category=it' },
  { label: 'Engineering', href: '/jobs?category=engineering' },
  { label: 'Medical & Healthcare', href: '/jobs?category=medical' },
  { label: 'HR & Administration', href: '/jobs?category=hr' },
];

const SERVICES_LINKS = [
  { label: 'CV Optimization Service', href: '/cv-service' },
  { label: 'Daily WhatsApp Jobs', href: 'https://wa.me/971556650797?text=Hi%2C+I%27d+like+to+receive+daily+UAE+job+alerts' },
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="w-6 h-6 text-[#FF6B35]" />
              <span className="text-xl font-bold">UAE Careers</span>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-4">
              Your trusted gateway to UAE job opportunities. Connecting talent with top
              employers across all emirates.
            </p>
            {/* Social icons — placeholders until accounts are ready */}
            <div className="flex gap-3">
              <a href="https://wa.me/971556650797" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </a>
            </div>
          </div>

          {/* Jobs by Country */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFB400] mb-4">
              Jobs by Emirate
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

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFB400] mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {SERVICES_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-blue-200 hover:text-white transition-colors">
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
            Jobs across UAE — Dubai · Abu Dhabi · Sharjah · Ajman · RAK · Fujairah
          </p>
        </div>
      </div>
    </footer>
  );
}
