'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronRight, TrendingUp, MessageCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FraudNotice from '@/components/ui/FraudNotice';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz1J0M0KO115tNi-KztLszF5y-dZpj-j37YUYWLcHWALfhkRL5570wU8IRu8QkkT9DXkw/exec';

const CATEGORIES = [
  { id: 1, name: 'Information Technology', slug: 'it', icon: '💻' },
  { id: 2, name: 'Engineering', slug: 'engineering', icon: '⚙️' },
  { id: 3, name: 'Accounting & Finance', slug: 'accounting', icon: '📊' },
  { id: 4, name: 'Medical & Healthcare', slug: 'medical', icon: '🏥' },
  { id: 5, name: 'Sales & Marketing', slug: 'sales', icon: '📈' },
  { id: 6, name: 'HR & Administration', slug: 'hr', icon: '👔' },
  { id: 7, name: 'Construction', slug: 'construction', icon: '🏗️' },
  { id: 8, name: 'Hospitality', slug: 'hospitality', icon: '🏨' },
];

const EMIRATES = [
  { flag: '🏙️', name: 'Dubai', code: 'dubai' },
  { flag: '🏛️', name: 'Abu Dhabi', code: 'abu-dhabi' },
  { flag: '🌆', name: 'Sharjah', code: 'sharjah' },
  { flag: '🏘️', name: 'Ajman', code: 'ajman' },
  { flag: '⛰️', name: 'Ras Al Khaimah', code: 'rak' },
  { flag: '🌊', name: 'Fujairah', code: 'fujairah' },
];

const SALARY_GUIDES = [
  { role: 'Software Engineer', min: 10000, max: 30000, currency: 'AED' },
  { role: 'Civil Engineer', min: 8000, max: 20000, currency: 'AED' },
  { role: 'Registered Nurse', min: 6000, max: 16000, currency: 'AED' },
  { role: 'Marketing Manager', min: 12000, max: 28000, currency: 'AED' },
];

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

function WhatsAppSignup({ sourcePage = 'homepage' }: { sourcePage?: string }) {
  const [countryCode, setCountryCode] = useState('+971');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = phone.replace(/\D/g, '').length >= 7;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setLoading(true);
    setError('');
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp_signup', phone: countryCode + phone, sourcePage }),
      });
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-2">
        <p className="text-3xl mb-2">✅</p>
        <p className="font-semibold text-gray-800">Joined! Your first jobs message comes tomorrow morning.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <div className={`flex flex-1 rounded-xl overflow-hidden border-2 ${touched && !isValid ? 'border-red-400' : 'border-[#25D366]'} focus-within:ring-2 focus-within:ring-[#25D366]`}>
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="bg-gray-50 text-sm px-2 border-r border-gray-200 focus:outline-none"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
          <input
            type="tel"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-1 px-3 py-3 text-sm focus:outline-none bg-white"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-5 py-3 rounded-xl transition-colors whitespace-nowrap disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          Join Free
        </button>
      </div>
      {touched && !isValid && <p className="text-red-500 text-xs text-center mt-2">Please enter a valid phone number.</p>}
      {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
    </form>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#1A3C6E] text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Find Your Dream Job in the UAE
            </h1>
            <p className="text-blue-200 text-base sm:text-lg mb-8">
              Jobs across Dubai, Abu Dhabi, Sharjah and all emirates — updated daily.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const q = (e.currentTarget.elements.namedItem('q') as HTMLInputElement)?.value ?? '';
                const city = (e.currentTarget.elements.namedItem('city') as HTMLSelectElement)?.value ?? '';
                const params = new URLSearchParams();
                if (q) params.set('q', q);
                if (city) params.set('city', city);
                window.location.href = `/jobs${params.toString() ? `?${params.toString()}` : ''}`;
              }}
            >
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  name="q"
                  type="text"
                  placeholder="Job title, keyword or company"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 bg-white text-sm border-2 border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35] placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select name="city" className="pl-10 pr-8 py-3 rounded-xl text-gray-900 bg-white text-sm border-2 border-[#FF6B35] focus:outline-none appearance-none w-full sm:w-44">
                  <option value="">All Emirates</option>
                  {EMIRATES.map((e) => (
                    <option key={e.code} value={e.code}>{e.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-6 py-3 rounded-xl transition-colors whitespace-nowrap">
                Search Jobs
              </button>
            </form>
            <p className="text-white/70 text-sm mt-4">
              Popular:{' '}
              {['Software Engineer', 'Civil Engineer', 'Nurse', 'Accountant', 'Driver'].map((t, i) => (
                <span key={t}>
                  <a href={`/jobs?q=${encodeURIComponent(t)}`} className="text-[#FF6B35] hover:underline">{t}</a>
                  {i < 4 && ', '}
                </span>
              ))}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Fraud Notice */}
          <FraudNotice />

          {/* WhatsApp Signup */}
          <section id="whatsapp-signup" className="bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                📲 Get Daily UAE Jobs on WhatsApp — Free
              </h2>
            </div>
            <p className="text-gray-500 text-sm mb-5">
              Join professionals getting jobs delivered to their phone first
            </p>
            <WhatsAppSignup sourcePage="homepage" />
          </section>

          {/* Latest Jobs */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-[#1A3C6E]">Latest Jobs</h2>
              <Link href="/jobs" className="text-sm font-medium text-[#FF6B35] flex items-center gap-1 hover:underline">
                Browse all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="font-medium text-gray-600">No jobs listed yet</p>
              <p className="text-sm text-gray-400 mt-1">We&apos;re adding jobs daily. Join our WhatsApp to get notified first.</p>
              <a href="#whatsapp-signup" className="inline-flex items-center gap-2 mt-4 bg-[#25D366] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#1da851] transition-colors">
                <MessageCircle className="w-4 h-4" /> Get Notified on WhatsApp
              </a>
            </div>
          </section>

          {/* Browse by Category */}
          <section>
            <h2 className="text-2xl font-bold text-[#1A3C6E] mb-5">Browse by Category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/jobs?category=${cat.slug}`}
                  className="bg-white rounded-xl border border-gray-200 p-5 text-center hover:border-[#1A3C6E] hover:shadow-md transition-all group"
                >
                  <span className="text-3xl block mb-2">{cat.icon}</span>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1A3C6E]">{cat.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse by Emirate */}
          <section>
            <h2 className="text-2xl font-bold text-[#1A3C6E] mb-5">Browse by Emirate</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {EMIRATES.map((e) => (
                <Link
                  key={e.code}
                  href={`/jobs?city=${e.code}`}
                  className="bg-white rounded-xl border border-gray-200 p-4 text-center hover:border-[#1A3C6E] hover:shadow-md transition-all group"
                >
                  <span className="text-4xl block mb-1">{e.flag}</span>
                  <p className="text-sm font-semibold text-gray-800 group-hover:text-[#1A3C6E]">{e.name}</p>
                </Link>
              ))}
            </div>
          </section>

          {/* Salary Guides */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <TrendingUp className="w-6 h-6 text-[#FF6B35]" />
              <h2 className="text-2xl font-bold text-[#1A3C6E]">Salary Guides</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SALARY_GUIDES.map((s) => (
                <div key={s.role} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                  <p className="font-semibold text-gray-900 mb-2">{s.role}</p>
                  <p className="text-lg font-bold text-[#1A3C6E]">
                    {s.currency} {s.min.toLocaleString()} – {s.max.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">per month</p>
                  <Link href={`/salary-guide?role=${encodeURIComponent(s.role)}`} className="text-xs text-[#FF6B35] font-medium mt-3 inline-block hover:underline">
                    View details →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* CV Service CTA */}
          <section className="bg-gradient-to-r from-[#1A3C6E] to-[#0f2447] rounded-2xl p-6 sm:p-10 text-white text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">Not getting enough interview calls?</h2>
            <p className="text-blue-200 mb-6 max-w-xl mx-auto">
              75% of CVs are rejected by ATS software before a human sees them. Our experts rewrite your CV to pass ATS and impress recruiters.
            </p>
            <Link href="/cv-service" className="inline-block bg-[#FF6B35] hover:bg-[#e55a24] text-white font-semibold px-8 py-3 rounded-xl transition-colors">
              View CV Service Plans →
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
