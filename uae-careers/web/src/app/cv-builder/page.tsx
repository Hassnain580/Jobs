import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'AI CV Builder — Build a UAE-Ready CV | UAE Careers',
  description: 'Create a professional, ATS-optimised CV for UAE job applications. Powered by AI with 20-expert council intelligence — free.',
  alternates: { canonical: '/cv-builder' },
};

const FEATURES = [
  { icon: '🎯', title: 'ATS Score Engine', desc: 'Simulate how Workday, Taleo & Greenhouse parse your CV. Get a real score with fix-it actions.' },
  { icon: '✨', title: 'Achievement Transformer', desc: 'AI converts duty statements to quantified achievements using the STAR/CAR framework.' },
  { icon: '🇦🇪', title: 'UAE-Specific Intelligence', desc: 'Visa status, photo norms, UAE CV conventions, sector-specific guidance for UAE employers.' },
  { icon: '🔍', title: 'Job Match Analysis', desc: 'Paste any job description — AI shows keyword gaps and rewrites your CV to close them.' },
  { icon: '📊', title: 'Live Quality Scorecard', desc: '8-dimension real-time scoring: achievement orientation, keyword strength, ATS safety, and more.' },
  { icon: '🤖', title: '20-Expert AI Council', desc: 'Every suggestion synthesises a Senior Recruiter, ATS Specialist, Career Coach, HR Director, and 16 more experts.' },
];

const STEPS = [
  { n: '1', label: 'Choose your start', desc: 'Scratch, upload existing CV, or import from LinkedIn' },
  { n: '2', label: 'Build each section', desc: 'AI assists at every field with real-time suggestions' },
  { n: '3', label: 'Pick a template', desc: '24 templates — ATS-safe, executive, UAE bilingual' },
  { n: '4', label: 'Score & optimise', desc: 'Get your ATS score and run AI improvements' },
  { n: '5', label: 'Export & apply', desc: 'Download designed PDF, ATS-safe PDF, or Word doc' },
];

const EXPERTS = [
  'Senior Recruiter', 'ATS Specialist', 'HR Director', 'Certified CV Writer',
  'Career Coach', 'Hiring Manager', 'Data Analyst', 'Behavioural Psychologist',
  'UX Designer', 'Copywriter / Editor', 'UAE Industry Expert', 'MENA Cultural Consultant',
  'Personal Branding', 'LinkedIn Expert', 'UAE Labour Law', 'Interview Coach',
];

export default function CvBuilderLandingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#1A3C6E] to-[#0f2447] text-white py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Powered by 20-Expert AI Council
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Build a CV That Gets You<br />
              <span className="text-[#FF6B35]">Hired in the UAE</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Not just a template — a smart career assistant with real-time ATS scoring, achievement transformation, and deep UAE market intelligence baked in.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/cv-builder/builder"
                className="bg-[#FF6B35] text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-[#e55a24] transition-colors shadow-lg"
              >
                Start Building Free →
              </Link>
              <Link
                href="/cv-builder/builder?import=true"
                className="bg-white/10 border border-white/30 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/20 transition-colors"
              >
                Upload Existing CV
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/50">Free forever · No signup required to start · AED 29/mo for Premium AI</p>
          </div>
        </section>

        {/* Expert Council Strip */}
        <section className="bg-gray-50 border-y border-gray-200 py-6 px-4 overflow-hidden">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-xs text-gray-500 mb-3 uppercase tracking-wider font-semibold">Every suggestion comes from this council of experts</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXPERTS.map(e => (
                <span key={e} className="bg-white border border-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                  {e}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1A3C6E] text-center mb-2">What Makes This Different</h2>
            <p className="text-gray-500 text-center text-sm mb-10">Built specifically for the UAE job market. No global tool offers this.</p>
            <div className="grid md:grid-cols-3 gap-5">
              {FEATURES.map(f => (
                <div key={f.title} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-[#1A3C6E] mb-1.5 text-sm">{f.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1A3C6E] text-center mb-10">How It Works</h2>
            <div className="space-y-4">
              {STEPS.map(s => (
                <div key={s.n} className="flex items-center gap-5 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                  <div className="w-10 h-10 rounded-full bg-[#1A3C6E] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                    {s.n}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* UAE Specific callout */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-[#1A3C6E] to-[#0f2447] rounded-2xl p-8 text-white">
              <div className="text-3xl mb-4">🇦🇪</div>
              <h2 className="text-xl font-bold mb-3">Built for UAE — Not Adapted for It</h2>
              <div className="grid sm:grid-cols-2 gap-3 text-sm text-white/80">
                {[
                  'Photo guidance: UAE employers expect professional headshots',
                  'Visa status intelligence: Visit, Residence, Employment, Golden',
                  'Sector certifications: DHA, NEBOSH, CFA, ACCA, PMP for UAE',
                  'Salary & notice period fields — UAE norm on CVs',
                  'Arabic CV mode with RTL layout support',
                  'DIFC, SCA, Central Bank — UAE-specific qualification flags',
                  'Emiratisation awareness for public & semi-government roles',
                  'Emirate-specific guidance: Dubai, Abu Dhabi, Sharjah, Ajman, RAK',
                ].map(item => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-gray-50 text-center">
          <h2 className="text-2xl font-bold text-[#1A3C6E] mb-3">Ready to Build Your UAE CV?</h2>
          <p className="text-gray-500 text-sm mb-6">Join thousands of candidates who have optimised their CVs for the UAE market.</p>
          <Link
            href="/cv-builder/builder"
            className="inline-block bg-[#FF6B35] text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-[#e55a24] transition-colors shadow-lg"
          >
            Start Building Free →
          </Link>
        </section>

      </main>
      <Footer />
    </>
  );
}
