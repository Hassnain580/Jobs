'use client';

import Link from 'next/link';
import { MessageCircle, CheckCircle, Clock, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const WA_NUMBER = '971556650797';

const CV_TIERS = [
  {
    name: 'Basic CV Review',
    price: 40,
    desc: 'ATS compatibility check + expert written feedback.',
    features: ['ATS compatibility scan', 'Expert written feedback', 'Formatting suggestions', '48-hour delivery'],
    popular: false,
  },
  {
    name: 'Professional Rewrite',
    price: 120,
    desc: 'Full ATS-optimized CV rewrite + cover letter. Delivery in 48 hours.',
    features: ['Complete CV rewrite', 'ATS-optimized formatting', 'Keyword optimization', 'Custom cover letter', '48-hour delivery'],
    popular: true,
  },
  {
    name: 'Premium Package',
    price: 250,
    desc: 'Resume + Cover Letter + LinkedIn rewrite + Interview prep document.',
    features: ['Complete CV rewrite', 'Cover letter', 'LinkedIn profile rewrite', 'Interview prep guide', 'Priority delivery'],
    popular: false,
  },
];

const HOW_IT_WORKS = [
  { step: '1', icon: '💬', title: 'Order on WhatsApp', desc: 'Tap the button below to start a WhatsApp chat with our team. Tell us which package you need.' },
  { step: '2', icon: '📄', title: 'Send Your Current CV', desc: 'Share your existing CV (any format) and the type of roles you\'re targeting in the UAE.' },
  { step: '3', icon: '✅', title: 'Receive Your Optimized CV', desc: 'Our UAE recruitment experts rewrite and optimize your CV. Delivered within 48 hours.' },
];

const FAQS = [
  {
    q: 'Will my CV pass ATS (Applicant Tracking Systems)?',
    a: 'Yes. All our rewrites are specifically formatted to pass ATS software used by UAE companies including Taleo, Workday, and SAP SuccessFactors. We optimize keyword density, structure, and formatting for maximum parse-ability.',
  },
  {
    q: 'How long does it take?',
    a: 'Standard delivery is 48 hours from when you send us your existing CV. Premium Package customers receive priority processing.',
  },
  {
    q: 'Do I need to have a CV already?',
    a: 'No. If you\'re starting from scratch, just tell us your work history, skills, and target role on WhatsApp and we\'ll build your CV from the ground up.',
  },
  {
    q: 'What format will I receive the CV in?',
    a: 'You\'ll receive your CV in both PDF and Word (.docx) formats. The Word version lets you make future edits yourself.',
  },
  {
    q: 'Is my information kept confidential?',
    a: 'Absolutely. Your personal and career information is used solely to write your CV and is never shared with third parties.',
  },
  {
    q: 'What if I\'m not satisfied with the result?',
    a: 'We offer one round of revisions on all packages. If you have specific feedback, our writers will incorporate it at no extra charge.',
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="pr-4">{q}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
          {a}
        </div>
      )}
    </div>
  );
}

export default function CvServicePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1A3C6E] to-[#0f2447] text-white py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              UAE Recruitment Experts
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-4">
              Land 3× More Interviews<br className="hidden sm:block" /> with an ATS-Optimized CV
            </h1>
            <p className="text-blue-200 text-base sm:text-lg mb-8 max-w-xl mx-auto">
              75% of UAE recruiters use ATS software that filters CVs before humans see them. We make sure yours passes — and impresses.
            </p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi! I want to improve my CV for UAE jobs.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-8 py-4 rounded-xl transition-colors text-base"
            >
              <MessageCircle className="w-5 h-5" /> Get Started on WhatsApp
            </a>
            <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> 48-hour delivery</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> ATS-optimized</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" /> UAE specialists</span>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Choose Your Package</h2>
              <p className="text-gray-500 mt-2">All packages delivered in 48 hours via WhatsApp</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {CV_TIERS.map((tier) => (
                <div
                  key={tier.name}
                  className={`relative bg-white rounded-2xl border-2 p-6 flex flex-col ${tier.popular ? 'border-[#FF6B35] shadow-xl' : 'border-gray-200'}`}
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
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> {f}
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
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="text-gray-500 mt-2">Simple, fast, and done entirely on WhatsApp</p>
            </div>
            <div className="space-y-6">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#1A3C6E]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#FF6B35] uppercase tracking-wider mb-0.5">Step {step.step}</p>
                    <h3 className="font-bold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi! I want to get my CV rewritten for UAE jobs.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-8 py-4 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" /> Start on WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="bg-[#1A3C6E] text-white py-10 px-4">
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { num: '75%', label: 'of CVs never reach a human recruiter due to ATS filtering' },
              { num: '48h', label: 'average turnaround time from submission to delivery' },
              { num: '3×', label: 'more interview calls reported by our clients on average' },
            ].map((s) => (
              <div key={s.num}>
                <p className="text-4xl font-bold text-[#FFB400]">{s.num}</p>
                <p className="text-blue-200 text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 px-4 bg-gray-50">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq) => <FaqItem key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-14 px-4 bg-white text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ready to land more interviews?</h2>
            <p className="text-gray-500 mb-7">Get your UAE-ready CV delivered in 48 hours, starting at AED 40.</p>
            <a
              href={`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent('Hi! I want to improve my CV for UAE jobs.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-bold px-8 py-4 rounded-xl transition-colors text-base"
            >
              <MessageCircle className="w-5 h-5" /> Chat with Us on WhatsApp
            </a>
            <p className="mt-4 text-sm text-gray-400">Or browse jobs first: <Link href="/jobs" className="text-[#1A3C6E] hover:underline">View all UAE jobs →</Link></p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
