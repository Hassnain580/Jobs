import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | UAE Careers',
  description: 'Terms and conditions for using the UAE Careers platform.',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#1A3C6E] mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: January 2026</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 text-gray-600 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">1. Acceptance of Terms</h2>
              <p>By accessing uaecareer.ae, you agree to these Terms of Service. If you do not agree, please do not use our platform.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">2. Use of the Platform</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>UAE Careers is a job listing aggregator — we do not guarantee employment</li>
                <li>You must not submit false or misleading information in applications</li>
                <li>Automated scraping of job listings is prohibited</li>
                <li>You are responsible for verifying the authenticity of any job listing</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">3. Fraud Warning</h2>
              <p>UAE Careers is not a recruiter and never charges job seekers. If anyone claims to be from UAE Careers and asks for payment, report it immediately to <a href="mailto:ask@uaecareer.ae" className="text-[#FF6B35] hover:underline">ask@uaecareer.ae</a>.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">4. Intellectual Property</h2>
              <p>All content on this platform (design, logos, text) is owned by UAE Careers and may not be reproduced without written permission.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">5. Limitation of Liability</h2>
              <p>UAE Careers is not liable for any losses arising from reliance on job listings or employer information on the platform. Always verify opportunities independently.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">6. Changes to Terms</h2>
              <p>We may update these terms at any time. Continued use of the platform constitutes acceptance of the revised terms.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
