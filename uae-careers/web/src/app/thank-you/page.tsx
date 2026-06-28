'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle, MessageCircle, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz1J0M0KO115tNi-KztLszF5y-dZpj-j37YUYWLcHWALfhkRL5570wU8IRu8QkkT9DXkw/exec';
const WA_NUMBER = '971556650797';

const CV_TIERS = [
  {
    name: 'Basic CV Review',
    price: 40,
    desc: 'ATS compatibility check + expert written feedback. Delivery in 48 hours.',
    features: ['ATS compatibility scan', 'Written feedback report', '48-hour turnaround'],
    popular: false,
  },
  {
    name: 'Professional Rewrite',
    price: 120,
    desc: 'Full ATS-optimized CV rewrite + cover letter. Delivery in 48 hours.',
    features: ['Complete CV rewrite', 'ATS-optimized formatting', 'Custom cover letter', '48-hour turnaround'],
    popular: true,
  },
  {
    name: 'Premium Package',
    price: 250,
    desc: 'Resume + Cover Letter + LinkedIn rewrite + Interview prep document.',
    features: ['Complete CV rewrite', 'Cover letter', 'LinkedIn profile rewrite', 'Interview prep guide'],
    popular: false,
  },
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

function WaSignup() {
  const [cc, setCc] = useState('+971');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);
  const isValid = phone.replace(/\D/g, '').length >= 7;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setLoading(true);
    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST', mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'whatsapp_signup', phone: cc + phone, sourcePage: 'thank-you' }),
      });
      setSuccess(true);
    } catch { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  }

  if (success) return (
    <div className="text-center py-3">
      <p className="text-3xl mb-2">✅</p>
      <p className="font-semibold text-gray-800">Joined! First jobs message comes tomorrow morning.</p>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <div className={`flex flex-1 rounded-xl overflow-hidden border-2 ${touched && !isValid ? 'border-red-400' : 'border-[#25D366]'} focus-within:ring-2 focus-within:ring-[#25D366]`}>
          <select value={cc} onChange={(e) => setCc(e.target.value)} className="bg-gray-50 text-sm px-2 border-r border-gray-200 focus:outline-none">
            {COUNTRY_CODES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
          <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 px-3 py-3 text-sm focus:outline-none" />
        </div>
        <button type="submit" disabled={loading} className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-70 whitespace-nowrap">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
          Join Free
        </button>
      </div>
      {touched && !isValid && <p className="text-red-500 text-xs text-center mt-2">Please enter a valid phone number.</p>}
      {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
    </form>
  );
}

export default function ThankYouPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-emerald-50 to-white border-b border-emerald-100 py-12 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Application Sent Successfully
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto">
              We&apos;ve forwarded your application to the employer. While you wait, boost your chances of getting interview calls.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/jobs" className="text-sm font-medium text-[#1A3C6E] border border-[#1A3C6E] px-5 py-2.5 rounded-xl hover:bg-[#1A3C6E] hover:text-white transition-colors">
                Browse More Jobs
              </Link>
            </div>
          </div>
        </section>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-14">
          {/* CV Tiers */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Want 3× more interview calls?</h2>
              <p className="text-gray-500 mt-2 max-w-lg mx-auto">
                75% of CVs are filtered by ATS software before a recruiter sees them. Our UAE experts fix that.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {CV_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${tier.popular ? 'border-[#FF6B35] shadow-lg' : 'border-gray-200'}`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-[#FF6B35] text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">MOST POPULAR</span>
                    </div>
                  )}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 text-lg">{tier.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-[#1A3C6E]">AED {tier.price}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">{tier.desc}</p>
                  </div>
                  <ul className="space-y-2 flex-1 mb-6">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-emerald-500 font-bold">✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(`Hi! I want to order ${tier.name} - AED ${tier.price}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-colors ${tier.popular ? 'bg-[#FF6B35] hover:bg-[#e55a24] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                  >
                    <MessageCircle className="w-4 h-4" /> Order on WhatsApp
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* WhatsApp signup */}
          <section className="bg-gradient-to-br from-[#25D366]/10 to-[#128C7E]/10 border border-[#25D366]/30 rounded-2xl p-6 sm:p-8 text-center">
            <MessageCircle className="w-8 h-8 text-[#25D366] mx-auto mb-3" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1">
              Get Daily UAE Jobs on WhatsApp — Free
            </h2>
            <p className="text-gray-500 text-sm mb-5">Join professionals getting jobs delivered to their phone every morning</p>
            <WaSignup />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
