'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_LINKS = [
  { href: '/admin',            label: 'Dashboard',       icon: '⊞' },
  { href: '/admin/jobs',       label: 'Jobs',            icon: '💼' },
  { href: '/admin/users',      label: 'Users',           icon: '👥' },
  { href: '/admin/employers',  label: 'Employers',       icon: '🏢' },
  { href: '/admin/categories', label: 'Categories',      icon: '🗂' },
  { href: '/admin/countries',  label: 'Countries',       icon: '🌍' },
  { href: '/admin/products',   label: 'Products / Banners', icon: '🖼' },
  { href: '/admin/cms',        label: 'CMS Content',     icon: '📝' },
  { href: '/admin/seo',        label: 'SEO',             icon: '🔍' },
  { href: '/admin/settings',   label: 'Settings',        icon: '⚙' },
  { href: '/admin/analytics',  label: 'Analytics',       icon: '📊' },
  { href: '/admin/admins',     label: 'Admin Users',     icon: '🔐' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('admin_token');
    if (!token && pathname !== '/admin/login') {
      router.replace('/secure-portal-9x4m7k');
      return;
    }
    const name = localStorage.getItem('admin_name');
    if (name) setAdminName(name);
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    router.replace('/secure-portal-9x4m7k');
  };

  // Don't render layout on login page
  if (pathname === '/admin/login') return <>{children}</>;

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-[#1A3C6E] text-lg font-semibold">Loading…</div>
      </div>
    );
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (!token) return null;

  const pageTitle = NAV_LINKS.find((l) => l.href === pathname)?.label ?? 'Admin Panel';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-[#1A3C6E] transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <div>
            <span className="text-[#FFB400] font-bold text-lg tracking-wide">UAE Careers</span>
            <span className="block text-white/60 text-xs">Admin Panel</span>
          </div>
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 mb-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FF6B35] text-white'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span className="text-base leading-none">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Version */}
        <div className="px-4 py-3 border-t border-white/10 text-white/40 text-xs">
          UAE Careers v1.0
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-600 hover:text-[#1A3C6E] p-1"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-[#1A3C6E]">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/profile" className="hidden sm:flex items-center gap-2 text-sm text-gray-600 hover:text-[#1A3C6E] transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#1A3C6E] text-white flex items-center justify-center text-xs font-bold">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium">{adminName}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
