import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | UAE Careers',
  description: 'Learn about UAE Careers — your trusted gateway to job opportunities across the UAE.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#1A3C6E] mb-6">About UAE Careers</h1>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 prose prose-gray max-w-none">
            <p className="text-gray-600 text-lg leading-relaxed mb-4">
              UAE Careers is your trusted gateway to job opportunities across the United Arab Emirates.
              We aggregate walk-in interviews, job fairs, and open vacancies from top employers across
              Dubai, Abu Dhabi, Sharjah, and all other emirates.
            </p>
            <h2 className="text-xl font-semibold text-[#1A3C6E] mt-6 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              To connect talented professionals with UAE employers — quickly, transparently, and for free.
              We believe every job seeker deserves access to real opportunities without paying middlemen.
            </p>
            <h2 className="text-xl font-semibold text-[#1A3C6E] mt-6 mb-3">What We Offer</h2>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Daily walk-in interview listings across all UAE emirates</li>
              <li>CV optimization service by certified career consultants</li>
              <li>WhatsApp job alerts delivered to your phone every morning</li>
              <li>Salary guides and career resources for UAE professionals</li>
            </ul>
            <h2 className="text-xl font-semibold text-[#1A3C6E] mt-6 mb-3">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              Have questions? Reach us at{' '}
              <a href="mailto:ask@uaecareer.ae" className="text-[#FF6B35] hover:underline">
                ask@uaecareer.ae
              </a>{' '}
              or via{' '}
              <a
                href="https://wa.me/971556650797"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FF6B35] hover:underline"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
