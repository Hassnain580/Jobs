'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, MessageCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = `Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`;
    window.open(
      `mailto:ask@uaecareer.ae?subject=Contact from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(body)}`,
      '_blank'
    );
    setSubmitted(true);
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-[#1A3C6E] mb-2">Contact Us</h1>
          <p className="text-gray-500 mb-8">We&apos;d love to hear from you. Reach out through any channel below.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center gap-2">
              <Mail className="w-6 h-6 text-[#FF6B35]" />
              <p className="text-sm font-medium text-gray-700">Email</p>
              <a href="mailto:ask@uaecareer.ae" className="text-sm text-[#1A3C6E] hover:underline">ask@uaecareer.ae</a>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center gap-2">
              <MessageCircle className="w-6 h-6 text-[#25D366]" />
              <p className="text-sm font-medium text-gray-700">WhatsApp</p>
              <a href="https://wa.me/971556650797" target="_blank" rel="noopener noreferrer" className="text-sm text-[#1A3C6E] hover:underline">+971 55 665 0797</a>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col items-center text-center gap-2">
              <Clock className="w-6 h-6 text-[#1A3C6E]" />
              <p className="text-sm font-medium text-gray-700">Response Time</p>
              <p className="text-sm text-gray-500">Within 24 hours</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">Message Ready</h2>
                <p className="text-gray-500 text-sm">Your email client should have opened. If not, email us directly at ask@uaecareer.ae</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                    placeholder="Ahmed Al Mansouri"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E]"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A3C6E] resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#1A3C6E] hover:bg-[#0d2444] text-white font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
