'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SecureAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const SUPER_ADMINS: Record<string, { password: string; name: string }> = {
    'admin@uaecareer.ae': { password: 'Admin@123456', name: 'Super Admin' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Local super admin check — works without API
    const local = SUPER_ADMINS[email.toLowerCase().trim()];
    if (local && local.password === password) {
      localStorage.setItem('admin_token', 'local_super_admin_token');
      localStorage.setItem('admin_name', local.name);
      router.replace('/admin');
      setLoading(false);
      return;
    }

    // Fallback: try live API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://jobs-production-7093.up.railway.app';
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Invalid credentials');
      }

      const data = await res.json();
      const user = data.data?.user || data.user || data;
      if (!['SUPER_USER', 'ADMIN', 'super_user', 'admin'].includes(user.role)) {
        throw new Error('Access denied. Admin accounts only.');
      }
      localStorage.setItem('admin_token', data.data?.accessToken || data.accessToken || '');
      localStorage.setItem('admin_name', user.firstName || user.email || 'Admin');
      router.replace('/admin');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    localStorage.setItem('admin_token', 'demo_admin_token');
    localStorage.setItem('admin_name', 'Super Admin');
    router.replace('/admin');
  };

  return (
    <div className="min-h-screen bg-[#1A3C6E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-[#1A3C6E] px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FFB400] mb-4">
              <span className="text-2xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-white">UAE Careers</h1>
            <p className="text-white/70 text-sm mt-1">Admin Panel</p>
          </div>

          <div className="px-8 py-8">
            <h2 className="text-gray-800 text-lg font-semibold mb-6">Sign in to continue</h2>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@uaecareer.ae"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#1A3C6E] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d2444] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={handleDemoLogin}
                className="w-full rounded-lg border border-[#FF6B35] px-4 py-2.5 text-sm font-medium text-[#FF6B35] hover:bg-orange-50 transition-colors"
              >
                Demo Login (skip API)
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          UAE Careers © {new Date().getFullYear()} · Restricted Access
        </p>
      </div>
    </div>
  );
}
