import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | UAE Careers',
  description: 'How UAE Careers collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#1A3C6E] mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: January 2026</p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 text-gray-600 text-sm leading-relaxed">
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">1. Information We Collect</h2>
              <p>We collect information you provide directly (name, email, phone, CV) when you register, apply for jobs, or subscribe to our WhatsApp alerts. We also collect usage data (pages visited, search queries) to improve our service.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>To deliver job alerts and match you with relevant opportunities</li>
                <li>To process CV service orders and communicate with you</li>
                <li>To improve our platform and user experience</li>
                <li>We do not sell your personal information to third parties</li>
              </ul>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">3. Data Security</h2>
              <p>We use industry-standard encryption and security practices to protect your data. Access to personal information is restricted to authorized personnel only.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">4. Cookies</h2>
              <p>We use essential cookies for site functionality and analytics cookies to understand site usage. You can disable non-essential cookies in your browser settings.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">5. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time by emailing <a href="mailto:ask@uaecareer.ae" className="text-[#FF6B35] hover:underline">ask@uaecareer.ae</a>.</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold text-[#1A3C6E] mb-2">6. Contact</h2>
              <p>For privacy-related questions, contact us at <a href="mailto:ask@uaecareer.ae" className="text-[#FF6B35] hover:underline">ask@uaecareer.ae</a>.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
