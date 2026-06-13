import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function SavedJobsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-bold text-[#1A3C6E] mb-6">Saved Jobs</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="text-5xl mb-4">🔖</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No saved jobs yet</h2>
          <p className="text-gray-500 text-sm mb-6">Jobs you save will appear here for easy access.</p>
          <a href="/jobs" className="inline-block bg-[#FF6B35] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#e55a24] transition-colors">
            Browse Jobs
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
