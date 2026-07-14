'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  Briefcase,
  LayoutDashboard,
  User,
  Bookmark,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderUser {
  first_name: string;
  last_name: string;
  avatar?: string;
  role: 'seeker' | 'employer' | 'admin';
}

interface HeaderProps {
  user?: HeaderUser | null;
}

const NAV_LINKS = [
  { href: '/jobs', label: 'Jobs' },
  { href: '/companies', label: 'Companies' },
  { href: '/salary-guide', label: 'Salary Guide' },
  { href: '/cv-service', label: 'CV Service' },
];

function getInitials(first: string, last: string) {
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
}

export default function Header({ user }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [customLogo, setCustomLogo] = useState('');
  const [customName, setCustomName] = useState('');
  const router = useRouter();

  useEffect(() => {
    setCustomLogo(localStorage.getItem('site_logo') || '');
    setCustomName(localStorage.getItem('site_name') || '');
  }, []);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    router.push('/auth/login');
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            {customLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={customLogo} alt={customName || 'UAE Careers'} className="h-9 w-auto object-contain" />
            ) : (
              <>
                <Briefcase className="w-6 h-6 text-[#FF6B35]" />
                <span className="text-xl font-bold text-[#1A3C6E]">{customName || 'UAE Careers'}</span>
              </>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 hover:text-[#1A3C6E] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-[#1A3C6E] focus:outline-none"
                >
                  {user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <span className="w-8 h-8 rounded-full bg-[#1A3C6E] text-white flex items-center justify-center text-xs font-bold">
                      {getInitials(user.first_name, user.last_name)}
                    </span>
                  )}
                  <span>{user.first_name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {dropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 z-20 py-1">
                      <DropdownItem
                        href={user.role === 'employer' ? '/employer/dashboard' : '/dashboard'}
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Dashboard"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <DropdownItem
                        href="/profile"
                        icon={<User className="w-4 h-4" />}
                        label="Profile"
                        onClick={() => setDropdownOpen(false)}
                      />
                      {user.role === 'seeker' && (
                        <DropdownItem
                          href="/saved-jobs"
                          icon={<Bookmark className="w-4 h-4" />}
                          label="Saved Jobs"
                          onClick={() => setDropdownOpen(false)}
                        />
                      )}
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium text-gray-600 hover:text-[#1A3C6E] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/cv-service"
                  className="text-sm font-semibold bg-[#FF6B35] text-white px-4 py-2 rounded-lg hover:bg-[#e55a24] transition-colors"
                >
                  Get Your CV Done
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-[#1A3C6E]"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-700 hover:text-[#1A3C6E]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className={cn('px-4 py-3 border-t border-gray-100 flex gap-3', user && 'flex-col')}>
            {user ? (
              <>
                <Link
                  href={user.role === 'employer' ? '/employer/dashboard' : '/dashboard'}
                  className="block py-2 text-sm font-medium text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block py-2 text-sm font-medium text-gray-700"
                  onClick={() => setMobileOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-left py-2 text-sm font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex-1 text-center text-sm font-medium text-[#1A3C6E] border border-[#1A3C6E] px-4 py-2 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/cv-service"
                  className="flex-1 text-center text-sm font-semibold bg-[#FF6B35] text-white px-4 py-2 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Your CV Done
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function DropdownItem({
  href,
  icon,
  label,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
