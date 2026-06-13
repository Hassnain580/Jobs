import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto px-4 py-12 w-full">
        <h1 className="text-2xl font-bold text-[#1A3C6E] mb-6">My Profile</h1>
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-[#1A3C6E] flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Name</h2>
              <p className="text-gray-500">user@email.com</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="/dashboard" className="block p-4 rounded-xl border border-gray-200 hover:border-[#1A3C6E] transition-colors">
              <div className="text-2xl mb-2">📋</div>
              <h3 className="font-semibold text-gray-800">My Applications</h3>
              <p className="text-sm text-gray-500">Track your job applications</p>
            </a>
            <a href="/saved-jobs" className="block p-4 rounded-xl border border-gray-200 hover:border-[#1A3C6E] transition-colors">
              <div className="text-2xl mb-2">🔖</div>
              <h3 className="font-semibold text-gray-800">Saved Jobs</h3>
              <p className="text-sm text-gray-500">Jobs you bookmarked</p>
            </a>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100">
            <a href="/auth/login" className="text-sm text-red-500 hover:underline">Sign out</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
